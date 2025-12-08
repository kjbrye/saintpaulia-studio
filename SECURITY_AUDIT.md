# Security Audit — Saintpaulia Studio (automatic scan)

Date: 2025-12-01 (Updated: 2025-12-06)
Scope: Static code inspection of the repository files in the workspace (client-side React/Vite project). This audit focuses on secrets handling, auth/RLS usage, network calls, third-party integrations, dependency surface, input handling, upload handling, and other security-relevant patterns found in the code.

Summary: The most critical issues from the original audit have been remediated. Key improvements include: (1) `.env.local` removed from repository and added to `.gitignore`, (2) LLM and hCaptcha calls moved to server-side proxies with secrets stored server-only, and (3) documentation updated to clearly mark server-only secrets. Some medium-risk items remain for ongoing attention.

---

## Remediated Findings (Previously High Severity)

### ✅ FIXED: Committed `.env.local` with Supabase anon key
- **Status**: Remediated (commit `8d213ee`)
- **Evidence**: `.env.local` removed from repository via `git rm --cached` and added to `.gitignore`
- **Current state**: `.gitignore` now includes `.env.local` pattern (`*.local` and explicit `.env.local`)
- **Remaining action**: Consider rotating the previously-exposed Supabase anon key if not already done

### ✅ FIXED: Secret API keys in VITE_ variables (Claude, hCaptcha)
- **Status**: Remediated (commit `d0419fb`)
- **Evidence**:
  - LLM calls now proxy through `/api/llm` endpoint (see `api/routes/llm.js`)
  - hCaptcha verification now proxies through `/api/verify-hcaptcha` endpoint (see `api/routes/hcaptcha.js`)
  - Client code (`src/lib/custom-sdk.js`) no longer reads `VITE_CLAUDE_API_KEY` or `VITE_HCAPTCHA_SECRET_KEY`
  - Server endpoints read secrets from server-only env vars (`CLAUDE_API_KEY`, `HCAPTCHA_SECRET`)
  - Runtime warning added in `custom-sdk.js:89-102` that detects and alerts if old VITE_ secrets are still present
- **Current architecture**:
  - Client uses `VITE_INTERNAL_API_KEY` (a shared token, not a secret) to authenticate with server proxies
  - Server holds actual provider secrets (`CLAUDE_API_KEY`, `HCAPTCHA_SECRET`) in environment
  - Both proxies validate the internal API key before processing requests

### ⚠️ PARTIALLY ADDRESSED: Client-side service role usage
- **Status**: Partially addressed with warnings
- **Evidence**:
  - `.env.example` now documents `VITE_SUPABASE_SERVICE_ROLE_KEY` as server-only with clear warnings
  - `custom-sdk.js:89-102` warns at runtime if service role key is found in VITE_ env vars
  - Service role client still initialized in `custom-sdk.js:46-57` if key is present (for local dev)
- **Remaining risk**: If `VITE_SUPABASE_SERVICE_ROLE_KEY` is accidentally set in production, it would be exposed
- **Recommendation**:
  - Consider removing service role client initialization entirely from client code
  - Move `UserEntity` admin operations to server-side API endpoints
  - For now, DO NOT set `VITE_SUPABASE_SERVICE_ROLE_KEY` in production environments

---

## Remaining Medium Severity Findings

### ✅ FIXED: `.env.example` deprecated VITE_ secret placeholders
- **Status**: Remediated (2025-12-07)
- **Action taken**: Removed `VITE_CLAUDE_HAIKU`, `VITE_CLAUDE_MODEL`, and `VITE_CLAUDE_API_KEY` from `.env.example`
- **Current state**: File now only contains safe client-side variables and clear documentation about server-only secrets

### Potential RLS bypass patterns in code
- **Files**: `src/lib/custom-sdk.js` — `UserEntity` and service-role behavior
- **Risk**: Code attempts to use the admin/service role client inside client code; if a service role key is present, the app will silently use it and circumvent RLS
- **Recommendation**: Enforce separation — client code must only ever use the anon/public key and rely on RLS policies. Any admin queries must go through authenticated server endpoints.

### File upload handling
- **Files**: `src/lib/custom-sdk.js` — `integrations.Core.UploadFile` uploads to Supabase Storage and returns public URL
- **Risks**:
  - Uploaded files may be saved to a public bucket with public URLs; ensure appropriate ACLs
  - Lack of strict validation for file types and sizes; currently the code accepts the provided `file` and uses its name to derive extension
  - No virus/malware scanning or content-type enforcement present
- **Recommendation**:
  - Restrict allowed file types and enforce size limits client- and server-side
  - Store sensitive uploads in private buckets and serve via signed URLs when needed
  - Integrate a virus scanning pipeline (e.g., ClamAV, third-party scanning) for uploads
  - Sanitize file names and generate canonical safe paths (currently uses timestamp + random string, which is good)

### No CAPTCHA on critical auth endpoints
- **Files**: `src/components/auth/AuthScreen.jsx` — no CAPTCHA in signup flows
- **Risk**: Account enumeration, bot signups, or credential stuffing attacks
- **Note**: hCaptcha verification infrastructure is now in place (`/api/verify-hcaptcha`), but needs to be integrated into auth flows
- **Recommendation**: Add client-side hCaptcha widget and perform server-side verification during signup/signin

