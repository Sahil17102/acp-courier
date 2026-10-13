import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "dist");

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js"]) {
  await fs.copyFile(path.join(root, file), path.join(output, file));
}

await fs.cp(path.join(root, "brand"), path.join(output, "brand"), { recursive: true });
console.log("ACP landing page prepared in dist/");
