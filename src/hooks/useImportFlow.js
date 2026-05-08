/**
 * useImportFlow
 *
 * Owns the multi-step state machine for the Import page: file parsing,
 * column mapping, row selection, commit, and rollback. Pulled out of the
 * page so the page itself stays a thin orchestrator.
 */

import { useReducer, useState } from 'react';
import { useToast } from './useToast';
import { useUserCapacity, useImportPlants, useRollbackImport } from './useImport';
import * as importsService from '../services/imports';
import { detectColumnMappings, processRows } from '../utils/importMapping';

function initialFlow() {
  return {
    file: null,
    fileType: null,
    columns: [],
    rows: [],
    mapping: {},
    processed: [],
    selectedKeys: new Set(),
  };
}

function flowReducer(state, action) {
  switch (action.type) {
    case 'set_file':
      return { ...initialFlow(), file: action.file };
    case 'set_parsed':
      return {
        ...state,
        columns: action.columns,
        rows: action.rows,
        fileType: action.fileType,
        mapping: detectColumnMappings(action.columns),
      };
    case 'set_mapping':
      return { ...state, mapping: action.mapping };
    case 'set_processed':
      return { ...state, processed: action.processed, selectedKeys: action.selectedKeys };
    case 'set_selection':
      return { ...state, selectedKeys: action.selectedKeys };
    case 'reorder':
      return { ...state, processed: action.processed };
    case 'reset':
      return initialFlow();
    default:
      return state;
  }
}

export function useImportFlow() {
  const toast = useToast();
  const { data: capacity } = useUserCapacity();
  const importPlants = useImportPlants();
  const rollback = useRollbackImport();

  const [step, setStep] = useState('upload');
  const [flow, dispatch] = useReducer(flowReducer, undefined, initialFlow);
  const [parseError, setParseError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const cap = capacity?.availableCapacity ?? 0;
  const isPremium = capacity?.plan === 'premium';
  const totalRows = flow.rows.length;
  const overCapacity = !isPremium && totalRows > cap;
  const blockedNoCapacity = !isPremium && cap === 0 && totalRows > 0;

  async function handleFileSelected(file) {
    dispatch({ type: 'set_file', file });
    setParseError(null);
    try {
      const { columns, rows, fileType } = await importsService.parseFile(file);
      if (!rows.length) {
        setParseError('That file looks empty. Please check it and try again.');
        return;
      }
      dispatch({ type: 'set_parsed', columns, rows, fileType });
    } catch (err) {
      setParseError(err.message || 'Could not read that file.');
    }
  }

  function goToReview() {
    const processed = processRows(flow.rows, flow.mapping);
    const limit = isPremium ? processed.length : cap;
    const initial = new Set();
    for (const row of processed) {
      if (initial.size >= limit) break;
      if (row.valid) initial.add(row._key);
    }
    dispatch({ type: 'set_processed', processed, selectedKeys: initial });
    setStep('review');
  }

  async function handleConfirmImport() {
    const plants = flow.processed
      .filter((r) => flow.selectedKeys.has(r._key))
      .map((r) => r.normalized);
    try {
      const result = await importPlants.mutateAsync({
        filename: flow.file.name,
        fileType: flow.fileType,
        plants,
      });
      setImportResult(result);
      setStep('result');
    } catch (err) {
      toast.error(err.message || 'Import failed. Please try again.');
    }
  }

  async function handleRollback(batchId) {
    try {
      await rollback.mutateAsync(batchId);
      toast.success('Import undone.');
      reset();
    } catch (err) {
      toast.error(err.message || 'Could not undo the import.');
    }
  }

  function reset() {
    dispatch({ type: 'reset' });
    setImportResult(null);
    setStep('upload');
  }

  return {
    // state
    step,
    setStep,
    flow,
    capacity,
    parseError,
    importResult,
    overCapacity,
    blockedNoCapacity,
    totalRows,

    // mutation flags
    isImporting: importPlants.isPending,
    isRollingBack: rollback.isPending,

    // actions
    handleFileSelected,
    setMapping: (mapping) => dispatch({ type: 'set_mapping', mapping }),
    setSelection: (selectedKeys) => dispatch({ type: 'set_selection', selectedKeys }),
    setProcessed: (processed) => dispatch({ type: 'reorder', processed }),
    goToReview,
    handleConfirmImport,
    handleRollback,
    reset,
  };
}
