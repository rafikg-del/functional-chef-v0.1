import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(resolve(__dirname, '../page.tsx'), 'utf8');
const layout = readFileSync(resolve(__dirname, '../layout.tsx'), 'utf8');

describe('public landing copy', () => {
  it('keeps brand, waitlist, and demo CTAs', () => {
    expect(landing).toContain('Functional Chef');
    expect(landing).toContain('Beta');
    expect(landing).toContain('NonDmNotice');
    expect(landing).toContain('href="/beta"');
    expect(landing).toContain('href="/demo"');
    expect(landing).toMatch(/Essayer la démo sans compte/);
    expect(landing).toContain('Aide à la prescription nutritionnelle');
    expect(landing).toContain('Prescrivez des plats');
  });

  it('does not document method internals, thresholds, or EBM tiering', () => {
    const forbidden = [
      'id="methode"',
      'id="ebm"',
      '#methode',
      '#ebm',
      'EBM-F',
      'HOMA-IR',
      'CRP-us',
      'OmegaIndex',
      'TG/HDL',
      'Bristol',
      'IR → INFLAM',
      'INFLAM → DYSBIOSE',
      'Trois bottlenecks',
      'bottleneck',
      'Insulinorésistance',
      'Inflammaging',
      'Classification déterministe',
      'Filtres durs',
      'Composition Claude',
      'T1 = méta-analyse',
      'T2 = RCT',
      'T3 = mécanistique',
      'T1/T2/T3',
      'déterministe',
      'hors-ligne',
    ];

    for (const snippet of forbidden) {
      expect(landing, `landing still contains: ${snippet}`).not.toContain(snippet);
    }

    expect(layout, 'root metadata still mentions T1/T2/T3').not.toContain('T1/T2/T3');
  });
});
