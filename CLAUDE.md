# CLAUDE.md - Saintpaulia Studio

This document provides essential context for AI assistants working on the Saintpaulia Studio codebase.

## Project Overview

Saintpaulia Studio is a web application for African violet collectors. It helps growers manage their plant collections, track care activities, log propagation projects, and connect with the community.

### Key Features
- **Collection management** - Catalog plants with cultivar metadata, photos, and tags
- **Care tracking** - Log watering, fertilizing, grooming, repotting with calendar reminders
- **Propagation & breeding projects** - Track crosses, monitor batches, capture observations
- **Community hub** - Browse feed, publish posts, public profiles
- **Supplies & wishlist** - Manage inventory with low-stock alerts
- **Analytics dashboards** - Visualize collection growth, care patterns, health metrics

## Tech Stack

| Category | Technology |
|----------|------------|
| Build | Vite 6.x |
| Framework | React 18 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3.x |
| UI Components | Radix UI primitives |
| Data Fetching | TanStack Query (React Query) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Animations | Framer Motion |
| Toasts | Sonner |

## Project Structure

```
src/
├── api/
│   ├── base44Client.js     # Exports the custom client as `base44`
│   ├── entities.js         # Entity exports (Plant, CareLog, etc.)
│   └── integrations.js     # External service integrations
├── components/
│   ├── ui/                 # Radix-based primitives (button, card, dialog, etc.)
│   ├── plants/             # Plant-specific components
│   ├── care/               # Care tracking components
│   ├── health/             # Health monitoring components
│   ├── journal/            # Journal entry components
│   ├── hybridization/      # Breeding project components
│   ├── analytics/          # Dashboard charts and stats
│   ├── collections/        # Collection management
│   ├── supplies/           # Supply inventory components
│   ├── onboarding/         # Tooltips and guided tours
│   ├── shared/             # Common reusable components
│   └── ...
├── hooks/
│   └── use-mobile.jsx      # Mobile detection hook
├── lib/
│   ├── custom-sdk.js       # Custom Supabase SDK mimicking Base44
│   ├── supabaseClient.js   # Supabase client initialization
│   └── utils.js            # Utility functions (cn for classnames)
├── pages/
│   ├── index.jsx           # Router configuration and page exports
│   ├── Layout.jsx          # Main layout with theming system
│   ├── Collection.jsx      # Main plant collection page
│   ├── PlantDetail.jsx     # Individual plant view
│   └── ...                 # Other page components
└── utils/
    └── index.ts            # URL utilities (createPageUrl)
```

## Data Layer Architecture

### Custom SDK (Base44 Compatibility)

The app uses a custom SDK (`src/lib/custom-sdk.js`) that provides a Base44-compatible interface over Supabase. This allows entity-based data operations:

```javascript
// Import entities
import { Plant, CareLog, HealthLog } from "@/api/entities";
// Or use the client directly
import { base44 } from "@/api/base44Client";

// Available operations on entities:
await Plant.list(orderBy, limit);           // List all records
await Plant.filter({ field: value }, orderBy, limit);  // Filter records
await Plant.get(id);                        // Get single record
await Plant.create(data);                   // Create record
await Plant.update(id, data);               // Update record
await Plant.delete(id);                     // Delete record
```

### Available Entities

| Entity | Table Name | Description |
|--------|------------|-------------|
| Plant | plants | Plant records |
| CareLog | care_log | Care activity logs |
| HealthLog | health_log | Health observations |
| JournalEntry | journal_entry | Journal entries |
| BloomLog | bloom_log | Bloom cycles |
| HybridizationProject | hybridization_project | Breeding projects |
| Offspring | offspring | Breeding offspring |
| HybridizationLog | hybridization_log | Breeding logs |
| PlantCollection | plant_collection | Collection groupings |
| Wishlist | wishlist | Wishlist items |
| PropagationProject | propagation_project | Propagation projects |
| PropagationLog | propagation_log | Propagation logs |
| PropagationBatch | propagation_batch | Propagation batches |
| PestDiseaseLog | pest_disease_log | Pest/disease records |
| Location | location | Growing locations |
| Supply | supply | Supply inventory |
| SupplyUsageLog | supply_usage_log | Supply usage records |
| Cultivar | cultivar | Cultivar database |
| RecurringCareTask | recurring_care_task | Scheduled tasks |
| User | users | User accounts |

### TanStack Query Integration

Data fetching uses TanStack Query for caching and state management:

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Fetch data
const { data: plants, isLoading } = useQuery({
  queryKey: ['plants'],
  queryFn: () => base44.entities.Plant.list()
});

// Filter with conditions
const { data: careLogs } = useQuery({
  queryKey: ['careLogs', plantId],
  queryFn: () => base44.entities.CareLog.filter({ plant_id: plantId }, '-care_date'),
  enabled: !!plantId
});

// Mutations with cache invalidation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Plant.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['plants'] });
  }
});
```

### Authentication

```javascript
import { base44 } from "@/api/base44Client";

// Get current user
const user = await base44.auth.me();

// Login (dev mode or OAuth)
await base44.auth.login('dev');  // Development
await base44.auth.login('google');  // OAuth

