// Aurora DB statements
export const adminStatements: string[] = [
  /* SQL */ `DROP SCHEMA IF EXISTS ":APP_SCHEMA" CASCADE;`,

  // /* SQL */ `AWS IAM REVOKE ":APP_USER" FROM '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,
  // /* SQL */ `AWS IAM REVOKE ":APP_OWNER" FROM '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,

  /* SQL */ `DROP ROLE IF EXISTS ":APP_OWNER";`,
  /* SQL */ `CREATE ROLE ":APP_OWNER" WITH LOGIN;`,
  /* SQL */ `DROP ROLE IF EXISTS ":APP_USER";`,
  /* SQL */ `CREATE ROLE ":APP_USER" WITH LOGIN;`,

  // 👇 Allow admin to "be" app_owner for owner-sensitive DDL
  /* SQL */ `GRANT ":APP_OWNER" TO ":POSTGRES_USER";`,
  /* SQL */ `GRANT ":APP_USER" TO ":APP_OWNER";`,

  /* SQL */ `CREATE SCHEMA ":APP_SCHEMA" AUTHORIZATION ":APP_OWNER";`,

  /* SQL */ `AWS IAM GRANT ":APP_OWNER" TO '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,
  /* SQL */ `AWS IAM GRANT ":APP_USER" TO '":APP_AWS_DB_CONNECT_ROLE_ARN"';`,

  /* SQL */ `ALTER ROLE ":APP_OWNER" SET search_path TO ":APP_SCHEMA";`,
  /* SQL */ `ALTER ROLE ":APP_USER" SET search_path TO ":APP_SCHEMA";`,
];

export const appUserStatements: string[] = [
  /* SQL */ `GRANT USAGE ON SCHEMA ":APP_SCHEMA" TO ":APP_USER";`,

  /* SQL */ `GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA ":APP_SCHEMA" TO ":APP_USER";`,
];
