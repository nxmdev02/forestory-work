// Use the workspace's portable Node, when present, without modifying global Node.
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const local = resolve(
  root,
  ".tools",
  process.platform === "win32" ? "node.exe" : "node",
);
const runtime = existsSync(local) ? local : process.execPath;
const env = { ...process.env };
const pathKey =
  Object.keys(env).find((key) => key.toLowerCase() === "path") || "PATH";
env[pathKey] =
  `${dirname(runtime)}${process.platform === "win32" ? ";" : ":"}${env[pathKey] || ""}`;
const child = spawn(
  runtime,
  [resolve(root, "node_modules/nuxt/bin/nuxt.mjs"), ...process.argv.slice(2)],
  { cwd: root, env, stdio: "inherit" },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
