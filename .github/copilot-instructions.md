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

- **Build / dev / run**
  - Install: `npm install`
  - Dev server: `npm run dev` (Vite, default port shown in terminal)
  - Build: `npm run build` and `npm run preview`
  - Lint: `npm run lint`
  - Environment: create `.env.local` from `.env.example` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optionally `VITE_SUPABASE_SERVICE_ROLE_KEY`.

- **When editing code**
  - Keep changes minimal and follow existing naming conventions (PascalCase for components and pages). Match import alias style `@/...`.
  - When adding or changing data-layer code, update or reuse `base44.entities.*` helpers rather than querying Supabase directly.
  - Add or update TanStack Query keys when changing queries so cache invalidation remains correct.

- **Search hints** (quick grep targets)
  - `base44` — finds SDK and usage sites
  - `useQuery` / `useMutation` — find data patterns
  - `src/components/ui` — for UI primitives to reuse
  - `neuro-` — styling tokens and patterns

- **Do not**
  - Directly edit database schemas or server-side policies here; this repo is frontend-only and relies on Supabase.
  - Introduce new global CSS variables without checking `Layout.jsx` and the existing theme system.

If anything in this file is unclear or you'd like more examples (e.g., a small sample mutation + invalidation patch), tell me which area to expand.
