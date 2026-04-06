# Claude Code Prompt: Repot Care Option with Pot Size

## Context

You are adding a "Repot" care action to Saintpaulia Studio. Unlike other care types, repotting includes selecting a new pot size, which updates the plant's record. This helps users track their plant's growth over time.

**Files to modify:**
- `src/components/care/CareActionButton.jsx` — Add repotting with pot size selection
- `src/components/care/CareLogItem.jsx` — Display pot size in care history
- `src/services/care.js` — Update `logCare()` to handle repotting
- `src/pages/PlantDetail.jsx` — Add repot button and display current pot size
- `src/utils/careStatus.js` — Add repot threshold (optional)

**Database changes needed:**
- Add `pot_size` column to `plants` table
- Add `last_repotted` column to `plants` table
- Support `repotting` as a care type in `care_logs`

---

## Step 1: Database Migration

Run in Supabase SQL Editor:

```sql
-- Add pot size and last repotted to plants table
ALTER TABLE plants 
ADD COLUMN pot_size TEXT,
ADD COLUMN last_repotted TIMESTAMPTZ;

-- Add pot_size to care_logs for historical tracking
ALTER TABLE care_logs
ADD COLUMN pot_size TEXT;
```

---

## Step 2: Update Care Config

Update the care configuration to include repotting:

```jsx
// In CareActionButton.jsx or a shared constants file

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
  repotting: {
    icon: Flower2,  // or use a pot icon if available
    label: 'Repot',
    color: 'var(--sage-700)',
    bgColor: 'var(--cream-300)',
    hasOptions: true,
  },
};
```

---

## Step 3: Pot Size Options

```jsx
// Pot sizes common for African violets
const POT_SIZE_OPTIONS = [
  { value: '2"', label: '2" (Mini/Starter)' },
  { value: '2.5"', label: '2.5"' },
  { value: '3"', label: '3" (Semi-mini)' },
  { value: '3.5"', label: '3.5"' },
  { value: '4"', label: '4" (Standard)' },
  { value: '4.5"', label: '4.5"' },
  { value: '5"', label: '5" (Large)' },
  { value: '6"', label: '6"' },
  { value: '6"+', label: '6"+ (Extra Large)' },
];
```

---

## Step 4: Update CareActionButton for Repotting

