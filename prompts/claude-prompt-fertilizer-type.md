# Claude Code Prompt: Fertilizer Type Selection

## Context

You're enhancing the Care Tracking feature to allow users to specify what type of fertilizer they used when logging a fertilizing action. This should be optional and not slow down the quick-care workflow.

**Files to modify:**
- `src/components/care/CareActionButton.jsx` — Add fertilizer selection
- `src/components/care/CareLogItem.jsx` — Display fertilizer type
- `src/services/care.js` — Update `logCare()` if needed

## Approach

When user clicks "Fertilize", show a small dropdown/popover to select fertilizer type, then log the care with that info in the `notes` field (or a dedicated `fertilizer_type` column if you want to add one).

---

## Option A: Use Notes Field (No DB Change)

Store fertilizer type in the existing `notes` field as structured data or a prefix.

### Updated CareActionButton

```jsx
// src/components/care/CareActionButton.jsx

import { useState, useRef, useEffect } from 'react';
import { Droplets, Scissors, Sparkles, Check, ChevronDown } from 'lucide-react';

const CARE_CONFIG = {
  watering: {
    icon: Droplets,
    label: 'Water',
    color: 'var(--sage-500)',
    bgColor: 'var(--sage-100)',
  },
  fertilizing: {
    icon: Sparkles,
    label: 'Fertilize',
    color: 'var(--purple-400)',
    bgColor: 'var(--purple-100)',
    hasOptions: true,
  },
  grooming: {
    icon: Scissors,
    label: 'Groom',
    color: 'var(--copper-500)',
    bgColor: 'rgba(200, 141, 109, 0.15)',
  },
};

const FERTILIZER_OPTIONS = [
  { value: 'balanced', label: 'Balanced (20-20-20)' },
  { value: 'bloom', label: 'Bloom Booster' },
  { value: 'foliage', label: 'Foliage/Growth' },
  { value: 'organic', label: 'Organic' },
  { value: 'slow_release', label: 'Slow Release' },
  { value: 'other', label: 'Other' },
];

function CareActionButton({ careType, onLog, isLogging, lastCareDate }) {
  const [justLogged, setJustLogged] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  
  const config = CARE_CONFIG[careType];
  const Icon = config.icon;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOptions]);
  
  const handleClick = async (fertilizerType = null) => {
    const notes = fertilizerType 
      ? `Fertilizer: ${FERTILIZER_OPTIONS.find(o => o.value === fertilizerType)?.label || fertilizerType}`
      : '';
    
    await onLog(careType, notes);
    setShowOptions(false);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };
  
  const handleButtonClick = () => {
    if (config.hasOptions) {
      setShowOptions(!showOptions);
    } else {
      handleClick();
    }
  };
  
  const daysSince = lastCareDate 
    ? Math.floor((new Date() - new Date(lastCareDate)) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <div className="relative" ref={optionsRef}>
      <button
        onClick={handleButtonClick}
        disabled={isLogging || justLogged}
        className="card-subtle p-4 flex flex-col items-center gap-2 min-w-[100px] transition-all"
        style={{ opacity: justLogged ? 0.7 : 1 }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: justLogged ? 'var(--color-success)' : config.bgColor,
          }}
        >
          {justLogged ? (
            <Check size={24} color="white" />
          ) : (
            <Icon size={24} color={config.color} />
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-small font-semibold text-sage-700">
            {justLogged ? 'Done!' : config.label}
          </span>
          {config.hasOptions && !justLogged && (
            <ChevronDown size={14} color="var(--sage-500)" />
          )}
        </div>
        {daysSince !== null && !justLogged && (
          <span className="text-xs text-muted">
            {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
          </span>
        )}
      </button>
      
      {/* Fertilizer Options Dropdown */}
      {showOptions && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10">
          <div className="card p-2 min-w-[180px] shadow-lg">
            <p className="text-xs text-muted px-3 py-1 mb-1">Select fertilizer type</p>
            {FERTILIZER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleClick(option.value)}
                className="w-full text-left px-3 py-2 text-small rounded-lg hover:bg-sage-100 transition-colors"
              >
                {option.label}
              </button>
            ))}
            <div className="border-t border-sage-200 mt-1 pt-1">
              <button
                onClick={() => handleClick()}
                className="w-full text-left px-3 py-2 text-small text-muted rounded-lg hover:bg-sage-100 transition-colors"
              >
                Skip / Not sure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareActionButton;
```

### Update onLog Handler

In `PlantDetail.jsx`, update the handler to accept notes:

