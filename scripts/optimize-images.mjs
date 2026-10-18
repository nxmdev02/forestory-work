import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "public/images/optimized");
const manifestPath = join(root, "app/data/image-manifest.json");
const widths = [320, 480, 768, 1024, 1440, 1920];
const sources = new Set();

// Only build images referenced by the app, including newly registered photos.
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(vue|ts|json)$/.test(entry.name) && path !== manifestPath) {
      const source = await readFile(path, "utf8");
      for (const match of source.matchAll(/\/images\/[\w./-]+\.(?:webp|png|jpe?g)/g)) {
        if (!match[0].startsWith("/images/optimized/")) sources.add(match[0]);
      }
    }
  }
}

await collect(join(root, "app"));
await mkdir(output, { recursive: true });
const manifest = {};
let generated = 0;
for (const src of [...sources].sort()) {
  const input = await readFile(join(root, "public", src));
  const metadata = await sharp(input).metadata();
  const width = metadata.autoOrient.width;
  const height = metadata.autoOrient.height;
  const hash = createHash("sha256")
    .update(input).update(JSON.stringify({ widths, quality: 80, sharp: sharp.versions }))
    .digest("hex").slice(0, 12);
  const candidates = [...new Set([...widths.filter(size => size < width), Math.min(width, 1920)])];
  const variants = [];
  for (const size of candidates) {
    const filename = `${parse(src).name}-${hash}-${size}.webp`;
    const target = join(output, filename);
    if (!existsSync(target)) {
      await sharp(input).rotate().resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 }).toFile(target);
      generated++;
    }
    variants.push(`/images/optimized/${filename} ${size}w`);
  }
  manifest[src] = { width, height, srcset: variants.join(", ") };
}
const json = `${JSON.stringify(manifest, null, 2)}\n`;
if (!existsSync(manifestPath) || await readFile(manifestPath, "utf8") !== json) {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, json);
}
console.log(`Images: ${sources.size} sources, ${generated} new responsive variants.`);