```jsx
// src/components/care/CareActionButton.jsx

import { useState, useRef, useEffect } from 'react';
import { Droplets, Scissors, Sparkles, Flower2, Check, ChevronDown } from 'lucide-react';

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
    optionType: 'fertilizer',
  },
  grooming: {
    icon: Scissors,
    label: 'Groom',
    color: 'var(--copper-500)',
    bgColor: 'rgba(200, 141, 109, 0.15)',
  },
  repotting: {
    icon: Flower2,
    label: 'Repot',
    color: 'var(--sage-700)',
    bgColor: 'var(--cream-300)',
    hasOptions: true,
    optionType: 'potSize',
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

const POT_SIZE_OPTIONS = [
  { value: '2"', label: '2" (Mini/Starter)' },
  { value: '2.5"', label: '2.5"' },
  { value: '3"', label: '3" (Semi-mini)' },
  { value: '3.5"', label: '3.5"' },
  { value: '4"', label: '4" (Standard)' },
  { value: '4.5"', label: '4.5"' },
  { value: '5"', label: '5" (Large)' },
  { value: '6"', label: '6"' },
  { value: '6"+', label: '6"+ (Extra Large)' },
];

function CareActionButton({ 
  careType, 
  onLog, 
  isLogging, 
  lastCareDate,
  currentPotSize, // For repotting - show current size
}) {
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
  
  const handleClick = async (selectedOption = null) => {
    let notes = '';
    let fertilizerType = null;
    let potSize = null;
    
    if (config.optionType === 'fertilizer' && selectedOption) {
      fertilizerType = selectedOption;
      const label = FERTILIZER_OPTIONS.find(o => o.value === selectedOption)?.label;
      notes = `Fertilizer: ${label || selectedOption}`;
    } else if (config.optionType === 'potSize' && selectedOption) {
      potSize = selectedOption;
      const label = POT_SIZE_OPTIONS.find(o => o.value === selectedOption)?.label;
      notes = `Repotted to ${label || selectedOption}`;
    }
    
    await onLog(careType, notes, fertilizerType, potSize);
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
  
  // Get options based on type
  const options = config.optionType === 'fertilizer' 
    ? FERTILIZER_OPTIONS 
    : config.optionType === 'potSize'
    ? POT_SIZE_OPTIONS
    : [];
  
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
        {/* Show current pot size for repot button, days since for others */}
        {careType === 'repotting' && currentPotSize && !justLogged ? (
          <span className="text-xs text-muted">
            Currently {currentPotSize}
          </span>
        ) : daysSince !== null && !justLogged ? (
          <span className="text-xs text-muted">
            {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
          </span>
        ) : null}
      </button>
      
      {/* Options Dropdown */}
      {showOptions && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10">
          <div className="card p-2 min-w-[200px] shadow-lg">
            <p className="text-xs text-muted px-3 py-1 mb-1">
              {config.optionType === 'potSize' 
                ? 'Select new pot size' 
                : 'Select fertilizer type'}
            </p>
            
            {/* Highlight current pot size if repotting */}
            {config.optionType === 'potSize' && currentPotSize && (
              <p className="text-xs text-sage-600 px-3 py-1 mb-1 bg-sage-100 rounded">
                Current: {currentPotSize}
              </p>
            )}
            
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => handleClick(option.value)}
                className={`
                  w-full text-left px-3 py-2 text-small rounded-lg 
                  hover:bg-sage-100 transition-colors
                  ${config.optionType === 'potSize' && option.value === currentPotSize 
                    ? 'text-muted' 
                    : ''}
                `}
              >
                {option.label}
                {config.optionType === 'potSize' && option.value === currentPotSize && (
                  <span className="text-xs text-muted ml-2">(current)</span>
                )}
              </button>
            ))}
            
            {config.optionType === 'fertilizer' && (
              <div className="border-t border-sage-200 mt-1 pt-1">
                <button
                  onClick={() => handleClick()}
                  className="w-full text-left px-3 py-2 text-small text-muted rounded-lg hover:bg-sage-100 transition-colors"
                >
                  Skip / Not sure
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CareActionButton;
```

---

## Step 5: Update Care Service

```jsx
// src/services/care.js

/**
 * Log a care action and update plant's last care date
 * For repotting, also updates the plant's pot_size
 * 
 * @param {string} plantId - Plant ID
 * @param {string} careType - Type of care ('watering', 'fertilizing', 'grooming', 'repotting')
 * @param {string} notes - Optional notes
 * @param {string} fertilizerType - Type of fertilizer used (for fertilizing)
 * @param {string} potSize - New pot size (for repotting)
 * @returns {Promise<Object>} Created care log object
 */
export async function logCare(plantId, careType, notes = '', fertilizerType = null, potSize = null) {
  const now = new Date().toISOString();
  
  // Create the care log
  const { data: careLog, error: careError } = await supabase
    .from('care_logs')
    .insert({
      plant_id: plantId,
      care_type: careType,
      care_date: now,
      notes,
      fertilizer_type: careType === 'fertilizing' ? fertilizerType : null,
      pot_size: careType === 'repotting' ? potSize : null,
    })
    .select()
    .single();

  if (careError) throw careError;

  // Update the plant's last care date
  const updateField = {
    watering: 'last_watered',
    fertilizing: 'last_fertilized',
    grooming: 'last_groomed',
    repotting: 'last_repotted',
  }[careType];

  // Build update object
  const plantUpdate = {};
  if (updateField) {
    plantUpdate[updateField] = now;
  }
  
  // If repotting, also update pot_size on the plant
  if (careType === 'repotting' && potSize) {
    plantUpdate.pot_size = potSize;
  }

  if (Object.keys(plantUpdate).length > 0) {
    const { error: plantError } = await supabase
      .from('plants')
      .update(plantUpdate)
      .eq('id', plantId);

    if (plantError) throw plantError;
  }

  return careLog;
}
```

