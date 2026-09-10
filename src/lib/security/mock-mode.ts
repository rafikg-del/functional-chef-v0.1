/**
 * Mock data is allowed only when explicitly opted in.
 * Authenticated dashboard surfaces must never silently present MOCK as live data.
 */
export function isExplicitMockDataEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
}
