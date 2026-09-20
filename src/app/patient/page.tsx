import type { Metadata } from 'next';
import Link from 'next/link';
import { PatientNotice, PatientPublicHeader } from '@/components/patient/PatientShell';

export const metadata: Metadata = {
  title: 'Espace patient — Functional Chef',
  description:
    'Compte patient : uploadez une analyse, décrivez vos objectifs, recevez un menu culinaire 7 jours et une liste de courses. Aide culinaire, pas un dispositif médical.',
};

export default function PatientLandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PatientPublicHeader />

      <section className="max-w-3xl mx-auto px-4 pt-12 pb-16">
        <PatientNotice className="mb-8" />
        <p className="text-xs uppercase tracking-[0.15em] text-saffron-700 mb-4 font-medium">
          Espace patient
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-editorial text-ink-900 mb-6">
          Un menu de la semaine,
          <br />
          <span className="text-saffron-700">prêt à cuisiner.</span>
        </h1>
        <p className="text-base sm:text-lg text-ink-600 leading-relaxed mb-8 max-w-xl">
          Créez un compte, déposez votre analyse (PDF) ou saisissez vos
          biomarqueurs, dites-nous ce qui vous pose problème — nous composons
          un menu 7 jours et une liste de courses. Aide culinaire
          personnalisée, pas un avis médical.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/patient/auth" className="btn-primary text-base !px-7 !py-3 w-full sm:w-auto">
            Créer un compte
          </Link>
          <Link href="/patient/auth" className="btn-ghost text-base !px-7 !py-3 w-full sm:w-auto">
            J’ai déjà un compte
          </Link>
        </div>

        <ol className="mt-12 grid sm:grid-cols-3 gap-3 text-sm text-ink-600">
          {[
            { n: '1', t: 'Compte', d: 'Inscription simple. Historique de vos menus.' },
            { n: '2', t: 'Analyse', d: 'PDF de laboratoire ou saisie manuelle, que vous pouvez corriger.' },
            { n: '3', t: 'Menu + courses', d: '7 jours, jusqu’à 3 repas, liste groupée par rayon.' },
          ].map((s) => (
            <li key={s.n} className="border border-ink-200 rounded-sm p-4 bg-white/70">
              <p className="font-mono text-[10px] text-saffron-700 mb-1">{s.n}</p>
              <p className="font-medium text-ink-800">{s.t}</p>
              <p className="mt-1 leading-relaxed text-xs">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-auto border-t border-ink-200 py-6 text-xs text-ink-500">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-3">
          <span>Functional Chef · aide culinaire · non dispositif médical</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink-700">
              Confidentialité
            </Link>
            <Link href="/" className="hover:text-ink-700">
              Espace praticiens
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
