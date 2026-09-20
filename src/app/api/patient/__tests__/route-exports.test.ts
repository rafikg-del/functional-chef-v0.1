import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/** Fields Next.js 14 allows on App Router route.ts (checked during next build). */
const ALLOWED_ROUTE_EXPORTS = new Set([
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'runtime',
  'preferredRegion',
  'dynamic',
  'dynamicParams',
  'revalidate',
  'fetchCache',
  'maxDuration',
]);

function collectRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collectRouteFiles(full));
    else if (name === 'route.ts') out.push(full);
  }
  return out;
}

describe('patient API route modules', () => {
  it('only export Next.js-allowed route fields so next build type-check passes', () => {
    const root = path.resolve(__dirname, '..');
    const files = collectRouteFiles(root);
    expect(files.length).toBeGreaterThan(0);

    const extra: string[] = [];
    const exportRe = /^export (?:async )?function (\w+)|^export const (\w+)/gm;
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const match of src.matchAll(exportRe)) {
        const name = match[1] ?? match[2];
        if (name && !ALLOWED_ROUTE_EXPORTS.has(name)) {
          extra.push(`${path.relative(root, file)}: ${name}`);
        }
      }
    }
    expect(extra).toEqual([]);
  });
});
