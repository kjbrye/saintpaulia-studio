# Security Audit — Saintpaulia Studio (automatic scan)

Date: 2025-12-01
Scope: Static code inspection of the repository files in the workspace (client-side React/Vite project). This audit focuses on secrets handling, auth/RLS usage, network calls, third-party integrations, dependency surface, input handling, upload handling, and other security-relevant patterns found in the code.

Summary: Several high-risk findings were identified that should be addressed immediately, plus a set of medium/low-risk recommendations. The most critical issues are: (1) committed environment file containing a real Supabase anon key, and (2) use of "VITE_" prefixed environment variables for secrets that are effectively exposed to client bundles (service role key, Claude API key, hCaptcha secret). Both create immediate secrets-exposure and RLS-bypass risks.

High Severity Findings

- Committed `.env.local` with Supabase anon key
  - File: `.env.local` (present in repo root)
  - Evidence: `VITE_SUPABASE_URL=https://dkfaqqwflwzxoyycqxlh.supabase.co` and an `VITE_SUPABASE_ANON_KEY=eyJ...` value present in the repository.
  - Risk: Secret leakage and credential exposure. Even though the anon key is intended to be public to the browser, committing environment files to the repository is an operational secret exposure risk (and may include other secrets in the future). If a service role or other secret is committed similarly, it would be catastrophic.
  - Recommended action:
    - Remove `.env.local` from the repository immediately (git rm --cached .env.local) and add `.env.local` to `.gitignore` if not already ignored.
    - Rotate the exposed Supabase keys (rotate anon key and any other leaked keys) from the Supabase dashboard.
    - Check git history for the key and rotate any earlier exposures (use `git filter-repo`/BFG to purge if necessary).

- Exposed/Client-side service role & secret-use patterns
  - Files: `src/lib/custom-sdk.js`, `.env.example`, `README.md`, `CLAUDE.md`, `src/lib/supabaseClient.js`.
  - Evidence: `VITE_SUPABASE_SERVICE_ROLE_KEY` is read by the client SDK and, if present, is used to create a service-role Supabase client (`createClient(supabaseUrl, supabaseServiceKey, ...)`). `UserEntity` is configured to use the service role for user operations (`super('users', true)`).
  - Risk: Service role keys grant full access to the database (bypass RLS/policies). If such a secret is supplied as a `VITE_` env var (exposed to the client bundle), an attacker able to view built assets can retrieve it and fully compromise the database.
  - Recommended action:
    - Never supply a service role key to client-side code or include it in `VITE_` env variables.
    - Remove client-side logic that can initialize a service-role client. Instead, move any operations requiring elevated privileges to a server-side environment (serverless function or API) that holds the service role key in a secure secret store.
    - Update documentation and `.env.example` to strongly mark `SUPABASE_SERVICE_ROLE_KEY` as a server-only secret and rename it (e.g., `SUPABASE_SERVICE_ROLE_KEY` without `VITE_`) to avoid accidental client exposure.
    - Audit all `CustomEntity(..., useServiceRole=true)` usages and move those operations behind server endpoints.

- Secret API keys in VITE_ variables used from client (Claude, hCaptcha)
  - Files: `src/lib/custom-sdk.js`, `.env.example`, `CLAUDE.md`.
  - Evidence: `VITE_CLAUDE_API_KEY`, `VITE_HCAPTCHA_SECRET_KEY` are read inside `custom-sdk.js`. The code will call the Claude API (requests with `x-api-key: claudeApiKey`) and hCaptcha siteverify directly from the browser when env vars are present. `VITE_` env keys are statically embedded into client bundles by Vite and therefore exposed to end users.
  - Risk: Exposed LLM/API/CAPTCHA secret keys — anyone can extract the key from built assets and abuse the API (cost abuse, data exfiltration, rate-limit bypassing). hCaptcha secret exposure undermines anti-bot protections.
  - Recommended action:
    - Move all secret API calls (LLM calls, hCaptcha verification, email sending) to server-side endpoints that store secrets in a secure secret manager (e.g., cloud secrets, HashiCorp Vault, or serverless environment variables not bundled into client code).
    - Replace client-side LLM/hCaptcha usage with fetch calls to your own server endpoints that implement rate limiting, authentication, and usage logging.
    - Remove `VITE_` prefix from any env var that contains a secret intended only for server usage to avoid accidental inclusion in client builds.

Medium Severity Findings

- Client-side verification of hCaptcha using secret
  - File: `src/lib/custom-sdk.js` — `functions.verifyHcaptcha` posts to `https://api.hcaptcha.com/siteverify` from client code using `VITE_HCAPTCHA_SECRET_KEY`.
  - Risk: hCaptcha secret should be kept server-side; client verification leaks secret and is trivially bypassable.
  - Recommended action: Implement server-side hCaptcha verification and have the client send only the token to your server endpoint for verification. Rate-limit and log verification attempts.

