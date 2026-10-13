import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

export async function startDatabasePersistence(dataDir) {
  const connectionString = String(process.env.DATABASE_URL || "").trim();
  if (!connectionString) return { connected: false };

  await fsp.mkdir(dataDir, { recursive: true });
  const pool = new Pool({
    connectionString,
    ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? false : { rejectUnauthorized: false },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS acp_json_store (
      name TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query("SELECT name, payload FROM acp_json_store");
  for (const row of rows) {
    if (!/^[a-zA-Z0-9._-]+\.json$/.test(row.name)) continue;
    await fsp.writeFile(path.join(dataDir, row.name), `${JSON.stringify(row.payload, null, 2)}\n`, "utf8");
  }

  const syncFile = async (filename) => {
    if (!filename || !/^[a-zA-Z0-9._-]+\.json$/.test(filename)) return;
    try {
      const payload = JSON.parse(await fsp.readFile(path.join(dataDir, filename), "utf8"));
      await pool.query(
        `INSERT INTO acp_json_store (name, payload, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (name) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [filename, JSON.stringify(payload)],
      );
    } catch (error) {
      if (error?.code !== "ENOENT") console.error(`Database sync failed for ${filename}`, error);
    }
  };

  for (const filename of await fsp.readdir(dataDir)) await syncFile(filename);

  const timers = new Map();
  fs.watch(dataDir, { persistent: false }, (_event, filename) => {
    const name = filename?.toString();
    if (!name?.endsWith(".json")) return;
    clearTimeout(timers.get(name));
    timers.set(name, setTimeout(() => {
      timers.delete(name);
      syncFile(name);
    }, 150));
  });

  return { connected: true, pool };
}
