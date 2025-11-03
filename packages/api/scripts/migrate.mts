#!/usr/bin/env tsx
import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getConfig } from './config.mts';

const sh = promisify(execFile);

type Mode = { type: 'ssoAssume'; profile: string; region: string; roleArn: string }; // Local: SSO -> assume DB IAM role

function pgUrl(u: { host: string; user: string; db: string; schema: string; token: string }) {
  return `postgresql://${encodeURIComponent(u.user)}:${encodeURIComponent(u.token)}@${u.host}:5432/${encodeURIComponent(u.db)}?schema=${u.schema}&sslmode=require`;
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
  if (!cmd) {
    console.error('Usage: prisma-run <deploy|dev|push|status|reset> [-- ...pass-through]');
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
    user: config.APP_OWNER,
    db: config.POSTGRES_DB,
    schema: config.APP_SCHEMA,
    token,
  });

  const prismaArgs = (() => {
    switch (cmd) {
      case 'deploy':
        return ['prisma', 'migrate', 'deploy'];
      case 'dev':
        return ['prisma', 'migrate', 'dev', '--skip-seed'];
      case 'push':
        return ['prisma', 'db', 'push'];
      case 'status':
        return ['prisma', 'migrate', 'status'];
      case 'reset':
        return ['prisma', 'migrate', 'reset', '--skip-seed'];
      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  })();

  // pass-through args after "--"
  const dd = process.argv.indexOf('--');
  if (dd !== -1) {
    prismaArgs.push(...process.argv.slice(dd + 1));
  }

  console.log(`→ Running: npx ${prismaArgs.join(' ')}`);
  await sh('yarn', ['exec', ...prismaArgs], {
    env: {
      ...process.env,
      DATABASE_URL,
    },
    shell: true,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
