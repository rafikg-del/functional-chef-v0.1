import { describe, expect, it } from 'vitest';
import { canLeaveGoalsStep, canLeaveLabStep, GOAL_TAGS } from '../wizard-steps';

describe('new-plan wizard steps', () => {
  it('requires at least one biomarker before leaving step 1', () => {
    expect(canLeaveLabStep([{ key: 'x', label: 'X', unit: '', value: '' }])).toBe(false);
    expect(canLeaveLabStep([{ key: 'x', label: 'X', unit: '', value: '1.2' }])).toBe(true);
  });

  it('requires consent and a problem or goal before leaving step 2', () => {
    expect(
      canLeaveGoalsStep({ problem: 'fatigue', goals: '', consent: false })
    ).toBe(false);
    expect(canLeaveGoalsStep({ problem: '', goals: '', consent: true })).toBe(false);
    expect(
      canLeaveGoalsStep({ problem: 'fatigue après les repas', goals: '', consent: true })
    ).toBe(true);
  });

  it('offers ressenti tags, not diagnoses', () => {
    expect(GOAL_TAGS).toContain('glycémie ressentie');
    expect(GOAL_TAGS.join(' ')).not.toMatch(/bottleneck|T1|diagnostic/i);
  });
});