- LLM requests from the browser with API key
  - File: `src/lib/custom-sdk.js` — `integrations.Core.InvokeLLM` sends `x-api-key` header to Claude API from client.
  - Risk: LLM keys leak; attackers can use your LLM quota and access sensitive prompt data.
  - Recommended action: Create a server-side LLM proxy that performs request validation, redaction of sensitive user data (if needed), rate limiting, abuse detection, and billing controls.

- Potential RLS bypass patterns in code
  - Files: `src/lib/custom-sdk.js` — `UserEntity` and service-role behavior
  - Risk: Code attempts to use the admin/service role client inside client code; if a service role key is present, the app will silently use it and circumvent RLS. Even without a service role key, logic may fall back oddly or cause unpredictable auth flows.
  - Recommended action: Enforce separation — client code must only ever use the anon/public key and rely on RLS policies. Any admin queries must go through authenticated server endpoints.

- File upload handling
  - Files: `src/lib/custom-sdk.js` — `integrations.Core.UploadFile` uploads to Supabase Storage and returns public URL.
  - Risks:
    - Uploaded files may be saved to a public bucket with public URLs; ensure appropriate ACLs and consider private buckets with signed URLs.
    - Lack of strict validation for file types and sizes; currently the code accepts the provided `file` and uses its name to derive extension.
    - No virus/malware scanning or content-type enforcement present.
  - Recommended action:
    - Restrict allowed file types and enforce size limits client- and server-side.
    - Store sensitive uploads in private buckets and serve via signed URLs when needed.
    - Integrate a virus scanning pipeline (e.g., ClamAV, third-party scanning) for uploads, or scan in a server-side process before making public.
    - Avoid using user-supplied file names for storage paths; sanitize file names and generate canonical safe paths.

- No CAPTCHA on critical auth endpoints (client shows no server-verified CAPTCHA)
  - Files: `src/components/auth/AuthScreen.jsx` — no CAPTCHA in signup flows.
  - Risk: Account enumeration, bot signups, or credential stuffing attacks on sign-up and sign-in.
  - Recommended action: Add client-side CAPTCHA (reCAPTCHA/hCaptcha) and perform server-side verification using a server-side secret; enforce rate limiting per IP/email.

- Token storage & XSS risk
  - Files: `src/lib/supabaseClient.js` (supabase-js default storage is localStorage)
  - Risk: Access tokens stored in localStorage are vulnerable to XSS. If an attacker can run script in the context, they can steal session tokens.
  - Recommended action:
    - Consider storing refresh/auth tokens in secure, httpOnly cookies (server-side session) and use a server authentication proxy where possible.
    - At minimum, harden CSP and sanitize all user-provided HTML/markdown before rendering; audit places where raw HTML/markdown is rendered (e.g., `react-markdown`) and enable safe options/plugins.

- Input sanitization / XSS
  - Files: Community posts, notes, descriptions, and other free-text fields may be stored and later rendered (e.g., `CommunityPostEntity`). I found no global sanitization policy in the client.
  - Risk: Stored XSS if untrusted HTML is rendered, or injection in other contexts.
  - Recommended action:
    - Sanitize or escape user-generated content before storing or before rendering. For markdown, use safe renderers and strip dangerous HTML.
    - Implement server-side validation and encoding before returning content to clients.

- Logging of sensitive data
  - Files: `src/lib/custom-sdk.js` contains many `console.log` / `console.warn` / `console.error` calls with structured objects (including `prompt` values for LLM calls). While not directly leaking secrets, avoid logging full prompt content and any token or user metadata in production logs.
  - Recommended action: Reduce log verbosity in production and avoid logging sensitive user data or secrets.

Low Severity / Best-practice Recommendations

- Environment variable naming and build-time exposure
  - Avoid using `VITE_` prefixes for any secret that should remain server-side. Use unexposed env vars on server.
  - Document which env vars are safe for client exposure (anon key) and which are server-only (service role, LLM keys, CAPTCHA secrets, SMTP/Resend API keys).

- Rate limiting and abuse protection
  - No server-side rate limiting is present (this is a frontend repo, but integrations (LLM, community posts, uploads) need server-side rate limiting).
  - Recommended action: Implement rate-limiting rules at your API layer or use a serverless function with throttling, and require authenticated usage limits.

- Dependency & vulnerability management
  - I inspected `package.json` for notable deps. The project uses many dependencies; run `npm audit` and integrate periodic dependency scans (e.g., Dependabot, Snyk, GitHub Advanced Security) to detect known vulnerabilities.

- Data privacy
  - PII in `users` (emails) and other user metadata is stored — ensure that data export/deletion flows comply with privacy laws. Implement a clear retention and deletion process and support user data export/deletion upon request.

- Transport & HTTPS
  - Production should always be served over HTTPS. Ensure site is behind TLS and CSP is configured.

Concrete Remediations & Next Steps (ordered)

