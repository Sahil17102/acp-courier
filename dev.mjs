import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const panel = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["--prefix", "user-panel", "run", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

const server = createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = normalize(join(root, requested));

  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(response);
});

server.listen(4173, "127.0.0.1", () => {
  console.log("ACP landing page: http://localhost:4173");
  console.log("ACP user panel:   http://localhost:5176/login");
});

function shutdown() {
  server.close();
  panel.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
