#!/usr/bin/env tsx
import { getConfig } from '../config.mts';
import { newClient, quoteIdent } from './libs/index.mjs';

const config = getConfig();

const schemaQ = quoteIdent(config.APP_SCHEMA);
const appUserQ = quoteIdent(config.APP_USER);

const statements: string[] = [
  /* SQL */ `SET search_path TO ${schemaQ}`,
  /* SQL */ `GRANT USAGE ON SCHEMA ${schemaQ} TO ${appUserQ}`,
  // Existing objects in the schema (tables/views)
  /* SQL */ `GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA ${schemaQ} TO ${appUserQ}`,
  // If you need DELETE, uncomment:
  // /* SQL */`GRANT DELETE ON ALL TABLES IN SCHEMA ${schemaQ} TO ${appUserQ}`
];

(async () => {
  const client = await newClient(config, 'owner');

  try {
    for (const s of statements) {
      console.log(s);
      await client.query(s);
    }

    console.log(`✓ Granted ${appUserQ} access on schema and existing tables.`);
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
