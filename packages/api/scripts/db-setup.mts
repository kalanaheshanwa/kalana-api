import fs from 'fs/promises';
import { dirname } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { AppConfig } from './config.mjs';

const DELAY = 1_000;
const { Client } = pg;

async function initDatabase() {
  const config = new AppConfig();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const defaultClient = new Client({
    connectionString: config.dbServerUrl,
  });
  const defaultDbClient = new Client({
    connectionString: config.dbUrl,
  });
  const appClient = new Client({
    connectionString: config.appDbUrl,
  });
  const shadowClient = new Client({
    connectionString: config.shadowDbUrl,
  });

  const isConnected: Record<string, boolean> = {};

  try {
    if (config.isDev) {
      await defaultClient.connect();
      isConnected['defaultClient'] = true;
      console.log('Connected to default client.');

      // Creating database
      await defaultClient.query(`DROP DATABASE IF EXISTS ${config.postgresDb};`);
      console.log(`Database ${config.postgresDb} dropped.`);
      await defaultClient.query(`CREATE DATABASE ${config.postgresDb}`);
      console.log(`Database ${config.postgresDb} created.`);
      // Creating shadow database
      await defaultClient.query(`DROP DATABASE IF EXISTS ${config.postgresDbShadow};`);
      console.log(`Database ${config.postgresDbShadow} dropped.`);
      await defaultClient.query(`CREATE DATABASE ${config.postgresDbShadow}`);
      console.log(`Database ${config.postgresDbShadow} created.`);

      await defaultClient.end();
      isConnected['defaultClient'] = false;
      console.log('Disconnected from default client.');

      // Shadow setup
      const shadowSql = await fs.readFile(`${__dirname}/db-shadow-setup.sql`, 'utf-8');
      const parsedShadowSql = replacePlaceholders(shadowSql, config);

      await shadowClient.connect();
      isConnected['shadowClient'] = true;
      console.log(`Connected to shadow client.`);
      await shadowClient.query(parsedShadowSql);
      console.log('Database initialized with necessary roles and permissions for shadow client.');
      await shadowClient.end();
      isConnected['shadowClient'] = false;
      console.log(`Disconnected from shadow client.`);
    }

    // Default schema creations and owner privileges for all clients
    const defaultSql = await fs.readFile(`${__dirname}/db-setup.sql`, 'utf-8');
    const parsedDefaultSql = replacePlaceholders(defaultSql, config);

    await defaultDbClient.connect();
    isConnected['defaultDbClient'] = true;
    console.log('Connected to defaultDb client.');
    await delay(config);
    await defaultDbClient.query(parsedDefaultSql);
    console.log('Database initialized with necessary roles and permissions for defaultDb client.');
    await delay(config);
    await defaultDbClient.end();
    isConnected['defaultDbClient'] = false;
    console.log('Disconnected from defaultDb client.');

    // App client specific privileges
    const appSql = await fs.readFile(`${__dirname}/db-app-setup.sql`, 'utf-8');
    const parsedAppSql = replacePlaceholders(appSql, config);

    await delay(config);
    await appClient.connect();
    isConnected['appClient'] = true;
    console.log('Connected to app client.');
    await delay(config);
    await appClient.query(parsedAppSql);
    console.log('Database initialized with necessary roles and permissions for app client.');
    await delay(config);
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

function replacePlaceholders(sql: string, values: AppConfig) {
  let result = sql;

  for (const [placeholder, value] of Object.entries(values.unmodifiedEnv)) {
    result = result.replace(new RegExp(`":${placeholder}"`, 'g'), String(value));
  }
  return result;
}

/**
 * Delays the execution of code for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns A Promise that resolves after the specified delay.
 */
function delay(config: AppConfig, ms: number = DELAY): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve();
      },
      config.isDev ? 0 : ms,
    );
  });
}

initDatabase().catch((error) => {
  console.log(error);
  process.exit(-1);
});
