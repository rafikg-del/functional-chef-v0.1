import { describe, expect, it } from 'vitest';
import { mergeBiomarkers } from '../merge-biomarkers';

describe('mergeBiomarkers', () => {
  it('lets edited values win and ignores empty edited keys', () => {
    const merged = mergeBiomarkers(
      { HOMA_IR: 1.1, CRP_US: 0.8, GLUCOSE: 5.2 },
      { HOMA_IR: 2.2, GLUCOSE: '' }
    );

    expect(merged.HOMA_IR).toBe(2.2);
    expect(merged.CRP_US).toBe(0.8);
    expect(merged.GLUCOSE).toBe(5.2);
  });

  it('does not introduce a key when only the edited value is empty', () => {
    const merged = mergeBiomarkers({ HOMA_IR: 1.1 }, { NOTES: '' });
    expect(merged).toEqual({ HOMA_IR: 1.1 });
  });

  it('drops empty strings left over from parsed values', () => {
    const merged = mergeBiomarkers({ HOMA_IR: '', CRP_US: 1 }, { CRP_US: 2 });
    expect(merged).toEqual({ CRP_US: 2 });
  });

  it('keeps null when the edited key is present', () => {
    const merged = mergeBiomarkers({ HOMA_IR: 1.1 }, { HOMA_IR: null });
    expect(merged.HOMA_IR).toBeNull();
  });
});
