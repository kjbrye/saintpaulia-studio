/**
 * CustomOptionsCard
 *
 * Merges the former Custom Fertilizers / Treatments / Locations cards into one
 * tabbed card. Each tab has an add-input row and shows its saved values as
 * removable chips.
 *
 * Values are stored as plain strings in the settings blob and are copied onto
 * care logs by value, so removing an option here never breaks historical logs —
 * the log keeps its own text.
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.jsx';
import SettingsCard from './SettingsCard';
import { CUSTOM_OPTION_TABS, SETTINGS_COPY } from '../../constants/settings';

export default function CustomOptionsCard() {
  const { settings, updateSetting } = useSettings();
  const [activeTabId, setActiveTabId] = useState(CUSTOM_OPTION_TABS[0].id);
  const [newValue, setNewValue] = useState('');

  const copy = SETTINGS_COPY.care.custom;
  const activeTab = CUSTOM_OPTION_TABS.find((t) => t.id === activeTabId);
  const items = settings[activeTab.settingKey] || [];

  const handleAdd = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    if (items.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setNewValue('');
      return;
    }
    updateSetting(activeTab.settingKey, [...items, trimmed]);
    setNewValue('');
  };

  const handleRemove = (index) => {
    updateSetting(
      activeTab.settingKey,
      items.filter((_, i) => i !== index),
    );
  };

  const switchTab = (id) => {
    setActiveTabId(id);
    setNewValue('');
  };

  return (
    <SettingsCard label={copy.label} description={copy.description}>
      {/* Tabs */}
      <div role="tablist" aria-label={copy.label} className="flex flex-wrap gap-2 mb-4">
        {CUSTOM_OPTION_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={tab.id === activeTabId}
            onClick={() => switchTab(tab.id)}
            className="custom-tab"
            data-active={tab.id === activeTabId ? 'true' : 'false'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add row */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={activeTab.placeholder}
          className="input flex-1 py-2 text-small"
          maxLength={50}
          aria-label={`Add ${activeTab.label.toLowerCase()}`}
        />
        <button
          onClick={handleAdd}
          disabled={!newValue.trim()}
          className="btn btn-primary flex items-center gap-1"
        >
          <Plus size={16} />
          {copy.add}
        </button>
      </div>

      {/* Saved values as removable chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((value, index) => (
            <span key={`${value}-${index}`} className="settings-chip">
              {value}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="settings-chip-remove"
                aria-label={`Remove ${value}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
