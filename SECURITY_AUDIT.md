# Security Audit — Saintpaulia Studio (automatic scan)

Date: 2025-12-01 (Updated: 2025-12-08)
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

### ✅ FIXED: No CAPTCHA on critical auth endpoints
- **Status**: Remediated (2025-12-09)
- **Files**: `src/components/auth/AuthScreen.jsx`
- **Evidence**:
  - hCaptcha widget integrated into signup flow using `@hcaptcha/react-hcaptcha`
  - Server-side verification via `/api/verify-hcaptcha` before account creation
  - Captcha token validated through `base44.functions.verifyHcaptcha()` before signup proceeds
  - Graceful fallback: if `VITE_HCAPTCHA_SITE_KEY` is not configured, signup works without CAPTCHA (for development)
- **Configuration required**:
  - Set `VITE_HCAPTCHA_SITE_KEY` in client environment (public site key from hCaptcha dashboard)
  - Set `HCAPTCHA_SECRET` in server environment (secret key, never expose to client)

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
- ✅ `npm audit` run 2025-12-08: 0 vulnerabilities (fixed `mdast-util-to-hast` moderate severity issue)
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
- ✅ ~~Integrate hCaptcha into auth flows (infrastructure ready)~~ (done 2025-12-09)

### Medium-term Actions
- Move `UserEntity` admin operations to server-side API endpoints
- Remove service role client initialization from client code entirely
- Harden CSP and enable secure headers (HSTS, X-Frame-Options)
- ✅ ~~Run `npm audit` and remediate vulnerable dependencies~~ (done 2025-12-08)
- Add file type validation and size limits to upload handler

### Long-term (Policy & Governance)
- Add CI checks that block commits with accidental secret patterns
- Add automated secrets scanning in CI (GitHub secret scanning, TruffleHog)
- ✅ ~~Add a privacy/data retention policy and breach plan~~ (done 2025-12-08)
- Consider moving to httpOnly cookies for token storage

---

## Privacy & Data Retention Policy

*Established: 2025-12-08*

### Data We Collect

| Data Category | Examples | Storage Location | Retention Period |
|---------------|----------|------------------|------------------|
| **Account Data** | Email, display name, avatar URL | `users` table (Supabase) | Until account deletion |
| **Plant Collection Data** | Plant names, cultivar info, photos, tags | `plants`, `cultivar` tables | Until user deletion |
| **Care Activity Data** | Watering, fertilizing, grooming logs | `care_log`, `health_log` tables | Until user deletion |
| **Propagation Data** | Breeding projects, offspring tracking | `hybridization_*`, `propagation_*` tables | Until user deletion |
| **Community Content** | Posts, comments, public profile info | `journal_entry` and related tables | Until content/account deletion |
| **Media Files** | Plant photos, profile images | Supabase Storage buckets | Until associated record deletion |
| **Usage Analytics** | Page views, feature usage (if enabled) | Third-party analytics (optional) | Per provider policy |

### Data Processing Principles

1. **Minimization**: Collect only data necessary for app functionality
2. **Purpose Limitation**: Use data only for stated purposes (plant tracking, community features)
3. **User Control**: Users can view, export, and delete their data
4. **Security**: Data protected via Supabase RLS, encrypted in transit (HTTPS)

### User Rights & Self-Service

Users have the right to:

| Right | How to Exercise | Implementation Status |
|-------|-----------------|----------------------|
| **Access** | View all personal data in app | ✅ Available (profile, collection pages) |
| **Export** | Download personal data | ⚠️ Planned (data export feature) |
| **Rectification** | Edit personal information | ✅ Available (edit profile/plants) |
| **Deletion** | Delete account and all data | ⚠️ Planned (account deletion flow) |
| **Portability** | Export data in machine-readable format | ⚠️ Planned (JSON/CSV export) |

### Data Retention Schedule

| Event | Action | Timeline |
|-------|--------|----------|
| User deletes a plant | Cascade delete care logs, health logs, photos | Immediate |
| User deletes account | Delete all user data and uploaded files | Within 30 days |
| Inactive account (no login) | Send re-engagement email | After 12 months |
| Inactive account (continued) | Consider data archival or deletion notice | After 24 months |
| Backup retention | Supabase automated backups | Per Supabase plan (7-30 days) |

### Third-Party Data Sharing

| Third Party | Data Shared | Purpose | Controls |
|-------------|-------------|---------|----------|
| Supabase | All app data | Backend infrastructure | Data Processing Agreement |
| Anthropic (Claude) | User prompts (if AI features used) | AI-powered suggestions | Proxied via server; no PII sent |
| hCaptcha | IP address, browser fingerprint | Bot protection | Only during CAPTCHA challenges |

