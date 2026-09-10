import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';

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
            <a href="#methode" className="hover:text-ink-900 transition-colors hidden sm:inline">
              Méthode
            </a>
            <a href="#ebm" className="hover:text-ink-900 transition-colors hidden sm:inline">
              EBM-F
            </a>
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
              Functional Chef traduit des biomarqueurs (HOMA-IR, CRP-us, Bristol…)
              en proposition culinaire, avec un <strong>niveau de preuve explicite</strong>{' '}
              (T1/T2/T3) sur chaque levier. Destiné aux médecins fonctionnels et
              nutritionnels. Chaque sortie reste à valider par le praticien.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/beta" className="btn-primary text-base !px-7 !py-3">
                Rejoindre la beta praticien
              </Link>
              <Link href="/demo" className="btn-ghost text-base !px-7 !py-3">
                Tester la démo hors-ligne
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tier-t1" />
                T1 = méta-analyse RCT
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tier-t2" />
                T2 = RCT modeste
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tier-t3" />
                T3 = mécanistique
              </span>
            </div>
          </div>
          <aside className="md:col-span-5 md:pl-8">
            <div className="bg-white border border-ink-200 rounded-sm p-6 space-y-5">
              <p className="text-xs uppercase tracking-[0.12em] text-ink-600 font-medium">
                Trois bottlenecks pilotes
              </p>
              {[
                { code: 'IR', name: 'Insulinorésistance', markers: 'HOMA-IR 1.5–2.5 · TG/HDL >1.5' },
                { code: 'INFLAM', name: 'Inflammaging', markers: 'CRP-us 1–3 · OmegaIndex <6%' },
                { code: 'DYSBIOSE', name: 'Dysbiose intestinale', markers: 'Bristol 1-2/6-7 · fibres <15g/j' },
              ].map((b) => (
                <div key={b.code} className="border-l-2 border-saffron-500 pl-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-saffron-700 font-bold">{b.code}</span>
                    <span className="font-serif text-xl text-ink-900">{b.name}</span>
                  </div>
                  <p className="text-sm text-ink-600 mt-1">{b.markers}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-ink-100">
                <p className="text-xs text-ink-500 leading-relaxed">
                  Hiérarchie de design en cas de triple co-dominance :
                  <span className="font-medium text-ink-700"> IR → INFLAM → DYSBIOSE</span>
                  {' '}(postulat, pas une règle clinique validée).
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="divider-rule" />
      </div>

      <section id="methode" className="max-w-6xl mx-auto px-6 py-16">
        <p className="label">Méthode</p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 max-w-2xl tracking-editorial">
          5 étapes. Classification déterministe.
        </h2>
        <p className="text-sm text-ink-600 max-w-xl mb-12">
          Le LLM (Claude) n’intervient qu’à la dernière étape. La classification,
          les filtres de sécurité et la sélection des leviers sont{' '}
          <strong>déterministes</strong> — le modèle n’invente pas de diagnostic.
        </p>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            { n: '01', t: 'Classification', d: 'Score déterministe sur 20+ biomarqueurs. Seuils cliniques. Règles par bottleneck.', color: 'bg-tier-t1' },
            { n: '02', t: 'Filtres durs', d: 'MICI, anticoagulants, allergies, SIBO, cœliaque, régimes. Leviers exclus avant composition.', color: 'bg-tier-t2' },
            { n: '03', t: 'Sélection', d: '≥4 leviers étoile transversaux + leviers ciblés dominant/co-dominant. Tri par tier puis priorité.', color: 'bg-tier-t2' },
            { n: '04', t: 'Composition Claude', d: 'Le LLM compose le plat avec les leviers fournis. Pas d’ajout. Pas d’invention de PMID.', color: 'bg-saffron-700' },
            { n: '05', t: 'Traçabilité', d: 'Input, scoring, leviers sélectionnés/exclus, JSON sortie, métadonnées LLM. Auditable.', color: 'bg-ink-600' },
          ].map((s) => (
            <div key={s.n} className="card !p-5">
              <span className={`inline-block w-7 h-7 rounded-full ${s.color} text-ink-50 text-xs font-mono flex items-center justify-center mb-4`}>
                {s.n}
              </span>
              <p className="font-serif text-lg text-ink-900 mb-2">{s.t}</p>
              <p className="text-sm text-ink-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="divider-rule" />
      </div>

      <section id="ebm" className="max-w-6xl mx-auto px-6 py-16">
        <p className="label">EBM-F Tiering</p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-4 max-w-2xl tracking-editorial">
          Chaque levier porte son niveau de preuve.
        </h2>
        <p className="text-sm text-ink-600 max-w-xl mb-10">
          Pas d’inflation de tier par enthousiasme. Un levier sans référence pivot
          n’entre pas en base. Les tiers sont auto-déclarés, en revue scientifique.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tier: 'T1', color: 'bg-tier-t1', border: 'border-tier-t1',
              label: 'Solide', criteria: '≥1 méta-analyse de RCT humains',
              ex: 'Vinaigre pré-prandial (Shishehbor 2017 méta, n=11 RCT) · Légumineuses (Sievenpiper 2009, ↓ HbA1c -0.48%)',
            },
            {
              tier: 'T2', color: 'bg-tier-t2', border: 'border-tier-t2',
              label: 'Modéré', criteria: 'RCT modeste ou cohorte solide',
              ex: 'Curcumine culinaire (Sahebkar 2016, formulation-dépendante) · Whey pre-load (Jakubowicz 2014, n=30)',
            },
            {
              tier: 'T3', color: 'bg-tier-t3', border: 'border-tier-t3',
              label: 'Émergent', criteria: 'Mécanistique ou observationnel',
              ex: 'Bouillon d’os (données mécanistiques seulement, pas de RCT)',
            },
          ].map((t) => (
            <div key={t.tier} className={`card border-l-4 ${t.border} !p-6`}>
              <div className="flex items-baseline gap-3 mb-3">
                <span className={`${t.color} text-ink-50 text-xs font-bold font-mono px-2 py-0.5 rounded-sm`}>
                  {t.tier}
                </span>
                <span className="text-sm text-ink-600 font-medium">{t.label}</span>
              </div>
              <p className="text-xs text-ink-600 mb-3">{t.criteria}</p>
              <p className="text-sm text-ink-700 leading-relaxed">{t.ex}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-ink-100/50 border border-ink-200 rounded-sm p-5">
          <p className="text-xs text-ink-700 font-medium mb-1">Positionnement</p>
          <p className="text-sm text-ink-600 leading-relaxed">
            Yuka note des produits. Zoe score des réponses glycémiques. Functional Chef
            s’adresse aux praticiens : un levier culinaire avec badge T1/T2/T3, une
            proposition de plat, une trace à valider. Ce n’est pas un score grand public.
          </p>
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
          avec 3 mois d’accès en échange d’un retour d’usage. L’inscription écrit
          dans une table Supabase — pas un formulaire factice.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/beta" className="btn-primary text-base !px-8 !py-3">
            M’inscrire à la beta
          </Link>
          <Link href="/demo" className="btn-ghost text-base !px-8 !py-3">
            Voir les cas A / B / C
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
