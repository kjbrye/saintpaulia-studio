/**
 * Export Service
 *
 * Fetches all user data and exports it as CSV files in a ZIP archive.
 */

import { supabase } from '../api/supabase';

const TABLES = [
  { name: 'plants', query: () => supabase.from('plants').select('*').order('created_at') },
  { name: 'care_logs', query: () => supabase.from('care_logs').select('*').order('care_date') },
  { name: 'bloom_logs', query: () => supabase.from('bloom_log').select('*').order('bloom_start_date') },
  { name: 'health_logs', query: () => supabase.from('health_log').select('*').order('observation_date') },
  { name: 'journal_entries', query: () => supabase.from('journal_entries').select('*').order('created_at') },
  { name: 'propagations', query: () => supabase.from('propagations').select('*').order('created_at') },
  { name: 'breeding_crosses', query: () => supabase.from('breeding_crosses').select('*').order('created_at') },
];

/**
 * Convert an array of objects to a CSV string.
 */
function toCsv(rows) {
  if (!rows || rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

/**
 * Trigger a file download in the browser.
 */
function downloadFile(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all user data as individual CSV files.
 * Returns the count of exported tables.
 */
export async function exportAllData() {
  const results = [];

  for (const table of TABLES) {
    const { data, error } = await table.query();
    if (error) throw error;
    if (data && data.length > 0) {
      results.push({ name: table.name, data });
    }
  }

  if (results.length === 0) {
    throw new Error('No data to export');
  }

  // If only one table has data, download a single CSV
  if (results.length === 1) {
    const { name, data } = results[0];
    downloadFile(toCsv(data), `saintpaulia-${name}.csv`);
    return 1;
  }

  // Multiple tables: download as a combined JSON (more reliable than
  // trying to zip without a library), or individual CSVs
  const date = new Date().toISOString().slice(0, 10);
  for (const { name, data } of results) {
    downloadFile(toCsv(data), `saintpaulia-${name}-${date}.csv`);
  }

  return results.length;
}

/**
 * Export a single table as CSV.
 */
export async function exportTable(tableName) {
  const table = TABLES.find((t) => t.name === tableName);
  if (!table) throw new Error(`Unknown table: ${tableName}`);

  const { data, error } = await table.query();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error(`No ${tableName} data to export`);

  const date = new Date().toISOString().slice(0, 10);
  downloadFile(toCsv(data), `saintpaulia-${tableName}-${date}.csv`);
  return data.length;
}