### Children's Privacy

Saintpaulia Studio is not directed at children under 13. We do not knowingly collect data from children. If we discover such data has been collected, it will be deleted promptly.

---

## Data Breach Response Plan

*Established: 2025-12-08*

### Incident Classification

| Severity | Definition | Examples |
|----------|------------|----------|
| **Critical** | Active exploitation, mass data exposure | Database dump leaked, auth bypass exploited |
| **High** | Confirmed breach, limited scope | Single user's data accessed, API key exposed |
| **Medium** | Potential breach, unconfirmed | Suspicious access patterns, vulnerability reported |
| **Low** | Security weakness, no evidence of exploitation | Misconfiguration found, dependency vulnerability |

### Response Team & Contacts

| Role | Responsibility | Contact |
|------|----------------|---------|
| **Incident Lead** | Coordinates response, makes decisions | Project owner |
| **Technical Lead** | Investigates, contains, remediates | Lead developer |
| **Communications** | User notification, public statements | Project owner |

### Response Procedures

#### Phase 1: Detection & Triage (0-1 hour)

1. **Identify** the incident type and scope
2. **Document** initial findings (timestamp, evidence, affected systems)
3. **Classify** severity level
4. **Activate** response team for High/Critical incidents

#### Phase 2: Containment (1-4 hours)

| Action | When to Use |
|--------|-------------|
| Rotate exposed credentials | API keys, database passwords exposed |
| Revoke user sessions | Auth system compromised |
| Enable maintenance mode | Active exploitation in progress |
| Block suspicious IPs | Ongoing attack from known sources |
| Disable affected features | Vulnerability in specific feature |

```bash
# Emergency credential rotation commands
# Supabase: Regenerate anon key in dashboard, update VITE_SUPABASE_ANON_KEY
# Claude API: Regenerate at console.anthropic.com, update CLAUDE_API_KEY
# Internal API: Generate new token, update VITE_INTERNAL_API_KEY and server config
```

#### Phase 3: Investigation (4-24 hours)

1. **Collect logs**: Supabase logs, server logs, Vercel/hosting logs
2. **Identify scope**: Which users affected? What data accessed?
3. **Determine root cause**: How did the breach occur?
4. **Preserve evidence**: Screenshot, export logs before rotation
5. **Document timeline**: Create incident timeline with timestamps

#### Phase 4: Notification (24-72 hours)

| Audience | When to Notify | Content |
|----------|----------------|---------|
| Affected users | Personal data accessed | What happened, what data, what to do |
| All users | Auth system compromised | Password reset recommendation |
| Authorities | GDPR: 72 hours if EU users affected | Formal breach notification |

**User Notification Template:**

```
Subject: Security Notice from Saintpaulia Studio

We identified a security incident on [DATE] that may have affected your account.

What happened: [Brief description]
What data was involved: [Specific data types]
What we're doing: [Actions taken]
What you should do: [Recommended actions - password change, etc.]

We apologize for any concern this causes. Contact [EMAIL] with questions.
```

#### Phase 5: Recovery & Remediation (1-7 days)

1. **Deploy fixes** for the vulnerability
2. **Verify containment** - confirm no ongoing access
3. **Restore services** gradually with monitoring
4. **Implement additional controls** to prevent recurrence

#### Phase 6: Post-Incident Review (7-14 days)

1. **Conduct retrospective** with response team
2. **Document lessons learned**
3. **Update security controls** based on findings
4. **Update this plan** if gaps identified
5. **File incident report** in project records

### Incident Log Template

```markdown
## Incident: [TITLE]
- **Date Detected**: YYYY-MM-DD HH:MM UTC
- **Severity**: Critical / High / Medium / Low
- **Status**: Active / Contained / Resolved
- **Incident Lead**: [Name]

### Timeline
- HH:MM - [Event description]
- HH:MM - [Event description]

### Impact
- Users affected: [Number or "Unknown"]
- Data types: [List]
- Systems: [List]

### Root Cause
[Description of how the incident occurred]

### Actions Taken
1. [Action and timestamp]
2. [Action and timestamp]

### Lessons Learned
- [Finding 1]
- [Finding 2]

### Follow-up Actions
- [ ] [Action item]
- [ ] [Action item]
```

### Regular Security Reviews

| Activity | Frequency | Owner |
|----------|-----------|-------|
| `npm audit` | Weekly / before releases | Developer |
| Dependency updates | Monthly | Developer |
| Access review (API keys, team access) | Quarterly | Project owner |
| Security audit refresh | Annually | External or internal |
| Breach plan test/drill | Annually | Response team |

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
| `src/components/auth/AuthScreen.jsx` | Signup/signin UI | hCaptcha integrated for signup flow |

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