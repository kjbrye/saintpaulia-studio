/**
 * CarePane
 *
 * Care reminder thresholds + the merged custom-options card.
 */

import { useSettings } from '../../../hooks/useSettings.jsx';
import SettingsCard from '../SettingsCard';
import SelectRow from '../SelectRow';
import CustomOptionsCard from '../CustomOptionsCard';
import {
  SETTINGS_COPY,
  WATERING_OPTIONS,
  FERTILIZING_OPTIONS,
  GROOMING_OPTIONS,
  REPOTTING_OPTIONS,
} from '../../../constants/settings';

const copy = SETTINGS_COPY.care.reminders;

export default function CarePane() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-6">
      <SettingsCard label={copy.label} description={copy.description}>
        <div className="setting-rows">
          <SelectRow
            label={copy.watering}
            value={settings.wateringThreshold}
            options={WATERING_OPTIONS}
            onChange={(v) => updateSetting('wateringThreshold', v)}
          />
          <SelectRow
            label={copy.fertilizing}
            value={settings.fertilizingThreshold}
            options={FERTILIZING_OPTIONS}
            onChange={(v) => updateSetting('fertilizingThreshold', v)}
          />
          <SelectRow
            label={copy.grooming}
            value={settings.groomingThreshold}
            options={GROOMING_OPTIONS}
            onChange={(v) => updateSetting('groomingThreshold', v)}
          />
          <SelectRow
            label={copy.repotting}
            value={settings.repottingThreshold}
            options={REPOTTING_OPTIONS}
            onChange={(v) => updateSetting('repottingThreshold', v)}
          />
        </div>
      </SettingsCard>

      <CustomOptionsCard />
    </div>
  );
}
