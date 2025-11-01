import { z } from 'zod';

export function getConfig(variables: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = schema.parse(variables);
  return { ...parsed, isDev: parsed.NODE_ENV === 'development', isProd: parsed.NODE_ENV === 'production' };
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive().min(1000),
  DATABASE_URL_APP: z.string().startsWith('postgresql://'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .transform((arg) => arg.split(','))
    .pipe(z.string().trim().url().array().nonempty()),
  DOMAIN_PRIMARY: z.string(),

  APP_AWS_REGION: z.string(),
  APP_AWS_ACCESS_KEY_ID: z.string().optional(),
  APP_AWS_ACCESS_KEY_SECRET: z.string().optional(),
  APP_AWS_UPLOADS_S3_BUCKET_NAME: z.string(),
  APP_AWS_COGNITO_USER_POOL_ID: z.string(),
  APP_AWS_COGNITO_CLIENT_IDS: z
    .string()
    .transform((arg) => arg.split(','))
    .pipe(z.string().trim().nonempty().array().nonempty()),
  APP_AWS_EB_SCHEDULER_GROUP_NAME: z.string(),
  APP_AWS_SQS_ORDER_TIMEOUTS_ARN: z.string(),
  APP_AWS_IAM_SCHEDULER_TO_SQS_ROLE_ARN: z.string(),
  APP_AWS_SQS_NOTIFY_URL: z.string().url(),

  PAYHERE_MERCHANT_ID: z.string(),
  PAYHERE_MERCHANT_SECRET: z.string(),
  PAYHERE_WEBHOOK_URL: z.string().url(),
  PAYHERE_CHECKOUT_API_TIMEOUT: z.coerce.number().int().positive().min(2),

  API_KEY_ORDER_TIMEOUT: z.string(),
  ORDER_CANCELLATION_HMAC_SECRET: z.string(),

  CLOUDFLARE_SECRET: z.string(),
});

interface ExtendedAppConfig {
  isDev: boolean;
  isProd: boolean;
}

export type AppConfig = z.infer<typeof schema> & ExtendedAppConfig;
