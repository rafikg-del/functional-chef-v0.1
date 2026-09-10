import { describe, expect, it } from 'vitest';
import {
  explainWaitlistInsertFailure,
  explainWaitlistUnconfigured,
  parseWaitlistPayload,
  WAITLIST_OPERATOR_CHECKLIST_FR,
} from '../beta-waitlist';

describe('parseWaitlistPayload', () => {
  const valid = {
    full_name: 'Dr Marie Dupont',
    email: 'marie.dupont@cabinet.fr',
    specialty: 'medecin_fonctionnel',
    patients_per_week: '15-30',
    source: 'beta_page',
  };

  it('accepts a practitioner signup without patient PHI', () => {
    const result = parseWaitlistPayload(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe('marie.dupont@cabinet.fr');
      expect(result.data.specialty).toBe('medecin_fonctionnel');
    }
  });

  it('normalizes email to lowercase', () => {
    const result = parseWaitlistPayload({ ...valid, email: 'Marie.Dupont@Cabinet.FR' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe('marie.dupont@cabinet.fr');
    }
  });

  it('rejects invalid email', () => {
    const result = parseWaitlistPayload({ ...valid, email: 'not-an-email' });
    expect(result.ok).toBe(false);
  });

  it('rejects unknown specialty', () => {
    const result = parseWaitlistPayload({ ...valid, specialty: 'cardiologue' });
    expect(result.ok).toBe(false);
  });

  it('rejects extra clinical fields being required — biomarkers are ignored, not stored', () => {
    const result = parseWaitlistPayload({
      ...valid,
      biomarker_values: { HOMA_IR: 2.1 },
      patient_name: 'should-not-matter',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).not.toHaveProperty('biomarker_values');
      expect(result.data).not.toHaveProperty('patient_name');
    }
  });

  it('defaults source to beta_page', () => {
    const { source: _source, ...rest } = valid;
    const result = parseWaitlistPayload(rest);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.source).toBe('beta_page');
    }
  });
});

describe('explainWaitlistInsertFailure', () => {
  it('maps missing-table PostgREST errors to 503 + operator checklist', () => {
    const failure = explainWaitlistInsertFailure({
      code: 'PGRST205',
      message: "Could not find the table 'public.beta_waitlist' in the schema cache",
    });
    expect(failure.status).toBe(503);
    expect(failure.code).toBe('waitlist_table_missing');
    expect(failure.operator_checklist).toEqual([...WAITLIST_OPERATOR_CHECKLIST_FR]);
    expect(failure.error).toMatch(/004/);
  });

  it('maps 42P01 to table missing', () => {
    const failure = explainWaitlistInsertFailure({
      code: '42P01',
      message: 'relation "beta_waitlist" does not exist',
    });
    expect(failure.code).toBe('waitlist_table_missing');
  });

  it('maps unique violation to 409 without pretending success', () => {
    const failure = explainWaitlistInsertFailure({
      code: '23505',
      message: 'duplicate key',
    });
    expect(failure.status).toBe(409);
    expect(failure.code).toBe('waitlist_duplicate');
    expect(failure.operator_checklist).toHaveLength(0);
  });

  it('maps RLS denial to 503', () => {
    const failure = explainWaitlistInsertFailure({
      code: '42501',
      message: 'permission denied for table beta_waitlist',
    });
    expect(failure.code).toBe('waitlist_rls_denied');
    expect(failure.operator_checklist.length).toBeGreaterThan(0);
  });

  it('unknown insert errors stay honest (not mock-success) and include the checklist', () => {
    const failure = explainWaitlistInsertFailure({
      code: 'XX000',
      message: 'internal',
    });
    expect(failure.status).toBe(500);
    expect(failure.code).toBe('waitlist_insert_failed');
    expect(failure.error).toMatch(/pas simulée|n’est pas simulée|n'est pas simulée/);
  });

  it('unconfigured supabase returns 503 with env checklist', () => {
    const failure = explainWaitlistUnconfigured();
    expect(failure.status).toBe(503);
    expect(failure.code).toBe('waitlist_supabase_unconfigured');
    expect(failure.operator_checklist.some((line) => line.includes('NEXT_PUBLIC_SUPABASE_URL'))).toBe(
      true
    );
  });
});

