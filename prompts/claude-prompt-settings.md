# Claude Code Prompt: Profile & Settings Page

## Context

You are building the Profile & Settings page for Saintpaulia Studio. This page allows users to view their account info, adjust app preferences, and log out. Currently there's no way for users to access these features.

**Read these files first:**
- `src/hooks/useAuth.jsx` - Auth hook with `signOut()` method
- `src/styles/index.css` - CSS custom properties
- `src/components/ui/` - Existing UI components

## Features

1. **Account Info** — Display email, member since date
2. **App Preferences** — Care reminder thresholds, default view settings
3. **Danger Zone** — Log out, (future: delete account)

---

## Page Structure

### URL: `/settings`

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Settings                             │  Header
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ACCOUNT                                             │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  👤  katrina@example.com                    │    │   │
│  │  │      Member since January 2025              │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CARE REMINDERS                                      │   │
│  │                                                      │   │
│  │  Watering reminder          [7 days    ▼]           │   │
│  │  Fertilizing reminder       [14 days   ▼]           │   │
│  │  Grooming reminder          [7 days    ▼]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DISPLAY                                             │   │
│  │                                                      │   │
│  │  Default library view       [Grid      ▼]           │   │
│  │  Plants per page            [24        ▼]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️ DANGER ZONE                                      │   │
│  │                                                      │   │
│  │  [Log Out]                                          │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Create `src/pages/Settings.jsx`

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Layout, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Default care thresholds (could move to constants file)
const WATERING_OPTIONS = [
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days' },
  { value: 10, label: '10 days' },
  { value: 14, label: '14 days' },
];

const FERTILIZING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
  { value: 30, label: '30 days' },
];

const GROOMING_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 21, label: '21 days' },
];

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];

const PER_PAGE_OPTIONS = [
  { value: 12, label: '12' },
  { value: 24, label: '24' },
  { value: 48, label: '48' },
  { value: 100, label: '100' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Settings state - in a real app, persist to localStorage or database
  const [settings, setSettings] = useState({
    wateringThreshold: 7,
    fertilizingThreshold: 14,
    groomingThreshold: 7,
    defaultView: 'grid',
    plantsPerPage: 24,
  });
  
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Persist to localStorage or user preferences table
    localStorage.setItem('saintpaulia-settings', JSON.stringify({
      ...settings,
      [key]: value,
    }));
  };
  
  // Load settings from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('saintpaulia-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      setIsLoggingOut(false);
    }
  };
  
  // Format member since date
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Unknown';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link to="/">
            <button className="icon-container">
              <ArrowLeft size={20} color="var(--sage-600)" />
            </button>
          </Link>
          <h1 className="heading heading-xl">Settings</h1>
        </header>

        {/* Account Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} color="var(--sage-600)" />
            <h2 className="text-label">Account</h2>
          </div>
          
          <div className="card-inset p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <User size={24} color="var(--purple-400)" />
            </div>
            <div>
              <p className="text-body font-semibold">{user?.email}</p>
              <p className="text-small text-muted">Member since {memberSince}</p>
            </div>
          </div>
        </section>

        {/* Care Reminders Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} color="var(--sage-600)" />
            <h2 className="text-label">Care Reminders</h2>
          </div>
          <p className="text-small text-muted mb-4">
            Set when plants should be flagged as needing care
          </p>
          
          <div className="space-y-4">
            <SettingRow 
              label="Watering reminder"
              value={settings.wateringThreshold}
              options={WATERING_OPTIONS}
              onChange={(v) => updateSetting('wateringThreshold', v)}
            />
            <SettingRow 
              label="Fertilizing reminder"
              value={settings.fertilizingThreshold}
              options={FERTILIZING_OPTIONS}
              onChange={(v) => updateSetting('fertilizingThreshold', v)}
            />
            <SettingRow 
              label="Grooming reminder"
              value={settings.groomingThreshold}
              options={GROOMING_OPTIONS}
              onChange={(v) => updateSetting('groomingThreshold', v)}
            />
          </div>
        </section>

        {/* Display Section */}
        <section className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Layout size={18} color="var(--sage-600)" />
            <h2 className="text-label">Display</h2>
          </div>
          
          <div className="space-y-4">
            <SettingRow 
              label="Default library view"
              value={settings.defaultView}
              options={VIEW_OPTIONS}
              onChange={(v) => updateSetting('defaultView', v)}
            />
            <SettingRow 
              label="Plants per page"
              value={settings.plantsPerPage}
              options={PER_PAGE_OPTIONS}
              onChange={(v) => updateSetting('plantsPerPage', v)}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="card p-6 border-copper-400/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} color="var(--copper-500)" />
            <h2 className="text-label text-copper-600">Danger Zone</h2>
          </div>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </section>

        {/* App Version */}
        <p className="text-center text-small text-muted mt-8">
          Saintpaulia Studio v2.0.0
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-sm w-full">
            <h2 className="heading heading-lg mb-2">Log out?</h2>
            <p className="text-muted mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Setting Row Component
function SettingRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body">{label}</span>
      <select
        className="input py-2 px-4 min-w-[120px]"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          // Convert to number if the options are numbers
          onChange(isNaN(val) ? val : Number(val));
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
```

---

## Add Navigation to Settings

### Option 1: Header Icon (Recommended)

Add a settings/profile icon to your main pages. Create a simple header component or add to existing layout:

```jsx
// In Dashboard.jsx header area, add:
<Link to="/settings">
  <button className="icon-container">
    <Settings size={20} color="var(--sage-600)" />
  </button>
</Link>
```

Or with user avatar:

```jsx
<Link to="/settings">
  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors">
    <User size={20} color="var(--purple-400)" />
  </div>
</Link>
```

### Option 2: Add to Dashboard Quick Actions

```jsx
<Link to="/settings">
  <Button className="w-full" size="lg" variant="ghost">
    <Settings className="w-5 h-5" />
    Settings
  </Button>
</Link>
```

---

## Add Route

Add to `App.jsx`:

```jsx
import Settings from './pages/Settings';

// In routes:
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>
```

---

## Using Settings Values

To use these settings elsewhere in the app (e.g., care thresholds):

### Create a Settings Hook

```jsx
// src/hooks/useSettings.js

import { useState, useEffect, createContext, useContext } from 'react';

const DEFAULT_SETTINGS = {
  wateringThreshold: 7,
  fertilizingThreshold: 14,
  groomingThreshold: 7,
  defaultView: 'grid',
  plantsPerPage: 24,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saintpaulia-settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);
  
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('saintpaulia-settings', JSON.stringify(newSettings));
  };
  
  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
```

### Wrap App with Provider

```jsx
// In App.jsx
import { SettingsProvider } from './hooks/useSettings';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Update Care Status Utils

```jsx
// src/utils/careStatus.js

// Instead of hardcoded thresholds, accept them as parameters:
export function getCareStatus(lastCareDate, daysThreshold) {
  // ... existing logic
}

// When using in components:
const { settings } = useSettings();
const wateringStatus = getCareStatus(plant.last_watered, settings.wateringThreshold);
```

---

## Component Structure

```
src/
├── hooks/
│   └── useSettings.js        # New: settings context and hook
└── pages/
    └── Settings.jsx          # New: settings page
```

---

## Implementation Checklist

- [x] Create `Settings.jsx` page
- [x] Add `/settings` route to `App.jsx`
- [x] Add settings navigation (icon in header or dashboard link) — **Settings icon in Dashboard header**
- [x] Create `useSettings.js` hook — **Created as `useSettings.jsx`**
- [x] Wrap app with `SettingsProvider`
- [x] Test logout flow
- [x] Test settings persistence (localStorage)
- [x] Update `careStatus.js` to use dynamic thresholds (optional) — **Implemented with thresholds parameter**
- [x] Test settings apply to care indicators — **Dashboard uses `careThresholds` from `useSettings`**

---

## Quality Checklist

- [x] Sections are clearly organized
- [x] Account info displays correctly
- [x] Dropdowns match app styling
- [x] Settings persist after page refresh
- [x] Logout has confirmation step
- [x] Logout redirects to login page
- [x] Danger zone is visually distinct
- [x] Settings icon/link is discoverable
- [x] Page is responsive on mobile

---

## Future Enhancements

Once the basic page is working, you could add:

- **Change password** — Link to Supabase password reset
- **Email preferences** — If you add email notifications
- **Export data** — Download collection as JSON/CSV
- **Delete account** — With confirmation and data cleanup
- **Theme toggle** — Light/dark mode (if you add dark theme)
- **Sync settings to database** — Store in a `user_preferences` table instead of localStorage
