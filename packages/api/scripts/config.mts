import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),

  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.enum(['localhost']).or(z.string().regex(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i)),
  POSTGRES_PORT: z.coerce.number().int().positive().min(1000),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),

  APP_OWNER: z.string(),
  APP_OWNER_PASSWORD: z.string(),
  APP_SCHEMA: z.string(),
  APP_USER: z.string(),
  APP_USER_PASSWORD: z.string(),

  APP_AWS_DB_CONNECT_ROLE_ARN: z.string(),
  APP_AWS_DB_REGION: z.string(),
  APP_AWS_PROFILE: z.string(),

  POSTGRES_DB_SHADOW: z.string(),
  SHADOW_OWNER: z.string(),
  SHADOW_OWNER_PASSWORD: z.string(),
});

export type ConfigValue = z.infer<typeof schema>;

export function getConfig(): ConfigValue {
  return schema.parse(process.env);
}
