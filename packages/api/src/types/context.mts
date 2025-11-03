import { PrismaClient } from '#prisma/client';
import { AppConfig } from '../config/index.mjs';

export interface AppContext {
  config: AppConfig;
  db: PrismaClient;
}
