import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPage } from "../src/render.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const assetData = join(root, "src/assets-data");
const assets = [
  "hero-risset-divino.png",
  "identidade-risset.png",
  "logo-risset.png",
  "plano-divino.png",
  "risset-tema-instrumental.wav",
  "sete-promulgacoes.png",
];

async function restoreAsset(fileName) {
  const parts = (await readdir(assetData))
    .filter((file) => file.startsWith(`${fileName}.part`))
    .sort();

  if (parts.length === 0) {
    throw new Error(`Asset sem partes: ${fileName}`);
  }

  const base64 = (
    await Promise.all(parts.map((part) => readFile(join(assetData, part), "utf8")))
  ).join("");

  await writeFile(join(dist, "assets", fileName), Buffer.from(base64, "base64"));
}

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "assets"), { recursive: true });

await writeFile(join(dist, "index.html"), renderPage(), "utf8");
await cp(join(root, "src/styles/main.css"), join(dist, "styles.css"));
await cp(join(root, "src/scripts/sound.js"), join(dist, "app.js"));
await Promise.all(assets.map(restoreAsset));

console.log("Build concluído em dist/");
