import { getConfig } from '../config.mts';
import { newClient } from './libs/dsql.mts';
import { replacePlaceholders } from './libs/index.mjs';

// Aurora DB statements
export const statements: string[] = [
  /* SQL */ `DROP SCHEMA IF EXISTS ":APP_SCHEMA" CASCADE;`,

  // /* SQL */ `AWS IAM REVOKE ":APP_USER" FROM '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,
  // /* SQL */ `AWS IAM REVOKE ":APP_OWNER" FROM '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,

  /* SQL */ `DROP ROLE IF EXISTS ":APP_OWNER";`,
  /* SQL */ `CREATE ROLE ":APP_OWNER" WITH LOGIN;`,
  /* SQL */ `DROP ROLE IF EXISTS ":APP_USER";`,
  /* SQL */ `CREATE ROLE ":APP_USER" WITH LOGIN;`,

  // 👇 Allow admin to "be" app_owner for owner-sensitive DDL
  /* SQL */ `GRANT ":APP_OWNER" TO ":POSTGRES_USER";`,
  /* SQL */ `GRANT ":APP_USER" TO ":APP_OWNER";`,

  /* SQL */ `CREATE SCHEMA ":APP_SCHEMA" AUTHORIZATION ":APP_OWNER";`,

  /* SQL */ `AWS IAM GRANT ":APP_OWNER" TO '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,
  /* SQL */ `AWS IAM GRANT ":APP_USER" TO '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,

  /* SQL */ `ALTER ROLE ":APP_OWNER" SET search_path TO ":APP_SCHEMA";`,
  /* SQL */ `ALTER ROLE ":APP_USER" SET search_path TO ":APP_SCHEMA";`,
];

async function initDatabase() {
  const config = getConfig();

  // Enable TLS for non-local connections (e.g., Aurora DSQL)
  const client = await newClient(config, 'admin');

  const isConnected: Record<string, boolean> = {};

  try {
    // Default schema creations and owner privileges for all clients
    console.log('Attempting to connect to defaultDb client...');
    await client.connect();
    isConnected['client'] = true;
    console.log('Connected to defaultDb client.');
    for (const st of statements) {
      console.log(st);
      await client.query(replacePlaceholders(st, config));
    }
    console.log('Database initialized with necessary roles and permissions for defaultDb client.');
    await client.end();
    isConnected['client'] = false;
    console.log('Disconnected from defaultDb client.');
  } catch (error) {
    console.log(error);
  } finally {
    if (isConnected['client']) {
      await client.end();
    }
  }
}

initDatabase().catch((error) => {
  console.log(error);
  process.exit(-1);
});
