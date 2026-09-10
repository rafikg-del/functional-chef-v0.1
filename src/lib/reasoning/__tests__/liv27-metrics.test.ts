import { describe, expect, it } from 'vitest';
import {
  binaryClassMetrics,
  wilsonScoreInterval,
} from '../../../../scripts/run-liv25-concordance';

describe('LIV-27 descriptive metrics', () => {
  it('marks VPP undefined when the engine never predicts the class', () => {
    const rows = [
      { clinician_dominant: 'DYSBIOSE' as const, engine_dominant: 'none' as const },
      { clinician_dominant: 'none' as const, engine_dominant: 'none' as const },
    ];
    const m = binaryClassMetrics(rows, 'DYSBIOSE');
    expect(m.tp).toBe(0);
    expect(m.fp).toBe(0);
    expect(m.fn).toBe(1);
    expect(m.tn).toBe(1);
    expect(m.ppv.defined).toBe(false);
    expect(m.ppv.value).toBeNull();
    expect(m.sensitivity).toMatchObject({ defined: true, numerator: 0, denominator: 1, value: 0 });
    expect(m.specificity).toMatchObject({ defined: true, numerator: 1, denominator: 1, value: 1 });
  });

  it('computes one-vs-rest counts for the LIV-25 7/10 freeze', () => {
    const rows = [
      { clinician_dominant: 'INFLAM' as const, engine_dominant: 'INFLAM' as const },
      { clinician_dominant: 'DYSBIOSE' as const, engine_dominant: 'none' as const },
      { clinician_dominant: 'INFLAM' as const, engine_dominant: 'IR' as const },
      { clinician_dominant: 'INFLAM' as const, engine_dominant: 'INFLAM' as const },
      { clinician_dominant: 'none' as const, engine_dominant: 'none' as const },
      { clinician_dominant: 'none' as const, engine_dominant: 'none' as const },
      { clinician_dominant: 'none' as const, engine_dominant: 'none' as const },
      { clinician_dominant: 'IR' as const, engine_dominant: 'IR' as const },
      { clinician_dominant: 'IR' as const, engine_dominant: 'IR' as const },
      { clinician_dominant: 'IR' as const, engine_dominant: 'INFLAM' as const },
    ];
    const ir = binaryClassMetrics(rows, 'IR');
    expect(ir).toMatchObject({ tp: 2, fn: 1, fp: 1, tn: 6 });
    expect(ir.sensitivity.value).toBeCloseTo(2 / 3);
    const dys = binaryClassMetrics(rows, 'DYSBIOSE');
    expect(dys.ppv.defined).toBe(false);
    expect(dys.npv).toMatchObject({ numerator: 9, denominator: 10 });
  });

  it('returns a wide Wilson 95% CI for 7/10', () => {
    const w = wilsonScoreInterval(7, 10);
    expect(w).not.toBeNull();
    expect(w!.low).toBeGreaterThan(0.39);
    expect(w!.low).toBeLessThan(0.41);
    expect(w!.high).toBeGreaterThan(0.88);
    expect(w!.high).toBeLessThan(0.90);
    expect(wilsonScoreInterval(0, 0)).toBeNull();
    expect(wilsonScoreInterval(11, 10)).toBeNull();
  });
});