### Token storage & XSS risk
- **Files**: `src/lib/supabaseClient.js` (supabase-js default storage is localStorage)
- **Risk**: Access tokens stored in localStorage are vulnerable to XSS
- **Recommendation**:
  - Consider storing refresh/auth tokens in secure, httpOnly cookies (server-side session)
  - Harden CSP and sanitize all user-provided HTML/markdown before rendering

### Input sanitization / XSS
- **Files**: Community posts, notes, descriptions, and other free-text fields may be stored and later rendered
- **Risk**: Stored XSS if untrusted HTML is rendered
- **Recommendation**: Sanitize or escape user-generated content before storing or before rendering

### Logging of sensitive data
- **Files**: `src/lib/custom-sdk.js` contains many `console.log` / `console.warn` / `console.error` calls
- **Risk**: While not directly leaking secrets, production logs may contain sensitive user data
- **Recommendation**: Reduce log verbosity in production and avoid logging sensitive user data

---

## Low Severity / Best-practice Recommendations

### Environment variable naming and build-time exposure
- ✅ `.env.example` now clearly documents which vars are client-safe vs server-only
- Continue to avoid using `VITE_` prefixes for any secret that should remain server-side

### Rate limiting and abuse protection
- ✅ Server-side proxies (`/api/llm`, `/api/verify-hcaptcha`) now include IP-based rate limiting
- `/api/llm`: 10 requests/minute per IP (LLM calls are expensive)
- `/api/verify-hcaptcha`: 20 requests/minute per IP
- Rate limit headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Returns 429 with `Retry-After` header when exceeded
- **Note**: For production at scale, consider Redis-backed rate limiting for global consistency across serverless instances

### Dependency & vulnerability management
- Run `npm audit` periodically and integrate dependency scans (e.g., Dependabot, Snyk)

### Data privacy
- PII in `users` (emails) and other user metadata is stored
- Ensure that data export/deletion flows comply with privacy laws

### Transport & HTTPS
- Production should always be served over HTTPS with proper CSP headers

---

## Remediation Progress & Next Steps

### ✅ Completed (as of 2025-12-06)
- `.env.local` removed from the repo and added to `.gitignore` (commit `8d213ee`)
- LLM calls moved to server-side `/api/llm` endpoint (commit `d0419fb`)
- hCaptcha verification moved to server-side `/api/verify-hcaptcha` endpoint (commit `d0419fb`)
- Documentation updated to clearly mark server-only secrets
- Runtime warnings added for accidental VITE_ secret exposure

### Remaining Short-term Actions
- ✅ ~~Clean up `.env.example` to remove deprecated VITE_CLAUDE_* lines~~ (done 2025-12-07)
- ✅ ~~Implement rate limiting on `/api/llm` and `/api/verify-hcaptcha` endpoints~~ (done 2025-12-07)
- Consider rotating the previously-exposed Supabase anon key
- Integrate hCaptcha into auth flows (infrastructure ready)

### Medium-term Actions
- Move `UserEntity` admin operations to server-side API endpoints
- Remove service role client initialization from client code entirely
- Harden CSP and enable secure headers (HSTS, X-Frame-Options)
- Run `npm audit` and remediate vulnerable dependencies
- Add file type validation and size limits to upload handler

### Long-term (Policy & Governance)
- Add CI checks that block commits with accidental secret patterns
- Add automated secrets scanning in CI (GitHub secret scanning, TruffleHog)
- Add a privacy/data retention policy and breach plan
- Consider moving to httpOnly cookies for token storage

---

## Appendix — Code Locations of Interest

### Current Architecture (Post-Remediation)

| File | Purpose | Security Notes |
|------|---------|----------------|
| `src/lib/supabaseClient.js` | Supabase client initialization | Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (both safe for client) |
| `src/lib/custom-sdk.js` | Custom SDK wrapper | Proxies LLM/hCaptcha to server; warns if old secrets found; service role for local dev only |
| `api/routes/llm.js` | Server-side LLM proxy | Holds `CLAUDE_API_KEY` server-side, validates internal API key |
| `api/routes/hcaptcha.js` | Server-side hCaptcha proxy | Holds `HCAPTCHA_SECRET` server-side, validates internal API key |
| `src/api/base44Client.js` | Re-exports `customClient` as `base44` | Used throughout the app |
| `src/components/auth/AuthScreen.jsx` | Signup/signin UI | Still needs hCaptcha integration |

### Server Proxy Flow (Current)

```
Client                          Server Proxy                    External API
  |                                  |                               |
  |-- POST /api/llm --------------->|                               |
  |   (x-internal-api-key header)   |                               |
  |                                  |-- POST api.anthropic.com --->|
  |                                  |   (x-api-key: CLAUDE_API_KEY)|
  |                                  |<-- response ------------------|
  |<-- response --------------------|                               |
```

### Historical Evidence (for reference)

The following patterns were identified and remediated:

- **Before (VULNERABLE)**: Client called Claude API directly with `VITE_CLAUDE_API_KEY`
- **After (FIXED)**: Client calls `/api/llm`, server holds `CLAUDE_API_KEY`

- **Before (VULNERABLE)**: Client called hCaptcha siteverify with `VITE_HCAPTCHA_SECRET_KEY`
- **After (FIXED)**: Client calls `/api/verify-hcaptcha`, server holds `HCAPTCHA_SECRET`

---

## Commands for Remaining Cleanup

```pwsh
# Run dependency audit
npm audit --audit-level=moderate

# Check for any remaining VITE_ secrets in built output
npm run build
grep -r "sk-ant" dist/ 2>/dev/null  # Should return nothing

# Verify .env.local is not tracked
git status --ignored | grep env
```