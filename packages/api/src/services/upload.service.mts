import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AppConfig } from '../config/app-config.mjs';
import { AppContext } from '../types/index.mjs';
import { Logger } from '../utils/index.mjs';

const logger = new Logger({ context: 'UploadService' });

export class UploadService {
  private readonly _config: AppConfig;
  private readonly _s3: S3Client;

  constructor({ config, s3 }: AppContext) {
    this._config = config;
    this._s3 = s3;
  }

  async s3(key: string, buffer: Buffer, mimetype: string): Promise<string | null> {
    try {
      const command = new PutObjectCommand({
        Bucket: this._config.APP_AWS_UPLOADS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });

      await this._s3.send(command);

      return key;
    } catch (error) {
      logger.error('File upload failed', { key, error });
      return null;
    }
  }
}
