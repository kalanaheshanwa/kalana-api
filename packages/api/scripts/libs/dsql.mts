import { fromIni, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { createHash } from 'node:crypto';
import { Client } from 'pg';

export type CredentialMode = { type: 'env' } | { type: 'ssoAssume'; profile: string; roleArn: string };

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
  return fromTemporaryCredentials({
    masterCredentials: base,
    params: { RoleArn: mode.roleArn, RoleSessionName: 'dsql-migrations' },
  })();
}

export async function newClient(opts: {
  region: string;
  host: string;
  port: number;
  dbUser: string;
  database: string;
  credentials: CredentialMode;
}) {
  const signer = new DsqlSigner({
    hostname: opts.host,
    region: opts.region,
    credentials: await getAwsCredentials(opts.credentials),
  });
  const token = await signer.getDbConnectAuthToken();

  const client = new Client({
    host: opts.host,
    port: opts.port,
    user: opts.dbUser,
    password: token,
    database: opts.database,
    ssl: { rejectUnauthorized: true },
    keepAlive: true,
  });
  await client.connect();
  return client;
}

export function sha256(input: string | Buffer) {
  return createHash('sha256').update(input).digest('hex');
}
