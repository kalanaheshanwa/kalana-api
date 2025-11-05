#!/usr/bin/env tsx
import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getConfig } from './config.mts';

const sh = promisify(execFile);

type Mode = { type: 'ssoAssume'; profile: string; region: string; roleArn: string }; // Local: SSO -> assume DB IAM role

function pgUrl(u: {
  host: string;
  port: number;
  user: string;
  db: string;
  schema: string;
  token: string;
  ssl: boolean;
}) {
  console.log(
    'PG URL:',
    `postgresql://${encodeURIComponent(u.user)}:<token>@${u.host}:${u.port}/${encodeURIComponent(u.db)}?schema=${u.schema}${u.ssl ? '&sslmode=require' : ''}`,
  );
  return `postgresql://${encodeURIComponent(u.user)}:${encodeURIComponent(u.token)}@${u.host}:${u.port}/${encodeURIComponent(u.db)}?schema=${u.schema}${u.ssl ? '&sslmode=require' : ''}`;
}

async function getAwsCreds(mode: Mode) {
  const base = fromIni({ profile: mode.profile });
  return fromTemporaryCredentials({
    masterCredentials: base,
    params: { RoleArn: mode.roleArn, RoleSessionName: 'prisma-migrate' },
  })();
}

async function signToken(host: string, mode: Mode) {
  const credentials = await getAwsCreds(mode);
  const signer = new DsqlSigner({ hostname: host, region: mode.region, credentials });
  return signer.getDbConnectAuthToken();
}

async function main() {
  const cmd = process.argv[2]; // deploy | dev | push | status | reset
  const migrationName = process.argv[3];

  if (!cmd) {
    console.error('Usage: prisma-run <deploy|dev|push|status|reset> [-- ...pass-through]');
    process.exit(1);
  }
  if (['applied', 'rolled-back'].includes(cmd) && !migrationName) {
    console.error('Migration name required for this operation');
    process.exit(1);
  }

  const config = getConfig();

  const token = await signToken(config.POSTGRES_HOST, {
    type: 'ssoAssume',
    profile: config.APP_AWS_PROFILE,
    roleArn: config.APP_AWS_DB_CONNECT_ROLE_ARN,
    region: config.APP_AWS_DB_REGION,
  });
  const DATABASE_URL = pgUrl({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.APP_OWNER,
    db: config.POSTGRES_DB,
    schema: config.APP_SCHEMA,
    token,
    ssl: true,
  });

  const prismaArgs = (() => {
    switch (cmd) {
      case 'deploy':
        return ['prisma', 'migrate', 'deploy'];
      case 'status':
        return ['prisma', 'migrate', 'status'];
      case 'applied':
        return ['prisma', 'migrate', 'resolve', '--applied', migrationName];
      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  })();

  console.log(`Running: yarn exec ${prismaArgs.join(' ')}`);
  await sh('yarn', ['exec', ...prismaArgs], {
    env: {
      ...process.env,
      DATABASE_URL,
    },
    shell: true,
  });
  console.log('Migrations applied');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
