import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { createHash } from 'node:crypto';
import { Client } from 'pg';
import { ConfigValue } from '../../config.mts';

export type CredentialMode =
  | { type: 'env' }
  | { type: 'base'; profile: string }
  | { type: 'ssoAssume'; profile: string; roleArn: string };

export function quoteIdent(id: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(id)) throw new Error(`Invalid identifier: ${id}`);
  return `"${id}"`;
}

export async function getAwsCredentials(mode: CredentialMode) {
  if (mode.type === 'env') {
    const { defaultProvider } = await import('@aws-sdk/credential-provider-node');
    return defaultProvider()();
  }

  const base = fromIni({ profile: mode.profile });
  if (mode.type === 'base') {
    return base;
  }

  return fromTemporaryCredentials({
    masterCredentials: base,
    params: { RoleArn: mode.roleArn, RoleSessionName: 'dsql-migrations' },
  })();
}

export async function newClient(config: ConfigValue, role: 'admin' | 'owner' | 'user') {
  const signer = new DsqlSigner({
    hostname: config.POSTGRES_HOST,
    region: config.APP_AWS_DB_REGION,
    credentials: await getAwsCredentials(
      role === 'admin'
        ? { type: 'base', profile: config.APP_AWS_PROFILE }
        : {
            type: 'ssoAssume',
            profile: config.APP_AWS_PROFILE,
            roleArn: config.APP_AWS_DB_CONNECT_ROLE_ARN,
          },
    ),
  });
  const token = await (role === 'admin' ? signer.getDbConnectAdminAuthToken() : signer.getDbConnectAuthToken());

  const client = new Client({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: role === 'admin' ? config.POSTGRES_USER : role === 'owner' ? config.APP_OWNER : config.APP_USER,
    password: token,
    ssl: { rejectUnauthorized: true },
    keepAlive: true,
  });
  await client.connect();
  return client;
}

export function sha256(input: string | Buffer) {
  return createHash('sha256').update(input).digest('hex');
}
