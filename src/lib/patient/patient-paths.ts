/** Path helpers for the B2C `/patient` tunnel (middleware + tests). */

export function isPatientPath(pathname: string): boolean {
  return pathname === '/patient' || pathname.startsWith('/patient/');
}

function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }
  return pathname;
}

export function isPublicPatientPath(pathname: string): boolean {
  const normalized = stripTrailingSlash(pathname);
  return normalized === '/patient' || normalized === '/patient/auth';
}

export function isProtectedPatientPath(pathname: string): boolean {
  return isPatientPath(pathname) && !isPublicPatientPath(pathname);
}

export function patientAuthRedirectPath(from: string): string {
  return `/patient/auth?next=${encodeURIComponent(from)}`;
}

export function safeInternalPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) return fallback;
  return raw;
}
