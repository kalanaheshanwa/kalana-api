#!/usr/bin/env tsx
import { getConfig } from '../config.mts';
import { newClient, quoteIdent } from './libs/index.mjs';

const config = getConfig();

const schemaQ = quoteIdent(config.APP_SCHEMA);
const adminQ = quoteIdent(config.POSTGRES_USER);
const ownerQ = quoteIdent(config.APP_OWNER);

const statements: string[] = [
  // allow admin to SET ROLE app_owner for owner-sensitive DDL
  /* SQL */ `GRANT ${ownerQ} TO ${adminQ}`,
  // drop & recreate schema owned by app_owner
  /* SQL */ `DROP SCHEMA IF EXISTS ${schemaQ} CASCADE`,
  /* SQL */ `CREATE SCHEMA ${schemaQ} AUTHORIZATION ${ownerQ}`,
  // drop membership again (principle of least privilege), - NOTE: dropping this will loose DBeaver reads/writes - because DBeaver can only connect using admin
  // /* SQL */ `REVOKE ${ownerQ} FROM ${adminQ}`,
];

(async () => {
  if (!process.argv.includes('--yes')) {
    console.error('This will DROP and recreate the schema. Re-run with --yes to proceed.');
    process.exit(1);
  }

  // connect as ADMIN DB role (ensure your LOCAL credentials map to admin for this command)
  const client = await newClient(config, 'admin');

  try {
    for (const s of statements) {
      console.log(s);
      await client.query(s);
    }

    console.log('✓ Schema reset.');
  } finally {
    await client.end();
  }

  await import('./migrate-apply.mts');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
