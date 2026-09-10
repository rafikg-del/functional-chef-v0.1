import { describe, expect, it } from 'vitest';
import { parseWaitlistPayload } from '../beta-waitlist';

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
