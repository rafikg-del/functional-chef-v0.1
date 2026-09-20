import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BIOMARKER_FIELDS,
  editedMapFromRows,
  hasUsableBiomarkerRows,
  rowsFromBiomarkers,
} from '../biomarker-fields';

describe('biomarker editor rows', () => {
  it('starts from the default culinary lab fields and overlays parsed values', () => {
    const rows = rowsFromBiomarkers({ fasting_glucose: 0.95, mystery: 3 });
    expect(rows.some((row) => row.key === 'fasting_glucose' && row.value === '0.95')).toBe(true);
    expect(rows.some((row) => row.key === 'mystery' && row.value === '3')).toBe(true);
    expect(rows.map((row) => row.key)).toEqual(
      expect.arrayContaining(DEFAULT_BIOMARKER_FIELDS.map((field) => field.key))
    );
  });

  it('exports edited values and treats a filled row as usable', () => {
    const rows = rowsFromBiomarkers({ fasting_glucose: 1 });
    const glucose = rows.find((row) => row.key === 'fasting_glucose');
    expect(glucose).toBeTruthy();
    glucose!.value = '0.92';
    expect(editedMapFromRows(rows)).toMatchObject({ fasting_glucose: 0.92 });
    expect(hasUsableBiomarkerRows(rows)).toBe(true);
    expect(hasUsableBiomarkerRows(rows.map((row) => ({ ...row, value: '' })))).toBe(false);
  });
});
