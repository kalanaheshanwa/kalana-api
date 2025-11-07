import { Pool } from 'pg';
import { AppConfig } from '../config/index.mjs';

export interface AppContext {
  config: AppConfig;
  pool: Pool;
}
