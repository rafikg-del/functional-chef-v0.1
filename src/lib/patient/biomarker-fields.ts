import type { BiomarkerMap } from './types';

export interface BiomarkerField {
  key: string;
  label: string;
  unit: string;
}

export interface BiomarkerRow extends BiomarkerField {
  value: string;
}

export const DEFAULT_BIOMARKER_FIELDS: BiomarkerField[] = [
  { key: 'fasting_glucose', label: 'Glycémie à jeun', unit: 'g/L' },
  { key: 'fasting_insulin', label: 'Insuline', unit: 'mUI/L' },
  { key: 'homa_ir', label: 'Index HOMA', unit: '' },
  { key: 'hba1c', label: 'HbA1c', unit: '%' },
  { key: 'triglycerides', label: 'Triglycérides', unit: 'g/L' },
  { key: 'hdl', label: 'Cholestérol HDL', unit: 'g/L' },
  { key: 'crp_us', label: 'CRP ultra-sensible', unit: 'mg/L' },
  { key: 'vitamin_d', label: 'Vitamine D', unit: 'ng/mL' },
  { key: 'tsh', label: 'TSH', unit: 'mUI/L' },
];

const KNOWN: Record<string, BiomarkerField> = Object.fromEntries(
  DEFAULT_BIOMARKER_FIELDS.map((field) => [field.key, field])
);

export function valueToInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function parseInputValue(raw: string): number | string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const normalized = trimmed.replace(',', '.');
  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && /^-?\d/.test(normalized)) return numeric;
  return trimmed;
}

export function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ');
}

export function rowsFromBiomarkers(parsed: BiomarkerMap): BiomarkerRow[] {
  const seen = new Set<string>();
  const rows: BiomarkerRow[] = [];

  for (const field of DEFAULT_BIOMARKER_FIELDS) {
    seen.add(field.key);
    rows.push({ ...field, value: valueToInput(parsed[field.key]) });
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (seen.has(key)) continue;
    const known = KNOWN[key];
    rows.push({
      key,
      label: known?.label ?? humanizeKey(key),
      unit: known?.unit ?? '',
      value: valueToInput(value),
    });
  }

  return rows;
}

export function editedMapFromRows(rows: BiomarkerRow[]): BiomarkerMap {
  const map: BiomarkerMap = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    const parsed = parseInputValue(row.value);
    if (parsed === '') continue;
    map[key] = parsed;
  }
  return map;
}

export function hasUsableBiomarkerRows(rows: BiomarkerRow[]): boolean {
  return rows.some((row) => row.value.trim().length > 0);
}
