<!-- Copilot / AI agent instructions for the Saintpaulia Studio repo -->
# Saintpaulia Studio — Copilot instructions

This file contains focused, actionable guidance for AI coding agents working in this repository. Keep answers concise, reference exact files where possible, and follow the project's established patterns.

- **Big picture**: React + Vite frontend backed by Supabase. The app uses a custom Base44-compatible SDK (`src/lib/custom-sdk.js` and `src/api/base44Client.js`) to interact with Supabase entities defined in `src/api/entities.js`.

- **Key directories**:
  - `src/api/` — entity definitions and `base44` client adapters.
  - `src/lib/` — SDK wrapper (`custom-sdk.js`), Supabase client (`supabaseClient.js`), and utilities (`utils.js`).
  - `src/components/` — UI building blocks. Reusable primitives live under `src/components/ui/`.
  - `src/pages/` — route components; routing is configured in `src/pages/index.jsx`.
  - `src/hooks/` — small hooks (e.g. `use-mobile.jsx`).

- **Data flow & patterns**:
  - All server interaction goes through the `base44` client or exported entities (e.g., `base44.entities.Plant`). Reference: `CLAUDE.md` and `src/api/base44Client.js`.
  - Use TanStack Query (`@tanstack/react-query`) for queries/mutations. Example pattern: query keys like `['plants']`, `['plant', id]`, and `['careLogs', plantId]` (see `CLAUDE.md`).
  - Mutations must invalidate the appropriate query keys using `queryClient.invalidateQueries({ queryKey: [...] })` on success.

- **Auth & integrations**:
  - Use `base44.auth.*` helpers for authentication flows (`me()`, `login('dev')`, `logout()`, `isAuthenticated()`). See `src/api/base44Client.js`.
  - File uploads go through `base44.integrations.Core.UploadFile({ file })` and return `file_url`.

- **Styling conventions**:
  - Tailwind CSS + custom CSS variables. Use the `cn()` utility from `src/lib/utils.js` to compose classes.
  - Prefer `neuro-*` classes and CSS variables for theming (see `Layout.jsx` and `CLAUDE.md`).

- **Conventions & gotchas** (project-specific)
  - IDs are UUID strings and dates are ISO strings. Ordering uses `-` prefix for descending (e.g., `-created_at`).
  - Many entity fields are JSON arrays (e.g., `photos`, `tags`, `expected_traits`) — treat them as parsed arrays in the client.
  - Data fetching should not use `useEffect` for server calls — always use TanStack Query.

- **File/component examples to reference in patches**
  - Data access: `src/api/base44Client.js`, `src/api/entities.js`.
  - Auth examples: any `pages` that call `base44.auth` or `Layout.jsx` for theme/auth flow.
  - Query/mutation examples: search for `useQuery` and `useMutation` across `src/pages` and `src/components`.

<!-- Copilot / AI agent instructions for the Saintpaulia Studio repo -->
# Saintpaulia Studio — Copilot instructions (concise)

This file captures the minimal, actionable knowledge an AI coding agent needs to be productive in this repo.

**Big picture:** React + Vite frontend; Supabase backend accessed via a custom Base44-compatible SDK. Client code uses `base44` entity helpers exported from `src/api/*` and all server-sensitive calls (LLM/hCaptcha) are proxied by server endpoints in `api/routes/`.

**Key locations:**
- **Data / SDK:** `src/api/base44Client.js`, `src/api/entities.js`, `src/lib/custom-sdk.js`
- **Supabase init:** `src/lib/supabaseClient.js`
- **Pages / routing:** `src/pages/index.jsx`, individual pages in `src/pages/`
- **UI primitives:** `src/components/ui/` (Radix-based)
- **Server proxies:** `api/routes/llm.js`, `api/routes/hcaptcha.js` (see `api/README.md`)

**Essential patterns (do not deviate):**
- Use `base44.entities.*` helpers for data access (e.g., `base44.entities.Plant.list()`), not raw Supabase queries.
- Use TanStack Query (`useQuery`, `useMutation`, `useQueryClient`) for all client data fetching and mutations; invalidate exact query keys on success (e.g., `queryClient.invalidateQueries({ queryKey: ['plants'] })`).
- No `useEffect` for server calls; prefer query hooks.
- Mutations must update/refresh cache via `invalidateQueries` (examples across `src/pages` and `src/components`).

**Auth & integrations:**
- Use `base44.auth.*` for auth flows (`me()`, `login('dev')`, `logout()`, `isAuthenticated()`). See `src/api/base44Client.js` for helpers.
- Uploads: `base44.integrations.Core.UploadFile({ file })` → returns `file_url`.

**Security & environment variables (critical):**
- LLM (Claude) and hCaptcha secrets are server-only. Do NOT add `CLAUDE_*` or `HCAPTCHA_SECRET` keys as `VITE_` variables.
- Deploy server proxies (see `api/README.md`) and set server secrets as `INTERNAL_API_KEY`, `CLAUDE_API_KEY`, `HCAPTCHA_SECRET` in the host's secret manager.
- Frontend receives a public/shared `VITE_INTERNAL_API_KEY` (same value as server `INTERNAL_API_KEY`) so it can call the proxy endpoints; that value is visible in builds and must not be used as a Claude secret.
- `.env.example` documents which vars are server-only. `.env.local` should be ignored by git (see `.gitignore`).

**Developer workflow / commands:**
- Install: `npm install`
- Dev: `npm run dev` (Vite; default http://localhost:5173)
- Build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

**Project-specific conventions & gotchas:**
- IDs are UUID strings; timestamps are ISO strings. Sorting uses a `-` prefix to indicate descending (e.g., `-created_at`).
- Several DB fields are JSON arrays (e.g., `photos`, `tags`, `expected_traits`) — code expects parsed arrays.
- Styling: Tailwind + CSS variables; use `cn()` from `src/lib/utils.js` and `neuro-*` classes for glassmorphic tokens.

**Files to reference when making changes:**
- Data + entities: `src/api/entities.js`, `src/api/base44Client.js`
- SDK glue: `src/lib/custom-sdk.js`, `src/lib/supabaseClient.js`
- Server proxy examples: `api/routes/llm.js`, `api/routes/hcaptcha.js`, and `api/README.md`
- Examples of queries/mutations: any page under `src/pages/` (search for `useQuery` / `useMutation`).

**When editing code:**
- Keep changes minimal and consistent with existing patterns (PascalCase for components/pages). Prefer small, focused PRs.
- Update or add TanStack Query keys when changing data access so invalidation stays correct.
- Do not change DB schemas or server policies in this frontend repository.

If any behavior is unclear (query key naming, specific entity shape, or how a proxy endpoint should behave), ask for the preferred example page/feature to mirror. Please review `api/README.md` for secure proxy deployment steps.
