import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import sql from './client';

async function migrate() {
  // Ensure migrations tracking table exists
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT        PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const [already] = await sql`
      SELECT 1 FROM schema_migrations WHERE filename = ${file}
    `;
    if (already) {
      console.log(`[migrate] skip  ${file}`);
      continue;
    }

    const sqlText = readFileSync(join(migrationsDir, file), 'utf-8');
    await sql.unsafe(sqlText);
    await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`;
    console.log(`[migrate] apply ${file}`);
  }

  await sql.end();
  console.log('[migrate] done');
}

migrate().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