---

## Step 6: Update useCare Hook

```jsx
// In src/hooks/useCare.js

export function useLogCare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, careType, notes, fertilizerType, potSize }) => 
      careService.logCare(plantId, careType, notes, fertilizerType, potSize),
    onSuccess: (data, { plantId }) => {
      // Invalidate care logs for this plant
      queryClient.invalidateQueries({ queryKey: careKeys.logsByPlant(plantId) });
      // Invalidate recent logs
      queryClient.invalidateQueries({ queryKey: careKeys.logs() });
      // Invalidate plant data (last_watered, pot_size, etc. was updated)
      queryClient.invalidateQueries({ queryKey: plantKeys.detail(plantId) });
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}
```

---

## Step 7: Update PlantDetail.jsx

Add the repot button and display current pot size:

```jsx
// In PlantDetail.jsx

// Update the handleLogCare function:
const handleLogCare = async (careType, notes = '', fertilizerType = null, potSize = null) => {
  try {
    await logCare.mutateAsync({
      plantId: plant.id,
      careType,
      notes,
      fertilizerType,
      potSize,
    });
  } catch (error) {
    console.error('Failed to log care:', error);
  }
};

// In the Quick Care section, add the repot button:
<section className="card p-6 mt-6">
  <h2 className="heading heading-lg mb-4">Quick Care</h2>
  <div className="flex flex-wrap gap-4">
    <CareActionButton
      careType="watering"
      onLog={handleLogCare}
      isLogging={logCare.isPending}
      lastCareDate={plant.last_watered}
    />
    <CareActionButton
      careType="fertilizing"
      onLog={handleLogCare}
      isLogging={logCare.isPending}
      lastCareDate={plant.last_fertilized}
    />
    <CareActionButton
      careType="grooming"
      onLog={handleLogCare}
      isLogging={logCare.isPending}
      lastCareDate={plant.last_groomed}
    />
    <CareActionButton
      careType="repotting"
      onLog={handleLogCare}
      isLogging={logCare.isPending}
      lastCareDate={plant.last_repotted}
      currentPotSize={plant.pot_size}
    />
  </div>
</section>

// Also display pot size in the plant details section:
<EditableField
  label="Pot Size"
  value={isEditing ? formData.pot_size : plant.pot_size}
  displayValue={plant.pot_size || 'Not set'}
  isEditing={isEditing}
  onChange={(v) => updateField('pot_size', v)}
  options={[
    { value: '', label: 'Select size...' },
    { value: '2"', label: '2" (Mini/Starter)' },
    { value: '2.5"', label: '2.5"' },
    { value: '3"', label: '3" (Semi-mini)' },
    { value: '3.5"', label: '3.5"' },
    { value: '4"', label: '4" (Standard)' },
    { value: '4.5"', label: '4.5"' },
    { value: '5"', label: '5" (Large)' },
    { value: '6"', label: '6"' },
    { value: '6"+', label: '6"+ (Extra Large)' },
  ]}
/>
```

---

## Step 8: Update CareLogItem to Display Pot Size

