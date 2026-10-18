# study-lab

Node.js/Express learning service, React/Vite UI, and shared API contracts in one pnpm workspace. Requires Node.js 22+ and pnpm 10.6.1.

| Package | Location | Purpose |
| --- | --- | --- |
| `@study-lab/api` | `apps/api` | HTTP service and PostgreSQL learning demos |
| `@study-lab/web` | `apps/web` | Interactive demo UI |
| `@study-lab/schema` | `packages/schema` | Runtime schemas and generated OpenAPI/types; private workspace package |

```sh
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000`; the API listens on `http://localhost:3001`. `pnpm dev` prepares the schema, API client and routes before starting both services. Schema source changes rebuild the contracts and restart the API; adding or removing pages automatically refreshes routes. If schema generation fails, fix the error and save again to retry. For PostgreSQL demos, put `DATABASE_URL` pointing only to `study_lab` in ignored `apps/api/.env`; see `apps/api/.env.example`. The default tests do not need a database. Never commit credentials.

`pnpm sync` refreshes the schema, API client and routes without starting services. Run it after a fresh install before standalone type checks or tests. `pnpm build` synchronizes these files and builds the API and web apps. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` from the root for workspace verification; type checks cover all three packages and API tests, while tests cover API behavior and API/route generation. Package-specific commands and learning notes remain in each package's README. The private ESLint and TypeScript config packages require authorized GitHub Packages access; the root `.npmrc` contains no token.

For an API image, use `docker build -f apps/api/Dockerfile .` from this directory. CI verifies the workspace using a single frozen lockfile.

## Deploy to Railway (single always-on container)

The repository ships a root [`Dockerfile`](./Dockerfile) and [`railway.toml`](./railway.toml) for a single production container: the API serves both `/api/*` and the built SPA from `apps/web/dist` (NODE_ENV=production + `WEB_DIST_DIR`, defaulting to `apps/web/dist`). Use this to keep the app reachable even when your machine is off.

Prerequisites and steps:

1. **GitHub Packages token** — the private `@liangqingda/*` config packages are only installable with auth (anonymous fetch returns 401). Create a fine-grained PAT with `read:packages` and set it as a **build** variable `NPM_TOKEN` on the Railway service.
2. **Create the service** — import the repo in Railway (or `railway up` from this directory); the root `Dockerfile` is detected automatically.
3. **Add plugins** — provision a Postgres service and a Redis service; copy their `DATABASE_URL` / `REDIS_URL` into the service variables.
4. **Variables** — set `NODE_ENV=production`, `HTTP_PORT=3000`, `CORS_ORIGINS=https://<your-app>.up.railway.app` (fill in the real domain after the first deploy; comma-separate extra origins). `REDIS_URL` / `DATABASE_URL` are optional if you skip those demos. `WEB_DIST_DIR` is optional.
5. **Deploy** — the healthcheck uses `/health`; verify the page and `/skill` (agent-skill docs) load.

See [`railway.toml`](./railway.toml) and the local `.env.railway.example` (gitignored) for the exact variable names.
