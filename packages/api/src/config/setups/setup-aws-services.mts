import { S3Client } from '@aws-sdk/client-s3';
import { AppConfig } from '../app-config.mjs';
import { resolveAwsCredentials } from './utils.mjs';

export async function setupAWSServices(config: AppConfig): Promise<{ s3: S3Client }> {
  const credentials = await resolveAwsCredentials(config);

  const s3 = new S3Client({
    region: config.APP_AWS_REGION,
    credentials,
  });

  return { s3 };
}
