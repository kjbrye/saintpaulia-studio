/**
 * Import Page
 *
 * Thin orchestrator. State and mutations live in useImportFlow; each step
 * is its own component under components/import.
 */

import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useImportFlow } from '../hooks/useImportFlow';

import CapacityIndicator from '../components/import/CapacityIndicator';
import StepIndicator from '../components/import/StepIndicator';
import UploadStep from '../components/import/UploadStep';
import MapStep from '../components/import/MapStep';
import ReviewStep from '../components/import/ReviewStep';
import ConfirmStep from '../components/import/ConfirmStep';
import ResultStep from '../components/import/ResultStep';

export default function Import() {
  usePageTitle('Import Plants');
  const navigate = useNavigate();
  const f = useImportFlow();

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <Link to="/library">
            <button type="button" className="icon-container" aria-label="Back to library">
              <ArrowLeft size={20} style={{ color: 'var(--sage-600)' }} />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="heading heading-xl">Import Plants</h1>
            <p className="text-small" style={{ color: 'var(--text-muted)' }}>
              Bring your existing collection over from a CSV or XLSX spreadsheet.
            </p>
          </div>
          <CapacityIndicator capacity={f.capacity} compact />
        </header>

        <StepIndicator current={f.step} />

        {f.step === 'upload' && (
          <UploadStep
            file={f.flow.file}
            capacity={f.capacity}
            currentPlantCount={f.capacity?.currentPlantCount ?? 0}
            onFileSelected={f.handleFileSelected}
            onClear={f.reset}
            parseError={f.parseError}
            blockedNoCapacity={f.blockedNoCapacity}
            canContinue={f.flow.columns.length > 0 && !f.blockedNoCapacity}
            onContinue={() => f.setStep('map')}
          />
        )}

        {f.step === 'map' && (
          <MapStep
            columns={f.flow.columns}
            rows={f.flow.rows}
            mapping={f.flow.mapping}
            onChange={f.setMapping}
            onBack={() => f.setStep('upload')}
            onContinue={f.goToReview}
          />
        )}

        {f.step === 'review' && (
          <ReviewStep
            processed={f.flow.processed}
            selectedKeys={f.flow.selectedKeys}
            onSelectionChange={f.setSelection}
            onReorder={f.setProcessed}
            capacity={f.capacity}
            overCapacity={f.overCapacity}
            totalRows={f.totalRows}
            onBack={() => f.setStep('map')}
            onContinue={() => f.setStep('confirm')}
          />
        )}

        {f.step === 'confirm' && (
          <ConfirmStep
            filename={f.flow.file.name}
            selectedCount={f.flow.selectedKeys.size}
            totalRows={f.totalRows}
            isImporting={f.isImporting}
            onBack={() => f.setStep('review')}
            onConfirm={f.handleConfirmImport}
          />
        )}

        {f.step === 'result' && f.importResult && (
          <ResultStep
            result={f.importResult}
            filename={f.flow.file.name}
            selectedCount={f.flow.selectedKeys.size}
            totalRows={f.totalRows}
            isRollingBack={f.isRollingBack}
            onRollback={f.handleRollback}
            onDone={() => navigate('/library')}
            onImportAnother={f.reset}
          />
        )}
      </div>
    </div>
  );
}
