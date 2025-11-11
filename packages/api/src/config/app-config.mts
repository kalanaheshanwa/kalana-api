import { z } from 'zod';

export function getConfig(variables: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = schema.parse(variables);
  return { ...parsed, IS_DEV: parsed.NODE_ENV === 'development', IS_PROD: parsed.NODE_ENV === 'production' };
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive().min(1000),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .transform((arg) => arg.split(','))
    .pipe(z.string().trim().url().array().nonempty()),

  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().int().positive().min(1000),
  APP_USER: z.string(),

  APP_AWS_PROFILE: z.string().optional(),
  APP_AWS_DB_REGION: z.string(),
  APP_AWS_DB_CONNECT_ROLE_ARN: z.string().optional(),
});

interface ExtendedAppConfig {
  IS_DEV: boolean;
  IS_PROD: boolean;
}

export type AppConfig = z.infer<typeof schema> & ExtendedAppConfig;