```jsx
// src/components/care/CareLogItem.jsx

import { Droplets, Scissors, Sparkles, Flower2 } from 'lucide-react';

const CARE_ICONS = {
  watering: Droplets,
  fertilizing: Sparkles,
  grooming: Scissors,
  repotting: Flower2,
};

const CARE_COLORS = {
  watering: { icon: 'var(--sage-500)', bg: 'var(--sage-100)' },
  fertilizing: { icon: 'var(--purple-400)', bg: 'var(--purple-100)' },
  grooming: { icon: 'var(--copper-500)', bg: 'rgba(200, 141, 109, 0.15)' },
  repotting: { icon: 'var(--sage-700)', bg: 'var(--cream-300)' },
};

function CareLogItem({ log, showPlantName = false, plantName }) {
  const Icon = CARE_ICONS[log.care_type] || Droplets;
  const colors = CARE_COLORS[log.care_type] || CARE_COLORS.watering;
  
  // Extract info from notes or dedicated fields
  const fertilizerType = log.fertilizer_type 
    || (log.notes?.startsWith('Fertilizer:') ? log.notes.replace('Fertilizer: ', '') : null);
  
  const potSize = log.pot_size
    || (log.notes?.startsWith('Repotted to') ? log.notes.replace('Repotted to ', '') : null);
  
  // Don't show notes if they're just the fertilizer/pot info
  const displayNotes = (fertilizerType || potSize) ? null : log.notes;
  
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
          {potSize && (
            <span className="text-sage-600 font-normal"> • {potSize}</span>
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

export default CareLogItem;
```

---

## Step 9: Update Add Plant Form (Optional)

Allow setting initial pot size when adding a plant:

```jsx
// In AddPlant.jsx, add to formData initial state:
const [formData, setFormData] = useState({
  // ... existing fields
  pot_size: '',
});

// Add field to the form:
<FormField label="Pot Size">
  <select
    className="input w-full"
    value={formData.pot_size}
    onChange={(e) => updateField('pot_size', e.target.value)}
  >
    <option value="">Select size...</option>
    <option value='2"'>2" (Mini/Starter)</option>
    <option value='2.5"'>2.5"</option>
    <option value='3"'>3" (Semi-mini)</option>
    <option value='3.5"'>3.5"</option>
    <option value='4"'>4" (Standard)</option>
    <option value='4.5"'>4.5"</option>
    <option value='5"'>5" (Large)</option>
    <option value='6"'>6"</option>
    <option value='6"+'>6"+ (Extra Large)</option>
  </select>
</FormField>
```

---

## Step 10: Add Repot Filter to Care Log Page

Update `CareLog.jsx` to include repotting in the filter options:

```jsx
const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'watering', label: 'Watering', icon: Droplets },
  { value: 'fertilizing', label: 'Fertilizing', icon: Sparkles },
  { value: 'grooming', label: 'Grooming', icon: Scissors },
  { value: 'repotting', label: 'Repotting', icon: Flower2 },
];
```

---

## Implementation Checklist

- [x] Run SQL migration (add `pot_size` to plants, `last_repotted` to plants, `pot_size` to care_logs) — **User needs to run in Supabase**
- [x] Update `CARE_CONFIG` with repotting option — **In `QuickCareActions.jsx`**
- [x] Add `POT_SIZE_OPTIONS` constant — **In `QuickCareActions.jsx` and `PlantDetail.jsx`**
- [x] Update `CareActionButton.jsx` to handle repotting dropdown — **Implemented in `QuickCareActions.jsx`**
- [x] Update `care.js` service to accept `potSize` parameter
- [x] Update `useCare.js` hook mutation
- [x] Update `PlantDetail.jsx` with repot button and handler
- [x] Add pot size to plant details display/edit
- [x] Update `CareLogItem.jsx` to display pot size
- [x] Add pot size field to Add Plant form
- [x] Add repotting to Care Log page filters
- [ ] Test repotting updates plant's pot_size
- [ ] Test pot size displays in care history
- [ ] Test current pot size shows on repot button

---

## Quality Checklist

- [x] Repot button matches other care button styling
- [x] Pot size dropdown shows current size highlighted
- [x] Plant details update immediately after repotting — **Cache updated on success**
- [x] Care history shows pot size inline
- [x] Pot size editable in plant edit mode
- [x] Initial pot size can be set when adding plant
- [x] Filter works on care log page
- [x] Pot sizes are African violet appropriate (2" - 6"+)
