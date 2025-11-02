import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import pg from 'pg';
import { AppConfig } from './config.mjs';
import { adminStatements, appUserStatements } from './db-setup-statements.mts';

const { Client } = pg;

async function initDatabase() {
  const config = new AppConfig();

  // 1) Base creds come from your SSO profile
  const baseCreds = fromIni({ profile: 'kalanah-dev' }); // your SSO profile
  // 2) Assume into the IAM role that you mapped to the DB role via `AWS IAM GRANT`
  const dbRoleCreds = fromTemporaryCredentials({
    masterCredentials: baseCreds,
    params: {
      RoleArn: config.appAwsDbConnectRoleArn,
      RoleSessionName: 'db-init-local',
    },
  });

  const adminSigner = new DsqlSigner({
    hostname: config.postgresHost,
    credentials: baseCreds,
  });

  const userSigner = new DsqlSigner({
    hostname: config.postgresHost,
    credentials: dbRoleCreds,
  });

  // Enable TLS for non-local connections (e.g., Aurora DSQL)
  const useSsl = config.postgresHost !== 'localhost';
  const adminPassword = await adminSigner.getDbConnectAdminAuthToken();
  const userPassword = await userSigner.getDbConnectAuthToken();

  const defaultClient = new Client({
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: adminPassword,
    ssl: useSsl,
  });
  const defaultDbClient = new Client({
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: adminPassword,
    database: config.postgresDb,
    ssl: useSsl,
  });
  const appClient = new Client({
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.appOwner,
    password: userPassword,
    database: config.postgresDb,
    ssl: useSsl,
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
    isConnected['appClient2'] = true;
    console.log('Connected to app client.');
    for (const st of appUserStatements) {
      console.log(st);
      await appClient.query(replacePlaceholders(st, config));
    }
    console.log('Database initialized with necessary roles and permissions for app client.');
    await appClient.end();
    isConnected['appClient2'] = false;
    console.log('Disconnected from app client.');
  } catch (error) {
    console.log(error);
  } finally {
    if (isConnected['defaultClient']) {
      await defaultClient.end();
    }
    if (isConnected['defaultDbClient']) {
      await defaultDbClient.end();
    }
    if (isConnected['appClient2']) {
      await appClient.end();
    }
  }
}

function replacePlaceholders(sql: string, values: AppConfig) {
  let result = sql;

  for (const [placeholder, value] of Object.entries(values.unmodifiedEnv)) {
    result = result.replace(new RegExp(`":${placeholder}"`, 'g'), String(value));
  }
  return result;
}

initDatabase().catch((error) => {
  console.log(error);
  process.exit(-1);
});
