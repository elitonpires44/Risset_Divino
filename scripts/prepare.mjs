import { cp, mkdir } from "node:fs/promises";
import "./build.mjs";
await mkdir("public", { recursive: true });
await cp("dist/assets", "public/assets", { recursive: true });
await cp("dist/styles.css", "public/styles.css");
await cp("dist/app.js", "public/app.js");
