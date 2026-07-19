/**
 * DataPane
 *
 * Import and export, separated by a thin divider. The flows themselves are
 * unchanged — only the buttons that launch them live here.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { exportAllData } from '../../../services/export';
import SettingsCard from '../SettingsCard';
import { SETTINGS_COPY } from '../../../constants/settings';

const copy = SETTINGS_COPY.data;

export default function DataPane() {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const count = await exportAllData();
      toast.success(`Exported ${count} file${count > 1 ? 's' : ''} successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SettingsCard label={copy.label}>
      <div>
        <h3 className="text-body font-semibold mb-1">{copy.import.heading}</h3>
        <p className="settings-desc mb-4">{copy.import.description}</p>
        <Link to="/import" className="btn btn-secondary inline-flex items-center gap-2">
          <Upload size={18} />
          {copy.import.button}
        </Link>
      </div>

      <div className="settings-divider mt-6 pt-6">
        <h3 className="text-body font-semibold mb-1">{copy.export.heading}</h3>
        <p className="settings-desc mb-4">{copy.export.description}</p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download size={18} />
          {isExporting ? copy.export.exporting : copy.export.button}
        </button>
      </div>
    </SettingsCard>
  );
}
