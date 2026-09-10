/**
 * Feature flags. Production default: mock data OFF.
 * Canonical gate is NEXT_PUBLIC_USE_MOCK_DATA === 'true' (security #19).
 */

export { isExplicitMockDataEnabled as isMockDataEnabled } from './security/mock-mode';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
