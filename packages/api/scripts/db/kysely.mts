import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { Kysely, PostgresDialect } from 'kysely';
import { DB, generate, getDialect } from 'kysely-codegen';
import { Pool } from 'pg';
import { getConfig } from '../config.mts';
import { getAwsCredentials } from './libs/index.mts';

const config = getConfig();

(async () => {
  const signer = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    region: config.APP_AWS_DB_REGION,
    credentials: await getAwsCredentials({ type: 'base', profile: config.APP_AWS_PROFILE }),
  });

  await generate({
    outFile: './generated/kysely/schema.d.ts',
    defaultSchemas: ['app_public'],
    includePattern: 'app_public.*',
    excludePattern: '__migrations',
    singularize: true,
    dialect: getDialect('postgres'),
    db: new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: config.POSTGRES_HOST,
          port: config.POSTGRES_PORT,
          user: config.POSTGRES_USER,
          database: config.POSTGRES_DB,
          password: await signer.getDbConnectAdminAuthToken(),
          ssl: { rejectUnauthorized: true },
          keepAlive: true,
        }),
      }),
    }),
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
