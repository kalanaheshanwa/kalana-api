#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { getConfig } from '../config.mts';
import { newClient, quoteIdent, sha256 } from '../libs/dsql.mts';
import { splitSQL } from '../libs/split-sql.mjs';

const config = getConfig();

const MIG_DIR = path.resolve('migrations');
const schemaQ = quoteIdent(config.APP_SCHEMA);
const MIG_TABLE = `${schemaQ}.__migrations`;

function listMigrations() {
  if (!fs.existsSync(MIG_DIR)) return [];
  const files = fs.readdirSync(MIG_DIR).filter((f) => f.toLowerCase().endsWith('.sql'));
  files.sort(); // timestamp prefix: lexicographic == chronological
  return files.map((f) => ({ id: f, path: path.join(MIG_DIR, f) }));
}

async function ensureMigrationsTable(client: Client) {
  await client.query(/* SQL */ `
    CREATE TABLE IF NOT EXISTS ${MIG_TABLE} (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now(),
      checksum text NOT NULL
    )
  `);
}

async function appliedSet(client: Client) {
  const { rows } = await client.query<{ id: string }>(/* SQL */ `SELECT id FROM ${MIG_TABLE} ORDER BY id`);
  const set = new Set<string>();
  for (const r of rows) set.add(r.id);
  return set;
}

async function applyFile(client: Client, id: string, filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const checksum = sha256(sql);
  const stmts = splitSQL(sql);

  for (const s of stmts) {
    // IMPORTANT: DSQL → exactly one DDL per autocommit statement. No BEGIN/COMMIT here.
    console.log('\n--------------------STATEMENT--------------------\n', s);
    await client.query(s);
  }

  await client.query(`INSERT INTO ${MIG_TABLE} (id, checksum) VALUES ($1, $2)`, [id, checksum]);
}

(async () => {
  const client = await newClient({
    region: config.APP_AWS_DB_REGION,
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    dbUser: config.APP_OWNER, // connect as app_owner (owns schema)
    credentials: {
      type: 'ssoAssume',
      profile: config.APP_AWS_PROFILE,
      roleArn: config.APP_AWS_DB_CONNECT_ROLE_ARN,
    },
  });

  try {
    await client.query(/* SQL */ `SET search_path TO ${schemaQ}`);
    await ensureMigrationsTable(client);

    const applied = await appliedSet(client);
    const files = listMigrations();

    const pending = files.filter((f) => !applied.has(f.id));
    if (pending.length === 0) {
      console.log('✓ No pending migrations.');
      return;
    }

    for (const f of pending) {
      console.log(`→ applying ${f.id}`);
      await applyFile(client, f.id, f.path);
      console.log(`✓ applied ${f.id}`);
    }

    console.log('All pending migrations applied.');
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
