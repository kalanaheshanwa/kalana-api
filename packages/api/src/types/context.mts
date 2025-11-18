import { S3Client } from '@aws-sdk/client-s3';
import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { DB } from '../../generated/kysely/schema.js';
import { AppConfig } from '../config/index.mjs';

export interface AppContext {
  config: AppConfig;
  pool: Pool;
  db: Kysely<DB>;
  s3: S3Client;
}
