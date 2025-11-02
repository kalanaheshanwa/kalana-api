import { z } from 'zod';

export class AppConfig {
  private _env: ConfigValue;

  constructor(variables: NodeJS.ProcessEnv = process.env) {
    this._env = schema.parse(variables);
  }

  get unmodifiedEnv() {
    return this._env;
  }

  get env() {
    return this._env.NODE_ENV;
  }

  get isProd() {
    return this.env === 'production';
  }
  get isDev() {
    return this.env === 'development';
  }
  get isTest() {
    return this.env === 'test';
  }

  get postgresDb() {
    return this._env.POSTGRES_DB;
  }

  get postgresDbShadow() {
    return this._env.POSTGRES_DB_SHADOW;
  }

  get postgresHost() {
    return this._env.POSTGRES_HOST;
  }

  get postgresPort() {
    return this._env.POSTGRES_PORT;
  }

  get postgresUser() {
    return this._env.POSTGRES_USER;
  }

  get postgresPassword() {
    return this._env.POSTGRES_PASSWORD;
  }

  get appOwner() {
    return this._env.APP_OWNER;
  }

  get appOwnerPassword() {
    return this._env.APP_OWNER_PASSWORD;
  }

  get appAwsDbConnectRoleArn() {
    return this._env.APP_AWS_DB_CONNECT_ROLE_ARN;
  }
}

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

  POSTGRES_DB_SHADOW: z.string(),
  SHADOW_OWNER: z.string(),
  SHADOW_OWNER_PASSWORD: z.string(),
});

export type ConfigValue = z.infer<typeof schema>;
