import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import pg from 'pg';
import { getConfig } from './config.mjs';
import { adminStatements, appUserStatements } from './statements.mts';
import { replacePlaceholders } from './utils.mts';

const { Client } = pg;

async function initDatabase() {
  const config = getConfig();

  // 1) Base creds come from your SSO profile
  const baseCreds = fromIni({ profile: 'kalanah-dev' }); // your SSO profile
  // 2) Assume into the IAM role that you mapped to the DB role via `AWS IAM GRANT`
  const dbRoleCreds = fromTemporaryCredentials({
    masterCredentials: baseCreds,
    params: {
      RoleArn: config.APP_AWS_DB_CONNECT_ROLE_ARN,
      RoleSessionName: 'db-init-local',
    },
  });

  const adminSigner = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    credentials: baseCreds,
  });

  const userSigner = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    credentials: dbRoleCreds,
  });

  // Enable TLS for non-local connections (e.g., Aurora DSQL)
  const adminPassword = await adminSigner.getDbConnectAdminAuthToken();
  const userPassword = await userSigner.getDbConnectAuthToken();

  const defaultDbClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: adminPassword,
    database: config.POSTGRES_DB,
    ssl: true,
  });
  const appClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.APP_OWNER,
    password: userPassword,
    database: config.POSTGRES_DB,
    ssl: true,
  });

  const isConnected: Record<string, boolean> = {};

  try {
    // Default schema creations and owner privileges for all clients
    console.log('Attempting to connect to defaultDb client...');
    await defaultDbClient.connect();
    isConnected['defaultDbClient'] = true;
    console.log('Connected to defaultDb client.');
    for (const st of adminStatements) {
      console.log(st);
      await defaultDbClient.query(replacePlaceholders(st, config));
    }
    console.log('Database initialized with necessary roles and permissions for defaultDb client.');
    await defaultDbClient.end();
    isConnected['defaultDbClient'] = false;
    console.log('Disconnected from defaultDb client.');

    // App client specific privileges
    await appClient.connect();
    isConnected['appClient'] = true;
    console.log('Connected to app client.');
    for (const st of appUserStatements) {
      console.log(st);
      await appClient.query(replacePlaceholders(st, config));
    }
    console.log('Database initialized with necessary roles and permissions for app client.');
    await appClient.end();
    isConnected['appClient'] = false;
    console.log('Disconnected from app client.');
  } catch (error) {
    console.log(error);
  } finally {
    if (isConnected['defaultDbClient']) {
      await defaultDbClient.end();
    }
    if (isConnected['appClient']) {
      await appClient.end();
    }
  }
}

initDatabase().catch((error) => {
  console.log(error);
  process.exit(-1);
});