// Logout
await base44.auth.logout();

// Check authentication
const isAuth = await base44.auth.isAuthenticated();
```

## Styling System

### Tailwind + CSS Variables

The app uses a custom theming system defined in `Layout.jsx`. Themes include:
- **Studio Violet (glassmorphism)** - Default, ethereal glass effects
- **High Contrast** - Maximum readability
- **Light Mode** - Clean and bright

### CSS Class Conventions

```javascript
// Use the cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "neuro-card rounded-3xl p-6",
  isActive && "ring-2 ring-primary"
)} />
```

### Custom CSS Classes (from themes)

| Class | Purpose |
|-------|---------|
| `neuro-card` | Main card container with glassmorphic styling |
| `neuro-button` | Button with neumorphic effects |
| `neuro-accent-raised` | Accent button with raised effect |
| `neuro-input` | Input field styling |
| `neuro-icon-well` | Icon container with inset effect |
| `neuro-badge` | Badge styling |

### Color Variables

```css
var(--text-primary)      /* Primary text color */
var(--text-secondary)    /* Secondary text color */
var(--text-muted)        /* Muted text color */
var(--accent)            /* Accent color */
```

## Routing

Routes are defined in `src/pages/index.jsx`. The pattern is simple - each page has its own route:

```javascript
<Route path="/" element={<Collection />} />
<Route path="/PlantDetail" element={<PlantDetail />} />
<Route path="/AddPlant" element={<AddPlant />} />
```

### Navigation Helper

```javascript
import { createPageUrl } from "@/utils";

// Creates URL: /plantdetail?id=123
navigate(createPageUrl(`PlantDetail?id=${plantId}`));

// Creates URL: /collection
navigate(createPageUrl("Collection"));
```

## Component Patterns

### Page Component Structure

```javascript
export default function PageName() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for data
  const { data, isLoading } = useQuery({...});

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page content */}
    </div>
  );
}
```

### Form Components Pattern

Forms typically use `react-hook-form` with modal dialogs:

```javascript
import { useForm } from "react-hook-form";

function FormComponent({ onClose, plantId }) {
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Entity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queryKey'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Form content */}
    </div>
  );
}
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Environment Variables

Create `.env.local` from `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional
VITE_HCAPTCHA_SECRET_KEY=your_hcaptcha_key  # Optional
```

## Code Conventions

### File Naming
- Components: PascalCase (`PlantCard.jsx`)
- Pages: PascalCase (`PlantDetail.jsx`)
- Utilities: camelCase (`utils.js`)
- Hooks: camelCase with `use` prefix (`use-mobile.jsx`)

### Import Aliases
```javascript
import { Component } from "@/components/Component";  // src/
```

### Key Patterns to Follow

1. **Use TanStack Query** for all data fetching - never fetch in useEffect
2. **Invalidate queries** after mutations to refresh data
3. **Use the cn() utility** for combining Tailwind classes
4. **Use the theming system** - prefer CSS variables over hardcoded colors
5. **Use existing UI components** from `src/components/ui/`
6. **Keep page components focused** - extract reusable logic to components
7. **Use lucide-react icons** - consistent with existing codebase

### Styling Guidelines

1. Use `neuro-*` classes for glassmorphic effects
2. Use `rounded-3xl` for cards, `rounded-2xl` for buttons, `rounded-xl` for inputs
3. Use Playfair Display for headings (via CSS variable)
4. Maintain consistent spacing: `px-4 sm:px-6 lg:px-8` for page padding
5. Use responsive classes: `grid sm:grid-cols-2 lg:grid-cols-3`

### Array Fields in Database

These fields are stored as JSON arrays and automatically parsed:
- `expected_traits`, `tags`, `symptoms`, `photos`, `care_actions`
- `observed_traits`, `desired_traits`, `leaf_types`, `sources`

## File Upload

```javascript
import { base44 } from "@/api/base44Client";

// Upload file to Supabase storage
const result = await base44.integrations.Core.UploadFile({ file });
const imageUrl = result.file_url;
```

## Common Query Keys

```javascript
['plants']                    // All plants
['plant', plantId]            // Single plant
['careLogs', plantId]         // Care logs for a plant
['healthLogs', plantId]       // Health logs for a plant
['journalEntries', plantId]   // Journal entries
['bloomLogs', plantId]        // Bloom logs
['pestDiseaseLogs', plantId]  // Pest/disease logs
['collections']               // All collections
['supplies']                  // All supplies
['currentUser']               // Current authenticated user
```

## Important Notes

1. **ID Format**: All IDs are UUIDs stored as strings
2. **Date Format**: Dates are ISO strings (e.g., `2024-01-15`)
3. **Ordering**: Prefix with `-` for descending (e.g., `-created_at`)
4. **Service Role**: Used automatically for user/admin operations
5. **RLS**: Row Level Security is enforced via Supabase policies

## Troubleshooting

### Common Issues

1. **Auth errors**: Clear localStorage and refresh - sessions may be invalid
2. **Query not updating**: Ensure you're invalidating the correct query key
3. **Type errors**: Entity fields may need null checks
4. **Missing data**: Check if `enabled` condition in useQuery is correct
