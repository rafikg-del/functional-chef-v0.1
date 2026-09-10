import { describe, expect, it } from 'vitest';
import { DEMO_CASES, loadDemoPatient } from '../cases';
import { runPublicDemo } from '../run-public-demo';

describe('public demo cases', () => {
  it('loads cases A/B/C with expected biomarkers', () => {
    const a = loadDemoPatient('A');
    expect(a.biomarker_values.HOMA_IR).toBe(2.1);
    expect(loadDemoPatient('B').biomarker_values.CRP_US).toBe(2.4);
    expect(loadDemoPatient('C').clinical_signals.BRISTOL_SCORE).toBe(6);
    expect(DEMO_CASES.A.expected_dominant).toBe('IR');
  });

  it('Cas A → IR dominant + leviers + plat fixture T1', () => {
    const result = runPublicDemo({
      patient: loadDemoPatient('A'),
      case_key: 'A',
    });
    expect(result.classification.dominant).toBe('IR');
    expect(result.classification.co_dominant).toBeNull();
    expect(result.lever_selection.selected.length).toBeGreaterThanOrEqual(4);
    expect(result.lever_selection.selected.some((l) => l.ebm_tier === 'T1')).toBe(true);
    expect(result.dish).not.toBeNull();
    expect(result.dish_source).toBe('fixture');
    expect(result.dish!.levers_activated.length).toBeGreaterThanOrEqual(4);
    expect(result.dish!.ebm_summary.T1_count).toBeGreaterThan(0);
    expect(result.dish!.title.toLowerCase()).toContain('lentilles');
  });

  it('Cas B → INFLAM dominant + plat poisson/crucifères', () => {
    const result = runPublicDemo({
      patient: loadDemoPatient('B'),
      case_key: 'B',
    });
    expect(result.classification.dominant).toBe('INFLAM');
    expect(result.lever_selection.selected.some((l) => l.lever_id === 'L_FATTY_FISH_2X')).toBe(
      true
    );
    expect(result.dish_source).toBe('fixture');
    expect(result.dish!.ingredients.length).toBeGreaterThanOrEqual(4);
    expect(result.dish!.ebm_summary.T1_count + result.dish!.ebm_summary.T2_count).toBeGreaterThan(
      0
    );
  });

  it('Cas C → DYSBIOSE dominant, INFLAM co-dominant + plat T1/T2/T3', () => {
    const result = runPublicDemo({
      patient: loadDemoPatient('C'),
      case_key: 'C',
    });
    expect(result.classification.dominant).toBe('DYSBIOSE');
    expect(result.classification.co_dominant).toBe('INFLAM');
    expect(result.dish_source).toBe('fixture');
    expect(result.dish!.ebm_summary.T1_count).toBeGreaterThan(0);
    expect(result.dish!.ebm_summary.T3_count).toBeGreaterThan(0);
    expect(result.dish!.levers_activated.some((l) => l.tier === 'T3')).toBe(true);
  });

  it('custom healthy profile → no dominant, no dish', () => {
    const result = runPublicDemo({
      patient: loadDemoPatient('custom'),
      case_key: 'custom',
    });
    expect(result.classification.dominant).toBeNull();
    expect(result.dish).toBeNull();
    expect(result.lever_selection.selected).toHaveLength(0);
  });

  it('custom IR-like profile → deterministic dish from selected levers', () => {
    const result = runPublicDemo({
      patient: {
        biomarker_values: {
          HOMA_IR: 2.4,
          TG_HDL_RATIO: 1.9,
          FASTING_INSULIN: 10,
          CRP_US: 0.5,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
      },
      case_key: 'custom',
    });
    expect(result.classification.dominant).toBe('IR');
    expect(result.dish_source).toBe('deterministic');
    expect(result.dish).not.toBeNull();
    expect(result.dish!.levers_activated.map((l) => l.lever_id)).toEqual(
      result.lever_selection.selected.map((l) => l.lever_id)
    );
  });
});
