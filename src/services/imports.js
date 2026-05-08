/**
 * Imports Service
 *
 * Database & file-parsing operations for the plant import feature.
 * Components never call these directly -- they go through useImport hooks.
 */

import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { supabase, requireUserId } from '../api/supabase';
import { PLANS } from '../constants/plans';

/**
 * Parse a user-uploaded File (CSV or XLSX) into { columns, rows, fileType }.
 *
 * - columns: array of header strings as they appeared in the file
 * - rows: array of objects keyed by column name
 * - fileType: 'csv' | 'xlsx'
 *
 * Throws on unsupported file types or unreadable content. The first sheet
 * of an XLSX file is used; multi-sheet support is a follow-up.
 */
export async function parseFile(file) {
  if (!file) throw new Error('No file provided');

  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseCsv(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xlsm')) return parseXlsx(file);
  throw new Error('Unsupported file type. Please upload a .csv or .xlsx file.');
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => (h ?? '').trim(),
      complete: (result) => {
        const columns = (result.meta?.fields ?? []).filter(Boolean);
        const rows = result.data.filter((r) => Object.values(r).some((v) => v !== '' && v != null));
        resolve({ columns, rows, fileType: 'csv' });
      },
      error: (err) => reject(err),
    });
  });
}

async function parseXlsx(file) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('The spreadsheet has no sheets.');

  const headerRow = sheet.getRow(1);
  const columns = [];
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    columns.push(String(cell.value ?? '').trim());
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    let hasValue = false;
    columns.forEach((col, idx) => {
      const cell = row.getCell(idx + 1);
      let value = cell.value;
      // ExcelJS returns rich objects for formulas, hyperlinks, etc.
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        if (value.result !== undefined) value = value.result;
        else if (value.text !== undefined) value = value.text;
        else if (value.richText) value = value.richText.map((r) => r.text).join('');
        else value = String(value);
      }
      if (value !== null && value !== undefined && value !== '') hasValue = true;
      obj[col] = value ?? '';
    });
    if (hasValue) rows.push(obj);
  });

  return { columns, rows, fileType: 'xlsx' };
}

/**
 * Get the user's plan and how many plants they can still add.
 * Returns { plan, currentPlantCount, maxPlants, availableCapacity }.
 *
 * For premium users, maxPlants and availableCapacity are Infinity. The
 * caller is responsible for converting Infinity to "no limit" UI.
 */
export async function getUserCapacity() {
  const userId = await requireUserId();

  const [subResult, countResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('plants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  if (subResult.error) throw subResult.error;
  if (countResult.error) throw countResult.error;

  const sub = subResult.data;
  const isPremium =
    sub?.plan === 'premium' && ['active', 'trialing'].includes(sub?.status);
  const plan = isPremium ? 'premium' : 'free';
  const maxPlants = isPremium ? Infinity : PLANS.free.plantLimit;
  const currentPlantCount = countResult.count ?? 0;
  const availableCapacity = isPremium
    ? Infinity
    : Math.max(0, maxPlants - currentPlantCount);

  return { plan, currentPlantCount, maxPlants, availableCapacity };
}

/**
 * Insert a row into import_batches and return it.
 */
export async function createImportBatch({ filename, fileType, rowCount }) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('import_batches')
    .insert({ user_id, filename, file_type: fileType, row_count: rowCount })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Bulk-insert plants tagged with import_batch_id. The caller must have
 * already trimmed plantsArray to fit availableCapacity. We still surface
 * trigger errors clearly because a parallel tab could have changed the
 * count between the capacity check and the import.
 *
 * Returns { successCount, errorCount, errors, batch } where errors is an
 * array of { rowIndex, message } describing each rejected row.
 */
export async function importPlants(plantsArray, batchId) {
  if (!plantsArray.length) {
    return { successCount: 0, errorCount: 0, errors: [], batchId };
  }

  const user_id = await requireUserId();
  const payload = plantsArray.map((p) => ({
    ...p,
    user_id,
    import_batch_id: batchId,
  }));

  // Try a single batch insert first -- much cheaper for the common case
  // where the user respects their cap.
  const { data, error } = await supabase.from('plants').insert(payload).select('id');

  if (!error) {
    return {
      successCount: data?.length ?? payload.length,
      errorCount: 0,
      errors: [],
      batchId,
    };
  }

  // Fall back to row-by-row so we can surface which rows failed and still
  // import the ones that fit. Common cause: trigger rejects rows past the cap.
  const errors = [];
  let successCount = 0;
  for (let i = 0; i < payload.length; i++) {
    const { error: rowError } = await supabase
      .from('plants')
      .insert(payload[i])
      .select('id')
      .single();
    if (rowError) {
      errors.push({
        rowIndex: i,
        message: rowError.message || 'Insert failed',
      });
    } else {
      successCount++;
    }
  }

  // Keep the batch's row_count accurate to what actually landed.
  if (successCount !== payload.length) {
    await supabase
      .from('import_batches')
      .update({ row_count: successCount })
      .eq('id', batchId);
  }

  return {
    successCount,
    errorCount: errors.length,
    errors,
    batchId,
  };
}

/**
 * Delete every plant tagged with this batch_id and mark the batch
 * rolled_back. The plants delete cascades to care/bloom/health/journal
 * via existing FK constraints with on delete cascade -- if those don't
 * exist, the user will see a foreign key error here, which is the right
 * signal to investigate rather than silently ignore.
 */
export async function rollbackImport(batchId) {
  const userId = await requireUserId();

  // Delete plants belonging to this batch + user (RLS enforces user_id too).
  const { error: deleteError } = await supabase
    .from('plants')
    .delete()
    .eq('import_batch_id', batchId)
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  const { data, error: updateError } = await supabase
    .from('import_batches')
    .update({ status: 'rolled_back', rolled_back_at: new Date().toISOString() })
    .eq('id', batchId)
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) throw updateError;
  return data;
}

/**
 * Recent imports for displaying in a panel. Defaults to 10 newest.
 */
export async function getRecentImports(limit = 10) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('import_batches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
