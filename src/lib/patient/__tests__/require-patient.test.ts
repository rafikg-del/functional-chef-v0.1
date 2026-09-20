import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { requirePatientUser } from '../require-patient';

describe('requirePatientUser', () => {
  it('returns 401 when there is no session user', async () => {
    const result = await requirePatientUser(async () => null);
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });
  });

  it('returns 403 when the session role is not patient', async () => {
    const practitioner = await requirePatientUser(async () => ({
      id: 'pro-1',
      app_metadata: { role: 'practitioner' },
    }));
    expect(practitioner.ok).toBe(false);
    if (!practitioner.ok) {
      expect(practitioner.status).toBe(403);
      expect(practitioner.error).toMatch(/patient/i);
    }

    const missingRole = await requirePatientUser(async () => ({
      id: 'user-1',
      app_metadata: {},
    }));
    expect(missingRole.ok).toBe(false);
    if (!missingRole.ok) expect(missingRole.status).toBe(403);
  });

  it('returns the user when app_metadata.role is patient', async () => {
    const result = await requirePatientUser(async () => ({
      id: 'pat-1',
      app_metadata: { role: 'patient' },
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe('pat-1');
    }
  });
});

describe('005_patient_b2c.sql', () => {
  const sql = readFileSync(
    path.resolve(__dirname, '../../../../supabase/migrations/005_patient_b2c.sql'),
    'utf8'
  );

  it('creates B2C tables, owner RLS, and a private patient-labs bucket', () => {
    expect(sql).toMatch(/patient_profiles/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS patient_labs/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS patient_intakes/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS patient_plans/);
    expect(sql).toMatch(/auth\.uid\(\) = user_id/);
    expect(sql).toMatch(/patient-labs/);
    expect(sql).toMatch(/storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
    expect(sql).toMatch(/generation_meta/);
    expect(sql).toMatch(/app_metadata\.role = 'patient'/);
  });
});
