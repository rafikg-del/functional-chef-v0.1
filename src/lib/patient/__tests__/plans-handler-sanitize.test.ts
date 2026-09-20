import { describe, expect, it, vi } from 'vitest';

const FORBIDDEN = /bottleneck|HOMA_IR threshold|T1\/T2|classification|scores/i;

const sevenDays = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  label: `J${i + 1}`,
  meals: [{ slot: 'lunch' as const, title: 'Bol de saison', summary: 'légumes' }],
}));

function leakyWeek() {
  return {
    days: sevenDays,
    grocery_list: [{ aisle: 'Légumes', items: ['Courgette'] }],
    generation_meta: { source: 'fixture' as const, model: undefined },
    bottleneck_id: 'IR',
    scores: { IR: 9 },
    tiers: ['T1'],
    classification: { dominant: 'IR' },
  };
}

describe('handleCreatePlan', () => {
  it('always sanitizes the JSON body and keeps generation_meta server-side only', async () => {
    const { handleCreatePlan } = await import('../plans-handler');

    const insertIntake = vi.fn().mockResolvedValue({ id: 'intake-1' });
    const insertPlan = vi.fn().mockResolvedValue({ id: 'plan-1' });

    const result = await handleCreatePlan({
      userId: 'pat-1',
      body: {
        problem_text: 'Fatigue après les repas',
        goals_text: 'Menus simples',
        edited_biomarkers: { homa_ir: 2.2 },
      },
      insertIntake,
      insertPlan,
      buildWeekPlan: async () => leakyWeek(),
    });

    expect(result.status).toBe(200);
    expect(JSON.stringify(result.body)).not.toMatch(FORBIDDEN);
    expect(result.body).toMatchObject({
      id: 'plan-1',
      days: expect.any(Array),
      grocery_list: expect.any(Array),
    });
    expect(result.body).not.toHaveProperty('generation_meta');
    expect(result.body).not.toHaveProperty('bottleneck_id');
    expect((result.body as { days: unknown[] }).days).toHaveLength(7);
    expect((result.body as { disclaimer: string }).disclaimer.length).toBeGreaterThan(10);

    expect(insertIntake).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'pat-1',
        problem_text: 'Fatigue après les repas',
        goals_text: 'Menus simples',
      })
    );
    expect(insertPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'pat-1',
        intake_id: 'intake-1',
        status: 'ready',
        menu_7d: sevenDays,
        grocery_list: [{ aisle: 'Légumes', items: ['Courgette'] }],
        generation_meta: { source: 'fixture', model: undefined },
      })
    );
    const stored = insertPlan.mock.calls[0][0];
    expect(stored).not.toHaveProperty('bottleneck_id');
  });

  it('blocks generation when no biomarker remains after merge', async () => {
    const { handleCreatePlan } = await import('../plans-handler');
    const result = await handleCreatePlan({
      userId: 'pat-1',
      body: {
        problem_text: 'x',
        goals_text: 'y',
        parsed_biomarkers: {},
        edited_biomarkers: { note: '' },
      },
      insertIntake: vi.fn(),
      insertPlan: vi.fn(),
    });
    expect(result.status).toBe(400);
    expect(String((result.body as { error: string }).error)).toMatch(/biomarqueur/i);
  });
});

describe('handleGetPlan / handleRegeneratePlan', () => {
  it('returns a sanitized client plan and never echoes generation_meta', async () => {
    const { handleGetPlan } = await import('../plans-handler');
    const result = await handleGetPlan({
      userId: 'pat-1',
      planId: 'plan-1',
      loadPlan: async () => ({
        id: 'plan-1',
        user_id: 'pat-1',
        intake_id: 'intake-1',
        status: 'ready',
        menu_7d: sevenDays,
        grocery_list: [{ aisle: 'Légumes', items: ['Courgette'] }],
        generation_meta: { source: 'fixture', bottleneck_id: 'IR', scores: { IR: 9 } },
        created_at: '2026-09-20T00:00:00Z',
      }),
    });
    expect(result.status).toBe(200);
    expect(JSON.stringify(result.body)).not.toMatch(FORBIDDEN);
    expect(result.body).not.toHaveProperty('generation_meta');
  });

  it('regenerates via buildWeekPlan then sanitizes the response', async () => {
    const { handleRegeneratePlan } = await import('../plans-handler');
    const updatePlan = vi.fn().mockResolvedValue({ id: 'plan-1' });

    const result = await handleRegeneratePlan({
      userId: 'pat-1',
      planId: 'plan-1',
      loadPlan: async () => ({
        id: 'plan-1',
        user_id: 'pat-1',
        intake_id: 'intake-1',
        status: 'ready',
        menu_7d: sevenDays,
        grocery_list: [],
        generation_meta: {},
        created_at: '2026-09-20T00:00:00Z',
      }),
      loadIntake: async () => ({
        id: 'intake-1',
        user_id: 'pat-1',
        lab_id: 'lab-1',
        problem_text: 'Fatigue',
        goals_text: 'Légumes',
        goal_tags: null,
      }),
      loadLab: async () => ({
        parsed_biomarkers: { homa_ir: 1.1 },
        edited_biomarkers: { homa_ir: 2.2 },
        dietary_exclusions: undefined,
      }),
      updatePlan,
      buildWeekPlan: async () => leakyWeek(),
    });

    expect(result.status).toBe(200);
    expect(JSON.stringify(result.body)).not.toMatch(FORBIDDEN);
    expect(result.body).not.toHaveProperty('generation_meta');
    expect(updatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'plan-1',
        user_id: 'pat-1',
        status: 'ready',
        generation_meta: { source: 'fixture', model: undefined },
      })
    );
  });
});
