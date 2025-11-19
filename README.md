# Saintpaulia Studio

Saintpaulia Studio is a modern web app for African violet collectors. It keeps cultivar data, plant health history, and community knowledge in one place so growers can plan care, log propagation projects, and share updates with other enthusiasts.

## Key Features
- **Collection management** – catalog every plant with cultivar metadata, lineage, photos, and custom tags.
- **Smart care tracking** – log watering, fertilizing, grooming, and repotting while the calendar surfaces upcoming tasks and overdue reminders.
- **Propagation & breeding projects** – track crosses, monitor propagation batches, and capture observations for each generation.
- **Community hub** – browse the community feed, publish posts, and participate in forums and public profiles.
- **Supplies & wishlist** – manage potting mix, fertilizer, and other inventory with low-stock alerts while keeping a wishlist of future cultivars.
- **Analytics dashboards** – visualize collection growth, care cadence, blooming trends, and health metrics with rich charts.
- **Reference library** – access the Saintpaulia cultivar database, care guides, and help center content directly in the app.

## Tech Stack
- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) for the front-end framework and build tooling.
- [Tailwind CSS](https://tailwindcss.com/) and custom glassmorphism-inspired components for styling.
- [React Router 7](https://reactrouter.com/) for client-side navigation across collection, community, and admin areas.
- [Radix UI primitives](https://www.radix-ui.com/) and utility helpers such as `class-variance-authority`, `clsx`, and `tailwind-merge` for reusable UI patterns.
- [TanStack Query](https://tanstack.com/query) plus Supabase-backed APIs for data fetching, caching, and optimistic updates.
- Visualization via [Recharts](https://recharts.org/) along with supporting libraries such as `react-day-picker`, `date-fns`, and `sonner`.

## Getting Started
Ensure you are running Node.js 18+.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your actual Supabase credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase public anon key
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (optional)

You can find these values in your [Supabase project dashboard](https://app.supabase.com/) under **Project Settings → API**.

### 3. Start Development Server
```bash
npm run dev
```

The development server defaults to `http://localhost:5173`.

### Additional Scripts
| Command | Description |
| --- | --- |
| `npm run build` | Creates an optimized production build. |
| `npm run preview` | Serves the production build locally for smoke testing. |
| `npm run lint` | Runs ESLint across the project to surface quality issues. |

## Support & Feedback
Open an issue or start a discussion in this repository if you encounter bugs, have feature requests, or want to share feedback about Saintpaulia Studio.
