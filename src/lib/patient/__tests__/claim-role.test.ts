import { describe, expect, it } from 'vitest';
import { canClaimPatientRole } from '../claim-role';

describe('canClaimPatientRole', () => {
  it('allows claiming when the session has no role or is already patient', () => {
    expect(canClaimPatientRole(undefined)).toBe(true);
    expect(canClaimPatientRole(null)).toBe(true);
    expect(canClaimPatientRole('')).toBe(true);
    expect(canClaimPatientRole('patient')).toBe(true);
  });

  it('refuses practitioner or other roles', () => {
    expect(canClaimPatientRole('practitioner')).toBe(false);
    expect(canClaimPatientRole('professional')).toBe(false);
    expect(canClaimPatientRole('admin')).toBe(false);
  });
});