```jsx
const handleLogCare = async (careType, notes = '') => {
  try {
    await logCare.mutateAsync({
      plantId: plant.id,
      careType,
      notes,
    });
  } catch (error) {
    console.error('Failed to log care:', error);
  }
};
```

### Update CareLogItem to Display Fertilizer Type

```jsx
// In CareLogItem.jsx

function CareLogItem({ log, showPlantName = false, plantName }) {
  const Icon = CARE_ICONS[log.care_type] || Droplets;
  const colors = CARE_COLORS[log.care_type] || CARE_COLORS.watering;
  
  // Extract fertilizer type from notes if present
  const fertilizerType = log.notes?.startsWith('Fertilizer:') 
    ? log.notes.replace('Fertilizer: ', '')
    : null;
  
  const displayNotes = fertilizerType ? null : log.notes; // Don't show raw "Fertilizer:" prefix
  
  const date = new Date(log.care_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  
  return (
    <div className="flex items-center gap-4 py-3">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: colors.bg }}
      >
        <Icon size={20} color={colors.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium">
          <span className="capitalize">{log.care_type}</span>
          {fertilizerType && (
            <span className="text-purple-400 font-normal"> • {fertilizerType}</span>
          )}
          {showPlantName && plantName && (
            <span className="text-muted font-normal"> — {plantName}</span>
          )}
        </p>
        {displayNotes && (
          <p className="text-small text-muted truncate">{displayNotes}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-small text-sage-700">{formattedDate}</p>
        <p className="text-xs text-muted">{formattedTime}</p>
      </div>
    </div>
  );
}
```

---

## Option B: Add Database Column (Cleaner, More Queryable)

If you want to track fertilizer types properly for analytics later:

### 1. Add Column to care_logs Table

```sql
ALTER TABLE care_logs 
ADD COLUMN fertilizer_type TEXT;
```

### 2. Update Care Service

```jsx
// src/services/care.js

export async function logCare(plantId, careType, notes = '', fertilizerType = null) {
  const now = new Date().toISOString();
  
  // Create the care log
  const careLog = await createCareLog({
    plant_id: plantId,
    care_type: careType,
    care_date: now,
    notes,
    fertilizer_type: careType === 'fertilizing' ? fertilizerType : null,
  });

  // Update the plant's last care date
  // ... rest of function
}
```

### 3. Update Hook Call

```jsx
// In useLogCare mutation
mutationFn: ({ plantId, careType, notes, fertilizerType }) => 
  careService.logCare(plantId, careType, notes, fertilizerType),
```

### 4. Update CareActionButton

```jsx
const handleClick = async (fertilizerType = null) => {
  await onLog(careType, '', fertilizerType);
  // ...
};
```

### 5. Update Handler in PlantDetail

```jsx
const handleLogCare = async (careType, notes = '', fertilizerType = null) => {
  try {
    await logCare.mutateAsync({
      plantId: plant.id,
      careType,
      notes,
      fertilizerType,
    });
  } catch (error) {
    console.error('Failed to log care:', error);
  }
};
```

---

## Customizing Fertilizer Options

You may want to let users add their own fertilizer types. For now, the preset list covers common options:

```jsx
const FERTILIZER_OPTIONS = [
  { value: 'balanced', label: 'Balanced (20-20-20)' },
  { value: 'bloom', label: 'Bloom Booster' },
  { value: 'foliage', label: 'Foliage/Growth' },
  { value: 'organic', label: 'Organic' },
  { value: 'slow_release', label: 'Slow Release' },
  { value: 'other', label: 'Other' },
];
```

You can customize these labels for African violet-specific fertilizers if you prefer (e.g., "Optimara Violet Food", "Schultz African Violet", etc.).

---

## Implementation Checklist

- [x] Choose Option A (notes field) or Option B (database column) — **Option B chosen**
- [x] Update `CareActionButton.jsx` with dropdown — **Implemented in `QuickCareActions.jsx`**
- [x] Update `onLog` handler to pass fertilizer type
- [x] Update `CareLogItem.jsx` to display fertilizer type
- [x] If Option B: Run SQL migration
- [x] If Option B: Update `care.js` service
- [x] Test dropdown appears only for Fertilize button
- [x] Test "Skip" option works
- [x] Test fertilizer type displays in care history
- [x] Test fertilizer type displays in care log page

---

## Quality Checklist

- [x] Dropdown is positioned correctly (doesn't get cut off)
- [x] Dropdown closes when clicking outside
- [x] Fertilizer type shows in purple to match fertilize color
- [x] "Skip" option available for quick logging
- [x] Water and Groom buttons unchanged (no dropdown)
- [x] Works on mobile (dropdown doesn't overflow screen)
