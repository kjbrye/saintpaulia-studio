# 🌸 Saintpaulia Studio

A beautiful, production-ready plant collection management app designed specifically for African violet enthusiasts. Track your collection, log care activities, monitor blooms, manage propagation projects, and watch your violet family thrive.

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.0.0-purple)
![React](https://img.shields.io/badge/React-18.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-emerald)

---

## ✨ Features

### 🪴 Collection Management
- **Plant Library** — Catalog your entire collection with photos, cultivar details, acquisition info, and personal notes
- **Quick Search & Filter** — Find any plant instantly by name, cultivar, or custom tags
- **Detailed Plant Profiles** — Track each plant's complete history from acquisition to present

### 💧 Care Tracking
- **One-Tap Care Logging** — Record watering, fertilizing, and grooming with a single tap
- **Smart Reminders** — Visual indicators show which plants need attention
- **Care History** — Full timeline of every care action for each plant
- **Customizable Schedules** — Set care thresholds based on your environment and preferences

### 📅 Calendar View
- **Monthly Overview** — See all upcoming care needs at a glance
- **Care Forecasting** — Know what's due today, this week, and beyond
- **Historical View** — Look back at past care patterns

### 📊 Analytics Dashboard
- **Collection Stats** — Total plants, health status, care compliance
- **Growth Timeline** — Visualize how your collection has grown
- **Care Insights** — Identify patterns and optimize your routine

### 🌺 Bloom Tracking *(Coming Soon)*
- Log bloom events with photos
- Track bloom frequency and duration
- Identify your best performers

### 🌱 Propagation Projects *(Coming Soon)*
- Track leaf cuttings from start to plantlet
- Document propagation methods and success rates
- Link offspring to parent plants

### 📚 Reference Library *(Coming Soon)*
- Care guides for African violets
- Cultivar database
- Troubleshooting common problems

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and functional components |
| **Vite** | Lightning-fast build tool and dev server |
| **React Router 6** | Client-side routing and navigation |
| **TanStack React Query** | Data fetching, caching, and synchronization |
| **Supabase** | Backend: PostgreSQL database, authentication, storage |
| **Tailwind CSS** | Utility-first styling with custom design system |
| **Lucide React** | Beautiful, consistent iconography |

---

## 🏗 Architecture

Saintpaulia Studio follows a clean, layered architecture designed for maintainability and scalability:

```
src/
├── api/              # Database client configuration
│   └── supabase.js
│
├── services/         # Data operations (all database calls live here)
│   ├── auth.js       # Authentication operations
│   ├── plants.js     # Plant CRUD operations
│   └── care.js       # Care logging operations
│
├── hooks/            # React hooks wrapping services
│   ├── useAuth.jsx   # Auth state and methods
│   ├── usePlants.js  # Plant data with React Query
│   └── useCare.js    # Care data with React Query
│
├── utils/            # Business logic and helpers
│   ├── careStatus.js # Care status calculations
│   └── calendar.js   # Calendar utilities
│
├── components/
│   ├── ui/           # Reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── index.js
│   ├── plants/       # Plant-specific components
│   ├── care/         # Care-specific components
│   └── layout/       # Layout components
│
├── pages/            # Route components (thin orchestrators)
│   ├── Dashboard.jsx
│   ├── Library.jsx
│   ├── PlantDetail.jsx
│   └── Login.jsx
│
├── styles/
│   ├── index.css     # Global styles and CSS variables
│   └── theme.js      # Theme tokens as JavaScript
│
└── App.jsx           # Providers and routing
```

### Data Flow

```
Supabase → Services → Hooks → Pages → Components
```

**Key principles:**
- Components never import Supabase directly
- All database operations go through services
- React Query handles caching and synchronization
- Business logic lives in utils, not components
- Pages stay under 150 lines

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase account** (free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/saintpaulia-studio.git
   cd saintpaulia-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database**
   
   Run the SQL migrations in your Supabase SQL Editor (see [Database Setup](#database-setup) below).

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 🗄 Database Setup

### Required Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Plants table
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nickname VARCHAR(100),
  cultivar_name VARCHAR(200),
  acquisition_date DATE,
  source VARCHAR(200),
  notes TEXT,
  photo_url TEXT,
  last_watered TIMESTAMPTZ,
  last_fertilized TIMESTAMPTZ,
  last_groomed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care logs table
CREATE TABLE care_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  care_type VARCHAR(50) NOT NULL CHECK (
    care_type IN ('watering', 'fertilizing', 'grooming', 'repotting', 'treatment')
  ),
  care_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_plants_user_id ON plants(user_id);
CREATE INDEX idx_plants_updated_at ON plants(updated_at DESC);
CREATE INDEX idx_care_logs_plant_id ON care_logs(plant_id);
CREATE INDEX idx_care_logs_care_date ON care_logs(care_date DESC);
```

### Row Level Security

**Critical:** Enable RLS to protect user data.

```sql
-- Enable RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;

-- Plants policies
CREATE POLICY "Users can view own plants" ON plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON plants
  FOR DELETE USING (auth.uid() = user_id);

-- Care logs policies
CREATE POLICY "Users can view own care logs" ON care_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = care_logs.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own care logs" ON care_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = care_logs.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own care logs" ON care_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = care_logs.plant_id 
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own care logs" ON care_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM plants 
      WHERE plants.id = care_logs.plant_id 
      AND plants.user_id = auth.uid()
    )
  );
```

### Updated At Trigger

Automatically update the `updated_at` timestamp:

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to plants table
CREATE TRIGGER plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:5173` |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## 🎨 Design System

### Color Palette

The design uses a botanical-inspired palette with sage greens, warm creams, and copper accents:

```css
/* Primary - Sage Greens */
--sage-500: #778a68;
--sage-600: #5d6e51;
--sage-700: #4a5842;

/* Neutrals - Warm Creams */
--cream-50: #fdfcfa;
--cream-100: #f9f7f3;

/* Accents - Copper */
--copper-500: #b87750;
--copper-600: #a66542;

/* Semantic */
--color-success: #a7f3d0;
--color-warning: #fcd34d;
--color-error: #fca5a5;
```

### Typography

- **Headings:** Playfair Display — elegant, botanical feel
- **Body:** Inter — clean, highly readable

### Panel Opacity System

| Use Case | Opacity |
|----------|---------|
| Functional (forms, modals) | 85-88% |
| Informational (stat cards) | 68-75% |
| Decorative (backgrounds) | 55-65% |

---

## 🔒 Security

Saintpaulia Studio implements security at multiple layers:

- **Authentication** — Supabase Auth with secure session management
- **Row Level Security** — Database-enforced access control; users can only access their own data
- **Input Validation** — Client-side validation for UX, database constraints for security
- **Environment Variables** — Secrets kept out of source control
- **HTTPS** — All traffic encrypted in transit

See the [Security section](./docs/SECURITY.md) for detailed implementation.

---

## 🗺 Roadmap

### Version 2.0 (Current)
- [x] Clean architecture rebuild
- [x] Authentication
- [x] Plant collection management
- [x] Care tracking
- [ ] Calendar view
- [ ] Analytics dashboard

### Version 2.1
- [ ] Bloom tracking
- [ ] Photo uploads
- [ ] Search and filtering

### Version 2.2
- [ ] Propagation project tracking
- [ ] Plant family trees
- [ ] Bulk operations

### Version 3.0
- [ ] Community hub
- [ ] Reference library
- [ ] Export/import data

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- African violet community for inspiration
- [Supabase](https://supabase.com) for the amazing backend platform
- [Tailwind CSS](https://tailwindcss.com) for making styling enjoyable
- [Lucide](https://lucide.dev) for beautiful icons

---

## 📬 Contact

Questions? Suggestions? Feel free to open an issue or reach out!

---

<p align="center">
  Made with 💜 for African violet lovers everywhere
</p>