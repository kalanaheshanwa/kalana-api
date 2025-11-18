import { fromIni, fromNodeProviderChain, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { Logger } from '../../utils/index.mjs';
import { AppConfig } from '../app-config.mjs';

const logger = new Logger({ context: 'AWS-credentials-resolver' });

export async function resolveAwsCredentials(
  config: AppConfig,
  type: 'db-assume' | 'general' = 'general',
): Promise<AwsCredentialIdentityProvider> {
  if (type === 'db-assume') {
    logger.debug('Loading credentials for DB', { profile: config.APP_AWS_PROFILE ?? 'undefined' });
    const masterCredentials = config.APP_AWS_PROFILE
      ? fromIni({ profile: config.APP_AWS_PROFILE })
      : fromNodeProviderChain();
    return fromTemporaryCredentials({
      masterCredentials,
      params: {
        RoleArn: config.APP_AWS_DB_CONNECT_ROLE_ARN,
        RoleSessionName: 'aurora-dsql-connect',
      },
    });
  }

  if (config.APP_AWS_PROFILE) {
    logger.debug('Loading credentials via profile', { profile: config.APP_AWS_PROFILE });
    return fromIni({ profile: config.APP_AWS_PROFILE });
  }

  logger.debug('Loading credentials via chain');
  return fromNodeProviderChain();
}
