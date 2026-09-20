/**
 * A session may claim the patient role only when it has none yet,
 * or is already a patient. Practitioner / admin roles must not flip.
 */
export function canClaimPatientRole(existingRole: unknown): boolean {
  if (existingRole === undefined || existingRole === null) return true;
  if (typeof existingRole !== 'string') return false;
  const role = existingRole.trim();
  return role === '' || role === 'patient';
}
