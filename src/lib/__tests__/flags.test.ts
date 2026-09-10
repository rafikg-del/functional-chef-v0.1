import { afterEach, describe, expect, it } from 'vitest';
import { isMockDataEnabled } from '../flags';

describe('isMockDataEnabled', () => {
  const originalPublic = process.env.NEXT_PUBLIC_USE_MOCK_DATA;

  afterEach(() => {
    if (originalPublic === undefined) delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    else process.env.NEXT_PUBLIC_USE_MOCK_DATA = originalPublic;
  });

  it('defaults to false for production entry', () => {
    delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    expect(isMockDataEnabled()).toBe(false);
  });

  it('is true only when NEXT_PUBLIC_USE_MOCK_DATA is exactly true', () => {
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
    expect(isMockDataEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
    expect(isMockDataEnabled()).toBe(false);
  });
});
