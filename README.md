# kalanah

## Aurora DSQL Database

### Migration Workflow

All Aurora work lives inside `packages/api/scripts/db`. Each script wraps the AWS DSQL signer (`libs/dsql.mts`), so you
must export valid AWS credentials and call commands through the workspace:

- `yarn workspace @kalanah/api db:init` — (re)creates the application roles, schema, and IAM grants defined in
  `scripts/db/setup.mts`. Run this only for fresh environments because it drops the schema.
- `yarn workspace @kalanah/api db:migrate:new add-feature-x` — scaffolds a timestamped SQL file under
  `packages/api/migrations`. Write raw SQL that obeys the “one DDL per statement” rule.
- `yarn workspace @kalanah/api db:migrate:dev` — loads `.env` via `load-vars`, ensures the `__migrations` ledger table
  exists, and applies pending files through `migrate-apply.mts`.
- `yarn workspace @kalanah/api db:migrate:reset` — replays `db:init` steps and reapplies every migration; handy for
  local resets.
- `yarn workspace @kalanah/api db:apply:dev|prod` — points at `.env.dev`/`.env.prod` to apply migrations in lower or
  production environments.

Aurora signer tokens last 15 minutes, but any connection that was opened with a valid token can hang around for roughly
an hour. If the CLI hangs with `password authentication failed`, recycle the connection so a new token can be minted.

### Runtime Connection Plan

We are deprecating Prisma in favor of a `pg`-backed data layer that understands signer token expiry:

1. Build `src/config/setups/setup-db.mts` that creates a `pg.Pool` using the same `DsqlSigner` helper already used by
   the scripts. Each time the pool establishes or acquires a client, record the token issue time and destroy the client
   if it is older than ~50 minutes so the next checkout forces a fresh token.
2. Provide a thin repository wrapper (e.g., `src/utils/db.ts`) that exposes `query`, `transaction`, and helper methods;
   inject this through `AppContext` (`src/types/context.mts`) instead of `PrismaClient`.
3. In `src/index.mts`, initialize the pool during `main`, register shutdown hooks that call `pool.end()`, and pass the
   wrapper into routes/services. Lambda handlers can memoize the pool per container, while long-lived local servers rely
   on the token-rotation policy above.
4. When migrations or other scripts need admin/owner roles, keep reusing the shared signer utilities under
   `scripts/db/libs` to avoid divergent credential handling.

Once this scaffolding lands we can incrementally replace Prisma calls inside services with `ctx.db` queries built on top
of `pg`.
