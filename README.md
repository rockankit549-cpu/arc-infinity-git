# ARC Infinity Lab Web

Static marketing site backed by Netlify Functions, a Neon PostgreSQL database, and JWT-based authentication.

## Prerequisites

- Node.js 18+ and npm
- Netlify CLI (`npm install -g netlify-cli`), authenticated with your Netlify account

## Installation

```
npm install
```

This pulls the packages required by the Netlify Functions (`@netlify/neon`, `bcryptjs`, `jsonwebtoken`, `netlify-cli`).

## Database provisioning & migrations

1. Run `netlify dev` once from the project root. Netlify automatically creates an anonymous Neon database and exposes its connection URL as the `NETLIFY_DATABASE_URL` environment variable.
2. Persist the connection string locally:

   ```
   netlify env:get NETLIFY_DATABASE_URL > .env.local
   ```

   or export it inline before running scripts.
3. Apply migrations to create the `users` table:

   ```
   NETLIFY_DATABASE_URL=$(netlify env:get NETLIFY_DATABASE_URL) npm run migrate
   ```

   You can add additional `.sql` files under `migrations/` and the runner will execute them in lexical order.

## Secrets

Generate a strong JWT signing secret and store it with Netlify:

```
netlify env:set JWT_SECRET "paste-a-secure-random-string" --secret
```

Never commit the secret or the emitted `.env` helper file.

Optional: override the default one-hour token lifetime with `JWT_TTL_SECONDS`.

### Stack Auth / Neon configuration

Configure the Stack Auth project and Neon database credentials in your Netlify site (Site settings -> Build & deploy -> Environment):

```
STACK_PROJECT_ID="fbb27ac1-cf68-4271-91e4-dee616ecf74b"
NEXT_PUBLIC_STACK_PROJECT_ID="fbb27ac1-cf68-4271-91e4-dee616ecf74b"
STACK_JWKS_URL="https://api.stack-auth.com/api/v1/projects/fbb27ac1-cf68-4271-91e4-dee616ecf74b/.well-known/jwks.json"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="pck_w6v9gnkpzjvqz0rsdnt4m94drhtcxydetks7h8dtjnj8r"
STACK_SECRET_SERVER_KEY="ssk_aa9hv23kkkvjdp7y4vbrygsfcmfahgnf0yb9eze5sqy8g"
NETLIFY_DATABASE_URL="postgresql://neondb_owner:npg_M8vuQta1Uyij@ep-damp-rain-ae5ky2db-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

Mark the secret keys (`STACK_SECRET_SERVER_KEY`, `NETLIFY_DATABASE_URL`) as "secure" values in Netlify so they are not exposed in logs.

## Netlify Identity (customer portal)

1. In Netlify Dashboard → your site → **Identity**, click **Enable Identity**.
2. Under Identity → Settings → Registration preferences choose **Invite only**. Only admins can create customer logins.
3. (Optional) Identity → Settings → Roles → add a `customer` role. Assign this role to invited customers so the dashboard redirect works.
4. Invite users via Identity → Users → **Invite users**. Once they accept, set their role and share the portal URL.
5. The site loads the Netlify Identity widget on `index.html` and `client-dashboard.html` via `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`. The UI logic lives in `script.js`.
6. The dashboard page is protected by a role-based redirect in `netlify.toml` (only users with the `customer` role can fetch `/client-dashboard.html`).

## Netlify Functions

| Function | Path | Description |
|----------|------|-------------|
| `register` | `/.netlify/functions/register` | Accepts `email` + `password`, hashes with `bcryptjs`, inserts a new row in `users`. Returns HTTP 201 or 409 if the email already exists. |
| `login` | `/.netlify/functions/login` | Validates credentials, signs a JWT with `JWT_SECRET`, and returns it while also setting an `HttpOnly` `arc_session` cookie. |
| `protected` | `/.netlify/functions/protected` | Example of a protected API that rejects requests missing/with invalid JWTs (uses the Authorization header or cookie). |

Each function uses the shared helpers in `netlify/functions/_utils`.

## Front-end integration

- `login.html` provides dedicated customer (user ID + password) and employee (email + user ID) login tabs that both post to `/.netlify/functions/login` and redirect to the appropriate workspace (records or employee portal).
- `script.js` handles submission flows, inline validation, and success/error messaging, and stores the returned JWT in `localStorage` for client-driven API calls.
- The server sets an HTTP-only cookie automatically, so authenticated Netlify Functions receive the token without the client re-sending it manually.
- `index.html` now surfaces a Netlify Identity powered login widget that reveals “Go to Dashboard” and “Logout” actions once authenticated.
- `records.html` displays the customer-facing “Record of Testing” table and summary banner (fed by localStorage or employee updates), while `employee-portal.html` gives staff editable tables (paste from Excel) plus a PDF upload workflow that links reports to Test Ref. numbers.
- `client-dashboard.html` is a gated landing spot for logged-in customers. It links directly to their testing record and provides support shortcuts; unauthenticated visitors are redirected to `/`.

## Local testing

```
netlify dev
```

This command:

- Serves the static site
- Emulates Netlify Functions
- Connects to the provisioned Neon database

Use the UI or `curl` to exercise the functions:

```
curl -X POST http://localhost:8888/.netlify/functions/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"P@ssw0rd!"}'
```

```
curl -X POST http://localhost:8888/.netlify/functions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"P@ssw0rd!"}' \
  -i
```

## Deployment

1. Commit your changes.
2. Ensure `NETLIFY_DATABASE_URL`, `JWT_SECRET`, and the Stack Auth variables above are configured in the Netlify site environment.
3. Push to the main branch; Netlify will build and deploy automatically via `netlify.toml`.
