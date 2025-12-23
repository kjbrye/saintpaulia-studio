# Saintpaulia Studio v2

African violet collection management and breeding studio.

## Architecture Overview

This project follows a clean, layered architecture:

```
src/
├── api/           → Database client (Supabase)
├── services/      → Data operations (CRUD functions)
├── hooks/         → React Query wrappers + custom hooks
├── utils/         → Business logic & helpers
├── components/
│   ├── ui/        → Generic, reusable components
│   └── [feature]/ → Feature-specific components
├── pages/         → Route components (thin orchestrators)
├── styles/        → Theme tokens & global CSS
└── constants/     → App-wide constants
```

## Key Principles

### 1. Services Own Database Calls
Components never import Supabase directly. All database operations go through service functions.

```js
// ❌ Don't do this in components
const { data } = await supabase.from('plants').select('*')

// ✅ Do this instead
import { usePlants } from '@/hooks/usePlants'
const { data } = usePlants()
```

### 2. Hooks Wrap Services
React Query hooks provide caching, loading states, and mutations. Use the hooks, not the services directly in components.

### 3. Pages Are Thin
Page components should:
- Fetch data via hooks
- Compute derived state
- Render child components
- Stay under 150 lines

### 4. Business Logic Lives in Utils
Functions like `getCareStatus()` belong in utils, not scattered through components.

### 5. Theme Tokens, Not Hardcoded Styles
Use CSS custom properties from `styles/index.css` or the theme object from `styles/theme.js`.

```jsx
// ❌ Don't do this
style={{ color: '#C4B5FD' }}

// ✅ Do this
className="text-[var(--text-secondary)]"
```

## Adding a New Feature

1. **Create the service** in `services/` with CRUD operations
2. **Create the hook** in `hooks/` wrapping the service with React Query
3. **Create components** in `components/[feature]/`
4. **Create the page** in `pages/` that orchestrates everything
5. **Add the route** in `App.jsx`

## Database (Supabase)

Connected to existing Supabase project. Tables include:
- plants
- care_logs
- bloom_logs
- health_logs
- journal_entries
- (and more from v1)

Environment variables needed:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server
npm run build  # Build for production
```
