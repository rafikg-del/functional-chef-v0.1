import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PATIENT_APP = resolve(__dirname, '..');
const PATIENT_COMPONENTS = resolve(__dirname, '../../../components/patient');
const MIDDLEWARE = resolve(__dirname, '../../../middleware.ts');
const LANDING = resolve(__dirname, '../../page.tsx');

const FORBIDDEN = [
  'bottleneck',
  'id="methode"',
  'id="ebm"',
  '#methode',
  'T1 =',
  'T1/T2/T3',
  'T2 = RCT',
  'HOMA-IR 1.5',
  'Insulinorésistance',
  'Inflammaging',
  'Classification déterministe',
  'EBM-F',
];

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules') continue;
      out.push(...walkTsx(full));
    } else if (/\.(tsx|ts)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('patient B2C UI copy', () => {
  it('ships landing, auth, and onboarding pages in French culinary language', () => {
    const landing = read(join(PATIENT_APP, 'page.tsx'));
    const auth = read(join(PATIENT_APP, 'auth/page.tsx'));
    const onboarding = read(join(PATIENT_APP, 'onboarding/page.tsx'));

    expect(landing).toMatch(/Espace patient|aide culinaire/i);
    expect(landing).toMatch(/compte/i);
    expect(landing).toMatch(/dispositif médical/i);
    expect(landing).toContain('href="/patient/auth"');
    expect(landing).toContain('href="/"');

    expect(auth).toMatch(/Connexion|Inscription/);
    expect(auth).toMatch(/patient/i);

    expect(onboarding).toMatch(/allerg/i);
    expect(onboarding).toMatch(/exclusion/i);
  });

  it('ships the 3-step wizard and plan views', () => {
    const wizard = read(join(PATIENT_APP, 'new/page.tsx'));
    expect(wizard).toMatch(/consentement|J’accepte|J'accepte/i);
    expect(wizard).toContain('/api/patient/plans');
    expect(wizard).toContain('BiomarkerEditor');

    const editor = read(join(PATIENT_COMPONENTS, 'BiomarkerEditor.tsx'));
    expect(editor).toMatch(/biomarqueur/i);

    const week = read(join(PATIENT_COMPONENTS, 'WeekPlanView.tsx'));
    expect(week).toMatch(/Petit-déjeuner|Déjeuner|Dîner/);

    const grocery = read(join(PATIENT_COMPONENTS, 'GroceryListView.tsx'));
    expect(grocery).toMatch(/courses/i);

    const history = read(join(PATIENT_APP, 'plans/page.tsx'));
    expect(history).toMatch(/historique|Menus/i);

    const detail = read(join(PATIENT_APP, 'plans/[id]/page.tsx'));
    expect(detail).toMatch(/[Rr]égénér/);
  });

  it('never leaks method internals in patient UI', () => {
    const files = [
      ...walkTsx(PATIENT_APP),
      ...walkTsx(PATIENT_COMPONENTS),
    ];
    expect(files.length).toBeGreaterThan(2);

    for (const file of files) {
      const src = read(file);
      for (const snippet of FORBIDDEN) {
        expect(src, `${file} still contains: ${snippet}`).not.toContain(snippet);
      }
    }
  });

  it('keeps /patient and /patient/auth public and protects the rest', () => {
    const middleware = read(MIDDLEWARE);
    expect(middleware).toContain('isPublicPatientPath');
    expect(middleware).toContain('isProtectedPatientPath');
    expect(middleware).toContain('/patient/auth');
  });
});

describe('practitioner landing footer', () => {
  it('adds a discreet Espace patient link only in the footer', () => {
    const landing = read(LANDING);
    const footer = landing.slice(landing.indexOf('<footer'));
    expect(footer).toContain('href="/patient"');
    expect(footer).toContain('Espace patient');
    const beforeFooter = landing.slice(0, landing.indexOf('<footer'));
    expect(beforeFooter).not.toContain('href="/patient"');
  });
});
