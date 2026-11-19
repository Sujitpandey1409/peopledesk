# Render deployment report

This report captures the working deployment configuration and the fixes made for PeopleDesk's Express, TypeScript, PostgreSQL, and Vite application.

## Render service configuration

Create separate services for the API, PostgreSQL database, and static frontend.

### API web service

- **Root Directory:** `server`
- **Build Command:** `npm ci --include=dev && npm run build`
- **Start Command:** `npm start`
- Use a Node web service and let Render provide `PORT`. The API reads `process.env.PORT` and falls back to `5000` for local development.
- Set the service's **Health Check Path** to `/health`.
- Keep `server/package-lock.json` committed so `npm ci` installs the locked dependencies.

### API environment variables

Set these in the Render API service's environment:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | The database's Internal Database URL when the API and database are in the same Render region; otherwise use a URL reachable from the API service. |
| `CLIENT_URL` | The deployed frontend's origin, for example `https://your-site.onrender.com` (no path required). |
| `NODE_ENV` | `production` (optional; Render's Node environment is typically configured as production). |

Do not commit real credentials. `server/.env.example` is for local development only.

### PostgreSQL connection behavior

`server/src/config/database.ts` requires `DATABASE_URL`, validates it as a URL, and enables TLS for non-local database hosts. It removes URL-level SSL settings before passing the URL to `pg`, because those settings can override the SSL option in application code. Local `localhost`, `127.0.0.1`, and `::1` connections keep their normal local behavior.

The current TLS configuration uses `rejectUnauthorized: false` to support hosted PostgreSQL services whose TLS certificate is not trusted by the Node runtime. This encrypts the connection but does not verify the server certificate. Where the database provider supplies a CA certificate, prefer configuring that CA and certificate verification instead.

The API checks database connectivity before opening its HTTP listener. If PostgreSQL authentication or TLS fails, the process exits and Render cannot detect an open port. Diagnose the first database error in the logs; subsequent “No open ports detected” messages are a consequence, not a separate port configuration issue.

### Frontend service

- Deploy `client` as a static site.
- Set the static site's **Root Directory** to `client`.
- Use **Build Command** `npm ci && npm run build`.
- Use **Publish Directory** `dist`.
- Set `VITE_API_URL` to the public base URL of the API web service, for example `https://your-api-service.onrender.com`, and redeploy after changing it. Vite embeds `VITE_*` variables at build time; changing a runtime environment variable without rebuilding the static site will not update the bundled URL.
- `client/.env.example` shows the expected variable. Local development defaults to `http://localhost:5000`; a production build fails clearly if `VITE_API_URL` is missing.

The API's `CLIENT_URL` must match the browser's frontend origin (scheme, hostname, and port), not the API URL or a route on the frontend. The application normalizes it to an origin, so a trailing slash does not cause a mismatch.

## Deploy and verify

1. Commit and push the source and lockfiles for both services.
2. Deploy the PostgreSQL database and API in the same region when possible.
3. Confirm the API logs show `PostgreSQL connected successfully` followed by `PeopleDesk API running on port ...`.
4. Open `https://your-api-service.onrender.com/health`. Expect:

   ```json
   {"success":true,"message":"PeopleDesk API is running"}
   ```

5. Deploy or rebuild the frontend with its `VITE_API_URL` set, then verify listing and employee create/update/delete from the deployed site.
6. If browser requests fail while `/health` works, check the browser console and confirm the API's `CLIENT_URL` matches the deployed frontend origin. If API startup fails, inspect the first PostgreSQL error and verify the database URL, credentials, network reachability, and TLS configuration.

## What is Render-specific?

The exact Render dashboard fields, root directories, build/start commands, internal database URL, health-check setting, and port detection are Render deployment configuration—not universal application code.

The underlying practices apply broadly: inject secrets through the platform, use a managed database URL that is reachable from the service, use TLS according to the database provider's requirements, honor the platform-provided port, restrict CORS to the frontend origin, and expose a health endpoint. AWS, Docker, and other hosts still need their own service, network, secret, and port configuration. Docker does not automatically provide TLS or make database credentials available; configure them through the container runtime/orchestrator. For AWS RDS and other providers, follow their CA-verification guidance rather than assuming Render's TLS settings are appropriate.
