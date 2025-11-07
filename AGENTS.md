# Repository Guidelines

## Project Structure & Module Organization

This Yarn 4 workspace keeps all runtime code under `packages/`. `packages/api` is the primary HTTP service: request
routing lives in `src/api/v1`, shared logic in `src/services`, middleware in `src/middleware`, and typed helpers in
`src/types` and `src/utils`. Database migrations and seeds sit in `packages/api/migrations` with supporting automation
inside `packages/api/scripts`. Generated artifacts, `dist/`, and `node_modules/` are ignored by tooling—never edit them
manually. `packages/notify` is reserved for messaging workloads, while `terraform/` holds infrastructure definitions.

## Build, Test, and Development Commands

- `yarn install` — installs all workspace dependencies with Plug’n’Play resolution.
- `yarn lint` — runs ESLint + Prettier in fix mode across the repo.
- `yarn workspace @kalanah/api dev` — incremental TypeScript build plus Nodemon watcher (use for everyday API work).
- `yarn workspace @kalanah/api build` — clean compile to `dist/` for deployment packaging.
- `yarn workspace @kalanah/api db:migrate` — applies migrations against the local environment (But still the database is
  an Aurora DSQL cluster on AWS).
- `yarn workspace @kalanah/api infra:up` / `infra:down` — uses Podman Compose to provision or tear down local Postgres
  and auxiliaries; run before DB-dependent work (Not used at the moment - switched to Aurora DSQL).

All migration scripts are custom written for this project only. Because, there were no any useful working migration tool
with Aurora DSQL support. Zapatos is used by the app to interact with the database.

## Coding Style & Naming Conventions

The repository enforces ESLint 9 with the Stylistic plugin and Prettier-in-ESLint; run `yarn lint` before committing.
Use 2-space indentation, 120-character line limits, and curly braces around multi-line conditionals (per
eslint.config.mjs). Favor `.ts` for runtime modules, `.mts` for ESM-friendly scripts, and PascalCase for types,
camelCase for functions/variables, and kebab-case for file names. Co-locate feature modules in folders under `src/api`
and keep cross-cutting utilities in `src/utils` to simplify tree-shaking.

## Testing Guidelines

ESLint already exposes Jest globals, so add Jest- or Vitest-style specs ending in `.spec.ts` or `.test.ts` next to the
code under test. Exercise HTTP contracts via supertest-style integration tests and cover Zapatos queries with isolated
suites that point at the Podman Postgres stack (`infra:up`). Target ≥80 % branch coverage for new modules and document
any intentional gaps in the PR. When tests depend on AWS credentials, load them with `dotenv -e .env -- <command>` to
avoid leaking keys into shell history.

## Commit & Pull Request Guidelines

History follows short, imperative subjects with Conventional Commit prefixes (e.g., `feat(api): add device enrollment`).
Keep commits scoped to one concern, and include migration files or Terraform edits in the same change set that relies on
them. PRs must describe intent, outline testing performed (`yarn lint`, manual flows, DB migrations), link the tracking
issue, and attach screenshots or API traces when the change affects client-visible behavior. Flag any required
environment variable additions in the PR checklist before requesting review.

## Security & Configuration Tips

Secrets live in `.env`, `.env.dev`, or `.env.prod`; never commit them. Use
`yarn workspace @kalanah/api load-vars <command>` to inject CONFIG before running scripts. AWS Cognito authentication
and Aurora DSQL token generation commands are documented in `packages/api/README.md`; prefer short-lived tokens and
per-profile credentials. When editing Terraform or Podman manifests, coordinate rotations and share state updates in the
#infra channel to keep staging and production aligned.
