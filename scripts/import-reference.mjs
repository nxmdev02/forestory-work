// One-time reference asset importer. The app itself only reads local data and files.
import { load } from "cheerio";
import { readFile, writeFile, mkdir, access } from "node:fs/promises";

const origin = "https://dsgninterior.se";
await mkdir("public/images", { recursive: true });
await mkdir("public/fonts", { recursive: true });
await mkdir("app/data", { recursive: true });
await mkdir(".reference", { recursive: true });
const manifest = [];
const jobs = [];
function asset(url, name) {
  if (!url) throw new Error(`Missing asset: ${name}`);
  const path = `/images/${name}.${url.split(".").pop()}`;
  jobs.push({ url, path });
  return path;
}
function image($, node, name, width = 1500) {
  const sources = $(node).find('source[type="image/webp"]').toArray();
  const source = sources.find((el) => !$(el).attr("media")) || sources[0];
  const img = $(node).find("img").first();
  const srcset = source
    ? $(source).attr("data-srcset") || $(source).attr("srcset")
    : img.attr("data-srcset") || img.attr("srcset");
  if (!srcset) return asset(img.attr("src"), name);
  const choices = srcset.split(",").map((s) => {
    const [url, w] = s.trim().split(/\s+/);
    return { url, width: parseInt(w) };
  });
  const selected = choices.find((c) => c.width >= width) || choices.at(-1);
  return asset(selected.url, name);
}
async function html(name, url) {
  try {
    return load(await readFile(`.reference/${name}.html`, "utf8"));
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}: ${url}`);
    const text = await res.text();
    await writeFile(`.reference/${name}.html`, text);
    return load(text);
  }
}
const $list = await html("projects", `${origin}/en/projects`);
const projects = [];
for (const link of $list(".works-grid .work-link").toArray()) {
  const url = $list(link).attr("href");
  const slug = url.split("/").pop();
  const $ = await html(slug === "fellowmind-goteborg" ? "detail" : slug, url);
  const specs = {};
  $(".work-specs dt").each((_, el) => {
    specs[$(el).text().trim()] = $(el).next("dd").text().trim();
  });
  projects.push({
    slug,
    title: $list(link).find(".work-title").text().trim(),
    thumbnail: image(
      $list,
      $list(link).find(".img-color").first(),
      `${slug}-thumb`,
      900,
    ),
    image: image($, $(".work-banner"), `${slug}-hero`, 1920),
    objectPosition: "center",
    mobileObjectPosition: "center",
    specs,
    summary: $(".work-text .presentation").text().trim(),
    paragraphs: $(".readmore-content p")
      .toArray()
      .map((el) => $(el).text().trim()),
    gallery: $(".work-gallery .block-image")
      .toArray()
      .slice(0, 8)
      .map((el, i) => ({
        src: image($, el, `${slug}-gallery-${i + 1}`, 1500),
        colSpan: Number($(el).attr("data-columns") || 2) / 2,
        alt: `${$list(link).find(".work-title").text().trim()} — interior detail ${i + 1}`,
        objectPosition: "center",
      })),
  });
}
const $home = await html("home", `${origin}/en`);
const intro = {
  image: image($home, $home("#banner-0 picture").first(), "intro", 1920),
  video: asset($home("#banner-0 video source").attr("src"), "intro"),
};
const $archive = await html("archive", `${origin}/en/dsgn-archive`);
const archiveItems = $archive(".archive")
  .toArray()
  .slice(0, 3)
  .map((el, i) => {
    const values = $archive(el)
      .find("dd")
      .toArray()
      .map((dd) => $archive(dd).text().trim());
    return {
      archiveNumber: $archive(el).find(".archive-title").text().split("#")[1],
      image: image(
        $archive,
        $archive(el).find(".img-color").first(),
        `archive-${i}`,
        900,
      ),
      object: values[0],
      quantity: values[1],
      condition: values[2],
      price: values[3],
      currency: "SEK",
      status: "available",
    };
  });
const $office = await html("office", `${origin}/en/office`);
const office = {
  title: $office(".office-presentation").text().trim(),
  image: image(
    $office,
    $office(".office-banner picture").first(),
    "office",
    1500,
  ),
  paragraphs: $office(".office-readmore p")
    .toArray()
    .map((el) => $office(el).text().trim()),
  team: $office(".team-member")
    .toArray()
    .map((el, i) => ({
      name: $office(el).find(".member-name").text().trim(),
      role: $office(el).find(".member-role").text().trim(),
      image: image($office, el, `team-${i}`, 600),
    })),
  process: $office(".process")
    .toArray()
    .map((el, i) => ({
      title: $office(el).find(".process-title").text().trim(),
      description: $office(el).find(".process-description").text().trim(),
      image: image($office, el, `process-${i}`, 900),
    })),
};
for (const [weight, file] of [
  ["regular", "cera-pro-regular-CwimqKm_.woff2"],
  ["medium", "cera-pro-medium-DV8UpULI.woff2"],
  ["bold", "cera-pro-bold-CyeSMuz-.woff2"],
]) {
  jobs.push({
    url: `${origin}/dist/assets/${file}`,
    path: `/fonts/cera-${weight}.woff2`,
  });
}
let next = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        await access(`public${job.path}`);
      } catch {
        const res = await fetch(job.url);
        if (!res.ok) throw new Error(`${res.status}: ${job.url}`);
        await writeFile(
          `public${job.path}`,
          Buffer.from(await res.arrayBuffer()),
        );
      }
      manifest.push(job);
    }
  }),
);
await writeFile(
  "app/data/reference.json",
  JSON.stringify({ intro, projects, archiveItems, office }, null, 2),
);
await writeFile("public/asset-sources.json", JSON.stringify(manifest, null, 2));
console.log(
  `Imported ${projects.length} projects and ${jobs.length} local assets.`,
);
