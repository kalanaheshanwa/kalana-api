import { Client } from 'pg';
import { getDevConfig } from './config.mts';
import { devAdminStatements, devAppUserStatements, shadowStatements } from './statements.mts';
import { replacePlaceholders } from './utils.mts';

async function initDatabaseLocal() {
  const config = getDevConfig();
  const isConnected: Record<string, boolean> = {};

  const defaultClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
  });
  const defaultDbClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
  });
  const appClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.APP_OWNER,
    password: config.APP_OWNER_PASSWORD,
  });
  const shadowClient = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB_SHADOW,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
  });

  try {
    await defaultClient.connect();
    isConnected['defaultClient'] = true;
    console.log('Connected to default client.');

    // Creating database
    await defaultClient.query(`DROP DATABASE IF EXISTS ${config.POSTGRES_DB};`);
    console.log(`Database ${config.POSTGRES_DB} dropped.`);
    await defaultClient.query(`CREATE DATABASE ${config.POSTGRES_DB}`);
    console.log(`Database ${config.POSTGRES_DB} created.`);
    // Creating shadow database
    await defaultClient.query(`DROP DATABASE IF EXISTS ${config.POSTGRES_DB_SHADOW};`);
    console.log(`Database ${config.POSTGRES_DB_SHADOW} dropped.`);
    await defaultClient.query(`CREATE DATABASE ${config.POSTGRES_DB_SHADOW}`);
    console.log(`Database ${config.POSTGRES_DB_SHADOW} created.`);

    await defaultClient.end();
    isConnected['defaultClient'] = false;
    console.log('Disconnected from default client.');

    // Shadow setup
    await shadowClient.connect();
    isConnected['shadowClient'] = true;
    console.log(`Connected to shadow client.`);
    for (const st of shadowStatements) {
      console.log(st);
      await shadowClient.query(replacePlaceholders(st, config));
    }
    console.log('Database initialized with necessary roles and permissions for shadow client.');
    await shadowClient.end();
    isConnected['shadowClient'] = false;
    console.log(`Disconnected from shadow client.`);

    // Default schema creations and owner privileges for all clients
    await defaultDbClient.connect();
    isConnected['defaultDbClient'] = true;
    console.log('Connected to defaultDb client.');
    for (const st of devAdminStatements) {
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
    for (const st of devAppUserStatements) {
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
    if (isConnected['defaultClient']) {
      await defaultClient.end();
    }
    if (isConnected['defaultDbClient']) {
      await defaultDbClient.end();
    }
    if (isConnected['appClient']) {
      await appClient.end();
    }
    if (isConnected['shadowClient']) {
      await shadowClient.end();
    }
  }
}

initDatabaseLocal().catch((error) => {
  console.log(error);
  process.exit(-1);
});
