import { describe, expect, it } from 'vitest';
import {
  isProtectedPatientPath,
  isPublicPatientPath,
  patientAuthRedirectPath,
} from '../patient-paths';

describe('patient path gates', () => {
  it('treats landing and auth as public', () => {
    expect(isPublicPatientPath('/patient')).toBe(true);
    expect(isPublicPatientPath('/patient/')).toBe(true);
    expect(isPublicPatientPath('/patient/auth')).toBe(true);
    expect(isPublicPatientPath('/patient/auth/')).toBe(true);
    expect(isProtectedPatientPath('/patient')).toBe(false);
    expect(isProtectedPatientPath('/patient/auth')).toBe(false);
  });

  it('protects onboarding, wizard, and plan history', () => {
    for (const path of ['/patient/onboarding', '/patient/new', '/patient/plans', '/patient/plans/abc']) {
      expect(isPublicPatientPath(path)).toBe(false);
      expect(isProtectedPatientPath(path)).toBe(true);
    }
  });

  it('does not treat practitioner routes as patient', () => {
    expect(isProtectedPatientPath('/dashboard')).toBe(false);
    expect(isPublicPatientPath('/auth')).toBe(false);
    expect(isProtectedPatientPath('/patientfoo')).toBe(false);
  });

  it('sends unauthenticated visitors of protected pages to patient auth', () => {
    expect(patientAuthRedirectPath('/patient/plans')).toBe(
      '/patient/auth?next=%2Fpatient%2Fplans'
    );
  });
});

describe('redirectForPatientApiStatus', () => {
  it('sends 401 to auth and keeps 403 on the current page', async () => {
    const { redirectForPatientApiStatus } = await import('../patient-paths');
    expect(redirectForPatientApiStatus(401, '/patient/plans')).toBe(
      '/patient/auth?next=%2Fpatient%2Fplans'
    );
    expect(redirectForPatientApiStatus(403, '/patient/plans')).toBeNull();
  });
});
