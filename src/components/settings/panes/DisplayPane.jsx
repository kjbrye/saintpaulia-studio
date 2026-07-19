/**
 * DisplayPane
 *
 * Display preferences and accessibility toggles, grouped within one card and
 * separated by a thin divider.
 */

import { useSettings } from '../../../hooks/useSettings.jsx';
import SettingsCard from '../SettingsCard';
import SelectRow from '../SelectRow';
import ToggleRow from '../ToggleRow';
import { SETTINGS_COPY, VIEW_OPTIONS, PER_PAGE_OPTIONS } from '../../../constants/settings';

const copy = SETTINGS_COPY.display;

export default function DisplayPane() {
  const { settings, updateSetting } = useSettings();

  return (
    <SettingsCard label={copy.display.label}>
      <div className="setting-rows">
        <SelectRow
          label={copy.display.defaultView}
          value={settings.defaultView}
          options={VIEW_OPTIONS}
          onChange={(v) => updateSetting('defaultView', v)}
        />
        <SelectRow
          label={copy.display.plantsPerPage}
          value={settings.plantsPerPage}
          options={PER_PAGE_OPTIONS}
          onChange={(v) => updateSetting('plantsPerPage', v)}
        />
      </div>

      <div className="settings-divider mt-6 pt-6">
        <h3 className="settings-label mb-1">{copy.accessibility.label}</h3>
        <p className="settings-desc mb-2">{copy.accessibility.description}</p>
        <div className="setting-rows">
          <ToggleRow
            label={copy.accessibility.highContrast.label}
            description={copy.accessibility.highContrast.help}
            checked={settings.highContrast}
            onChange={(v) => updateSetting('highContrast', v)}
          />
          <ToggleRow
            label={copy.accessibility.reduceMotion.label}
            description={copy.accessibility.reduceMotion.help}
            checked={settings.reducedMotion}
            onChange={(v) => updateSetting('reducedMotion', v)}
          />
          <ToggleRow
            label={copy.accessibility.largerText.label}
            description={copy.accessibility.largerText.help}
            checked={settings.largeText}
            onChange={(v) => updateSetting('largeText', v)}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
