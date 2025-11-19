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

### 2. Configure Supabase

This project uses Supabase as the backend database. You'll need to:

1. Create a [Supabase project](https://supabase.com/dashboard)
2. Set up your environment variables (create a `.env` file):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 3. Run Database Migrations

Before running the app, you need to apply database migrations to set up the required schema:

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run the migrations from the `migrations/` folder in order
4. See [migrations/README.md](./migrations/README.md) for detailed instructions

**Important:** The `add_category_to_supply.sql` migration is required to fix the "Could not find the 'category' column" error.

### 4. Start Development Server

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
