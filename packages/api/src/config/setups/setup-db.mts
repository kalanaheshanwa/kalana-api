import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as db from 'zapatos/db';
import { DB } from '../../../generated/kysely/schema.js';
import { Logger } from '../../utils/index.mjs';
import { AppConfig } from '../app-config.mjs';
import { resolveAwsCredentials } from './utils.mjs';

// Sets a max overall life for the connection.
// A value of 60 would evict connections that have been around for over 60 seconds,
// regardless of whether they are idle. It's useful to force rotation of connection pools through
// middleware so that you can rotate the underlying servers. The default is disabled (value of zero)
const MAX_CONN_LIFETIME_SECONDS = 55 * 60;
// number of milliseconds to wait before timing out when connecting a new client
// by default this is 0 which means no timeout
const CONNECTION_TIMEOUT_MS = 10_000;
// number of milliseconds a client must sit idle in the pool and not be checked out
// before it is disconnected from the backend and discarded
// default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
const IDLE_TIMEOUT_MS = 30_000;

const TRANSACTION_MAX_ATTEMPTS = 5;
const TRANSACTION_DELAY_MAX_MS = 250;
const TRANSACTION_DELAY_MIN_MS = 25;

const logger = new Logger({ context: 'setup-db' });

export interface DbSetupResult {
  pool: Pool;
  dispose: () => Promise<void>;
  db: Kysely<DB>;
}

export async function setupDb(config: AppConfig): Promise<DbSetupResult> {
  const passwordProvider = await buildTokenProvider(config);

  db.setConfig({
    transactionAttemptsMax: TRANSACTION_MAX_ATTEMPTS,
    transactionRetryDelay: { minMs: TRANSACTION_DELAY_MIN_MS, maxMs: TRANSACTION_DELAY_MAX_MS },
    queryListener: (query, txnId) => logger.debug('QUERY', { query, txnId }),
    resultListener: (result, txnId, elapsedMs) =>
      logger.debug('RESULT', { elapsedMs: elapsedMs?.toFixed(1), result, txnId }),
    transactionListener: (message, txnId) => logger.debug('TXN', { message, txnId }),
  });

  const pool = new Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
    maxLifetimeSeconds: MAX_CONN_LIFETIME_SECONDS,
    user: config.APP_USER,
    password: passwordProvider,
    ssl: { rejectUnauthorized: true },
  });

  pool.on('error', (error) => {
    logger.error('Unexpected error on idle client', { err: error });
    process.kill(process.pid, 'SIGTERM');
  });

  const dialect = new PostgresDialect({
    pool,
  });

  return {
    pool,
    dispose: () => pool.end(),
    db: new Kysely<DB>({
      dialect,
      log: ['query', 'error'],
    }),
  };
}

async function buildTokenProvider(config: AppConfig): Promise<() => Promise<string>> {
  const credentials = await resolveAwsCredentials(config, 'db-assume');
  const signer = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    region: config.APP_AWS_DB_REGION,
    credentials,
  });

  return () => signer.getDbConnectAuthToken();
}
