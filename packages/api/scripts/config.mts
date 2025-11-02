import { DsqlSigner } from '@aws-sdk/dsql-signer';
import { z } from 'zod';

export class AppConfig {
  private _env: ConfigValue;
  private _generatedAdminToken: string | undefined;
  private _generatedUserToken: string | undefined;

  constructor(variables: NodeJS.ProcessEnv = process.env) {
    this._env = schema.parse(variables);
  }

  async init() {
    if (!this.isDev) {
      await this._generateAdminToken();
      await this._generateUserToken();
    }
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
    if (this.isDev) {
      return this._env.POSTGRES_PASSWORD;
    }

    if (!this._generatedAdminToken) {
      throw new Error('Please initiate config first');
    }

    return this._generatedAdminToken;
  }

  get appOwner() {
    return this._env.APP_OWNER;
  }

  get appOwnerPassword() {
    if (this.isDev) {
      return this._env.APP_OWNER_PASSWORD;
    }

    if (!this._generatedUserToken) {
      throw new Error('Please initiate config first');
    }

    return this._generatedUserToken;
  }

  private async _generateAdminToken() {
    if (this._generatedAdminToken) {
      return this._generatedAdminToken;
    }

    const signer = new DsqlSigner({
      hostname: this.postgresHost,
      profile: 'kalanah-dev',
    });

    try {
      const token = await signer.getDbConnectAdminAuthToken();
      this._generatedAdminToken = token;
      return token;
    } catch (error) {
      console.error('Failed to generate token: ', error);
      throw error;
    }
  }

  private async _generateUserToken() {
    if (this._generatedUserToken) {
      return this._generatedUserToken;
    }

    const signer = new DsqlSigner({
      hostname: this.postgresHost,
      profile: 'kalanah-dev',
    });

    try {
      const token = await signer.getDbConnectAuthToken();
      this._generatedUserToken = token;
      return token;
    } catch (error) {
      console.error('Failed to generate token: ', error);
      throw error;
    }
  }

  private _buildPostgresConnStr(
    includeDb: boolean = true,
    user: string = this.postgresUser,
    password: string = this.postgresPassword,
    db: string = this.postgresDb,
    port: number = this.postgresPort,
    host: string = this.postgresHost,
  ): string {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}${includeDb ? `/${db}` : ''}`;
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

  POSTGRES_DB_SHADOW: z.string(),
  SHADOW_OWNER: z.string(),
  SHADOW_OWNER_PASSWORD: z.string(),
});

export type ConfigValue = z.infer<typeof schema>;
