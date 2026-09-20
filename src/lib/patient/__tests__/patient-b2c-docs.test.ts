import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const docs = readFileSync(resolve(__dirname, '../../../../docs/PATIENT_B2C.md'), 'utf8');

describe('docs/PATIENT_B2C.md', () => {
  it('covers migration 005, patient role, and the smoke path', () => {
    expect(docs).toMatch(/005_patient_b2c\.sql/);
    expect(docs).toMatch(/app_metadata\.role = 'patient'/);
    expect(docs).toMatch(/\/patient\/auth/);
    expect(docs).toMatch(/\/patient\/plans/);
    expect(docs).toMatch(/claim-role/);
    expect(docs).toMatch(/smoke/i);
  });
});
