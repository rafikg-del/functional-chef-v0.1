import type { Metadata } from 'next';
import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';

export const metadata: Metadata = {
  title: 'Functional Chef — Prescrivez des plats, pas des aliments',
  description:
    'Aide à la prescription nutritionnelle pour médecins fonctionnels et nutritionnels. Chaque proposition culinaire reste à valider par le praticien. Non dispositif médical.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-serif text-xl tracking-tight text-ink-900">
              Functional Chef
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-saffron-700 font-medium px-2 py-0.5 border border-saffron-300 rounded-full">
              Beta
            </span>
          </Link>
          <nav className="text-sm text-ink-600 flex items-center gap-5">
            <Link href="/demo" className="hover:text-ink-900 transition-colors">
              Démo
            </Link>
            <Link href="/auth" className="hover:text-ink-900 transition-colors hidden sm:inline">
              Connexion
            </Link>
            <Link href="/beta" className="btn-primary text-xs !py-2 !px-4">
              Pré-inscription
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 md:pt-24 md:pb-20">
        <NonDmNotice className="mb-10 max-w-2xl" />
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <p className="text-xs uppercase tracking-[0.15em] text-saffron-700 mb-6 font-medium">
              Aide à la prescription nutritionnelle
            </p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] tracking-editorial text-ink-900 mb-8">
              Prescrivez des plats,
              <br />
              <span className="text-saffron-700">pas des aliments.</span>
            </h1>
            <p className="text-lg text-ink-600 max-w-xl leading-relaxed mb-10">
              Functional Chef aide les médecins fonctionnels et nutritionnels à
              proposer des plats concrets, plutôt que des listes d’aliments.
              Chaque sortie reste à valider par le praticien. Ce n’est pas un
              dispositif médical.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/beta" className="btn-primary text-base !px-7 !py-3">
                Rejoindre la beta praticien
              </Link>
              <Link href="/demo" className="btn-ghost text-base !px-7 !py-3">
                Essayer la démo sans compte
              </Link>
            </div>
            <ol className="mt-8 grid sm:grid-cols-3 gap-3 text-xs text-ink-600 max-w-xl">
              {[
                {
                  n: '1',
                  t: 'Découvrir',
                  d: 'Une aide pour le cabinet. Chaque proposition reste à valider.',
                },
                {
                  n: '2',
                  t: 'Essayer',
                  d: 'Démo publique, sans compte. Quelques cas d’exemple.',
                },
                {
                  n: '3',
                  t: 'Pré-inscription',
                  d: 'File d’attente réelle. Accès ensuite sur invitation.',
                },
              ].map((s) => (
                <li key={s.n} className="border border-ink-200 rounded-sm p-3 bg-white/60">
                  <p className="font-mono text-[10px] text-saffron-700 mb-1">{s.n}</p>
                  <p className="font-medium text-ink-800">{s.t}</p>
                  <p className="mt-1 leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="md:col-span-5 md:pl-8">
            <div className="bg-white border border-ink-200 rounded-sm p-6 space-y-5">
              <p className="text-xs uppercase tracking-[0.12em] text-ink-600 font-medium">
                Pour le cabinet
              </p>
              {[
                {
                  title: 'Un plat, pas une liste',
                  body: 'Une proposition culinaire à discuter avec le patient — concrète, pas une consigne vague.',
                },
                {
                  title: 'Le praticien décide',
                  body: 'Outil d’aide. Aucune sortie ne se substitue à votre jugement clinique.',
                },
                {
                  title: 'Pas un score grand public',
                  body: 'Conçu pour les médecins fonctionnels et nutritionnels, pas pour noter des produits.',
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-saffron-500 pl-4">
                  <p className="font-serif text-xl text-ink-900">{item.title}</p>
                  <p className="text-sm text-ink-600 mt-1 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="divider-rule" />
      </div>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="label">Pour qui</p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 max-w-2xl tracking-editorial">
          Une aide de prescription, pas un diagnostic.
        </h2>
        <p className="text-sm text-ink-600 max-w-xl mb-12">
          Functional Chef s’adresse aux praticiens qui veulent formuler un plat
          en consultation — et rester responsables de la validation.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              t: 'Pour le praticien',
              d: 'Une proposition culinaire à relire, ajuster et valider. Vous gardez la main.',
            },
            {
              t: 'Pour le patient',
              d: 'Un plat à préparer, plutôt qu’une liste d’aliments à interpréter seul.',
            },
            {
              t: 'Pour le cabinet',
              d: 'Un cadre d’aide à la prescription nutritionnelle. Non dispositif médical.',
            },
          ].map((s) => (
            <div key={s.t} className="card !p-6">
              <p className="font-serif text-lg text-ink-900 mb-2">{s.t}</p>
              <p className="text-sm text-ink-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="divider-rule" />
      </div>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="label">Beta praticien</p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 tracking-editorial">
          Vous êtes médecin fonctionnel ou nutritionnel ?
        </h2>
        <p className="text-sm text-ink-600 max-w-lg mx-auto mb-8">
          Pré-inscription ouverte. La beta reste limitée à 20 praticiens invités,
          avec 3 mois d’accès en échange d’un retour d’usage. File d’attente
          réelle — pas un formulaire factice.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/beta" className="btn-primary text-base !px-8 !py-3">
            M’inscrire à la beta
          </Link>
          <Link href="/demo" className="btn-ghost text-base !px-8 !py-3">
            Essayer la démo sans compte
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-ink-200 py-8 text-xs text-ink-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>Functional Chef · aide à la prescription · non DM</span>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-ink-700 transition-colors">
              Confidentialité
            </Link>
            <Link href="/beta" className="hover:text-ink-700 transition-colors">
              Beta
            </Link>
            <Link href="/demo" className="hover:text-ink-700 transition-colors">
              Démo
            </Link>
            <Link href="/auth" className="hover:text-ink-700 transition-colors">
              Connexion
            </Link>
            <a
              href="https://github.com/rafikg-del/functional-chef-v0.1/blob/main/docs/FAQ.md"
              className="hover:text-ink-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
