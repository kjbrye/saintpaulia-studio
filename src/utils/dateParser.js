/**
 * Lenient date parsing for spreadsheet imports.
 *
 * Spreadsheets store dates in many shapes: ISO strings, US/EU slash formats,
 * "March 15, 2024" prose, and Excel serial numbers. This util tries them in
 * order and returns an ISO date string ('YYYY-MM-DD') or null on failure.
 */

import { parse, isValid, format } from 'date-fns';

const FORMATS = [
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'MM/dd/yyyy',
  'M/d/yyyy',
  'MM-dd-yyyy',
  'M-d-yyyy',
  'dd/MM/yyyy',
  'd/M/yyyy',
  'MMMM d, yyyy',
  'MMM d, yyyy',
  'MMMM d yyyy',
  'd MMMM yyyy',
  'd MMM yyyy',
  'yyyy.MM.dd',
];

// Excel/Sheets epoch is 1899-12-30 (compensates for the 1900 leap-year bug).
const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));

function fromExcelSerial(n) {
  const ms = n * 86400 * 1000;
  return new Date(EXCEL_EPOCH.getTime() + ms);
}

/**
 * Parse a value that might be a date in any of the common formats.
 * Returns 'YYYY-MM-DD' or null.
 */
export function parseFlexibleDate(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    return isValid(value) ? format(value, 'yyyy-MM-dd') : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = fromExcelSerial(value);
    return isValid(d) ? format(d, 'yyyy-MM-dd') : null;
  }

  const str = String(value).trim();
  if (!str) return null;

  // Excel serials sometimes arrive as numeric strings.
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = Number(str);
    if (n > 1 && n < 100000) {
      const d = fromExcelSerial(n);
      if (isValid(d)) return format(d, 'yyyy-MM-dd');
    }
  }

  // ISO 8601 with time component.
  const isoLike = new Date(str);
  if (isValid(isoLike) && /^\d{4}-\d{2}-\d{2}/.test(str)) {
    return format(isoLike, 'yyyy-MM-dd');
  }

  for (const fmt of FORMATS) {
    const parsed = parse(str, fmt, new Date());
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
  }

  return null;
}
