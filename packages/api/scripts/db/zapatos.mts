import { DsqlSigner } from '@aws-sdk/dsql-signer';
import * as zg from 'zapatos/generate';
import { getConfig } from '../config.mts';
import { getAwsCredentials } from './libs/index.mts';

const config = getConfig();

(async () => {
  const signer = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    region: config.APP_AWS_DB_REGION,
    credentials: await getAwsCredentials({ type: 'base', profile: config.APP_AWS_PROFILE }),
  });

  await zg.generate({
    db: {
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      user: config.POSTGRES_USER,
      database: config.POSTGRES_DB,
      password: await signer.getDbConnectAdminAuthToken(),
      ssl: { rejectUnauthorized: true },
      keepAlive: true,
    },
    schemas: {
      [config.APP_SCHEMA]: {
        include: '*',
        exclude: ['__migrations'],
      },
    },
    outDir: './generated',
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