1. Immediate (within hours)
   - Remove `.env.local` from the repo and rotate any keys exposed. Use `git rm --cached .env.local` and add to `.gitignore`.
   - Search the repo history for any other committed secrets and rotate them.
   - Update docs to make `SUPABASE_SERVICE_ROLE_KEY` server-only and explicitly warn contributors not to set service role keys in `VITE_` env vars.

2. Short term (days)
   - Move LLM calls (`InvokeLLM`) and hCaptcha verification (`functions.verifyHcaptcha`) to server-side endpoints behind authentication and rate limiting.
   - Replace client-side service-role usage: identify real needs for service-role operations and expose them via authenticated server endpoints only.
   - Implement server-side rate limits and abuse detection for LLM, file uploads, and community posting endpoints.
   - Add server-side file validation and virus scanning for uploads; move upload privileges to private buckets with signed URLs.

3. Medium term (weeks)
   - Rework auth/session model to use secure httpOnly cookies or server-session tokens where possible to reduce XSS token theft risk.
   - Harden CSP and cookie policies, and enable secure headers (HSTS, X-Frame-Options, etc.) at hosting/CDN level.
   - Run an `npm audit` and remediate/update vulnerable dependencies.

4. Long term (policy & governance)
   - Add CI checks that block commits with accidental secret patterns (e.g., scanning for `api_key`, `sk-`, `AKIA`, etc.).
   - Add automated secrets scanning in CI (GitHub secret scanning, TruffleHog, or similar).
   - Add a privacy/data retention policy and breach plan.

Appendix — concrete code locations of interest

- `.env.local` (repo root) — contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (committed)
- `src/lib/custom-sdk.js` — reads `VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_CLAUDE_API_KEY`, `VITE_HCAPTCHA_SECRET_KEY`, and will perform client-side calls with them (service role client, Claude LLM, hCaptcha verify).
- `src/lib/supabaseClient.js` — Supabase client initialization; ensure keys in env are correct but do not add service role here for client-side usage.
- `src/components/auth/AuthScreen.jsx` — signup/signin UI; lacks server-verified CAPTCHA and password-reset uses TODO.
- `src/api/base44Client.js` — re-exports `customClient` as `base44` used throughout the app.

Evidence (exact lines, redacted)

The following snippets were extracted from the repository history to help pinpoint where secrets or secret-usage patterns exist. Values that may be sensitive are redacted with `[REDACTED]`.

- `src/lib/supabase-client.js` (initial commit) — default/fallback anon key (redacted):

```js
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '[REDACTED_ANON_KEY]')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- `src/lib/custom-sdk.js` — hCaptcha verification reads secret from env and calls the verification endpoint from the browser:

```js
const secretKey = getEnvVar('VITE_HCAPTCHA_SECRET_KEY', null);
const response = await fetch('https://api.hcaptcha.com/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString(),
});
```

- `src/lib/custom-sdk.js` — Claude LLM invocation sends the API key from client code in an `x-api-key` header:

```js
const response = await fetch(`${claudeClient.baseUrl}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': claudeApiKey, // claudeApiKey originates from VITE_CLAUDE_API_KEY
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify(requestBody),
});
```

- `src/lib/custom-sdk.js` — UserEntity / CustomEntity construction enables service-role usage for certain entities:

```js
export class UserEntity extends CustomEntity {
  constructor() {
    super('users', true); // Use service role for user operations to bypass RLS when needed
  }
  ...
}
```

These extracted lines confirm the high-risk patterns noted above (client-side secret use, potential service-role initialization in client code). The next steps are rotation and moving any server-only operations to a server-side environment.

How I validated these findings

- Static grep/search for `VITE_`, `fetch(`, and `supabase` across the repository.
- Opened and reviewed the following files: `.env.local`, `src/lib/custom-sdk.js`, `src/lib/supabaseClient.js`, `src/api/base44Client.js`, `src/components/auth/AuthScreen.jsx`, `package.json`, `vite.config.js`.

Recommended immediate commands for the repository owner (copy/paste)

```pwsh
# Remove committed .env.local and add to .gitignore
git rm --cached .env.local
echo ".env.local" >> .gitignore
git commit -m "chore: remove committed env.local and add to .gitignore"
# Rotate exposed Supabase keys immediately from Supabase dashboard
# Scan git history for other leaked secrets (example with BFG or git-filter-repo)
# e.g. use git-filter-repo or BFG as appropriate (follow docs carefully)

# Run dependency audit
npm install
npm audit --audit-level=moderate
```

If you want, I can:
- Produce a targeted patch that removes any accidental secret file from the repo (with git rm --cached plus .gitignore update) and create a short PR description.
- Refactor `custom-sdk.js` to prevent client-side service-role initialization (throw or skip if `VITE_` is used) and move LLM/hCaptcha code into server-side stubs.
- Add CI secrets scanning and a GitHub Actions workflow that runs `npm audit` and `secret-scan`.

If you'd like me to continue, tell me which follow-up task to run next (I can rotate/remove committed secret file, patch `custom-sdk.js` to be safe, or scaffold a serverless proxy for LLM and hCaptcha).