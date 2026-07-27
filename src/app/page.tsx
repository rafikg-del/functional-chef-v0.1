import Link from 'next/link';

const HERO_IMG =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=85&auto=format&fit=crop';
const CTA_IMG =
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1800&q=85&auto=format&fit=crop';
const PROGRAM_IMG =
  'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1400&q=85&auto=format&fit=crop';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* ─────────────────────────── Header ─────────────────────────── */}
      <header className="border-b border-ink-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-sage-500 flex items-center justify-center text-white text-[11px] font-bold">
              FC
            </span>
            <span className="text-lg tracking-tight text-ink-900 font-medium">
              Functional Chef
            </span>
          </Link>
          <nav className="text-sm text-ink-600 flex items-center gap-8">
            <a href="#features" className="hover:text-ink-900 transition-colors hidden sm:inline">
              Le moteur
            </a>
            <a href="#programme" className="hover:text-ink-900 transition-colors hidden sm:inline">
              Le programme
            </a>
            <a href="#ebm" className="hover:text-ink-900 transition-colors hidden sm:inline">
              EBM-F
            </a>
            <a href="#faq" className="hover:text-ink-900 transition-colors hidden sm:inline">
              FAQ
            </a>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium px-5 py-2.5 transition-colors"
            >
              Voir la démo
            </Link>
          </nav>
        </div>
      </header>

      {/* ─────────────────────────── Hero ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 w-full">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-6 font-semibold">
              IA cuisinière EBM-driven
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-[64px] leading-[1.05] tracking-tight text-ink-900 mb-6 font-medium">
              La cuisine{' '}
              <span className="text-sage-600">nouvelle génération</span>
              {' '}pour la médecine fonctionnelle.
            </h1>
            <p className="text-lg text-ink-600 max-w-lg leading-relaxed mb-9">
              Functional Chef associe raisonnement clinique et IA pour transformer
              un profil biomarqueur en prescription culinaire, avec niveau de
              preuve traçable sur chaque levier mobilisé.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-base font-medium px-7 py-3.5 transition-colors"
              >
                Voir la démo
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-ink-200 hover:border-ink-400 text-ink-800 text-base font-medium px-7 py-3.5 transition-colors"
              >
                Découvrir le moteur
              </a>
            </div>
          </div>

          {/* Right — hero photo */}
          <div className="md:col-span-6 md:pl-4">
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-sage-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMG}
                alt="Assiette méditerranéenne — légumes, protéines, huile d'olive"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              {/* Overlay chip: consultation live */}
              <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                  <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
                    Bottleneck détecté · IR
                  </p>
                </div>
                <p className="text-sm text-ink-800 mt-1 leading-snug">
                  Plat composé en 25 s · 8 leviers activés · 7×T1 + 1×T2
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Feature list (Primary-style) ─────────────────────────── */}
      <section id="features" className="bg-sage-50/40 border-y border-sage-100">
        <div className="max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-3 font-semibold">
              Le moteur
            </p>
            <h2 className="text-3xl md:text-5xl text-ink-900 tracking-tight leading-tight mb-4 font-medium">
              Votre prescription culinaire, en 30 secondes.
            </h2>
            <p className="text-lg text-ink-600 leading-relaxed">
              Pas de recette Pinterest. Un plat unique composé pour un bottleneck
              cible, avec justification par niveau de preuve traçable.
            </p>
          </div>

          <ul className="space-y-6 max-w-3xl">
            {[
              {
                t: 'Classification déterministe',
                d: 'Score sur 30+ thresholds cliniques, règles par bottleneck. Aucun diagnostic inventé.',
              },
              {
                t: 'Filtres sécurité durs',
                d: 'MICI, anticoagulants, allergies, SIBO, cœliaque, régimes. Exclusion en amont, pas de disclaimer.',
              },
              {
                t: 'EBM tiering explicite',
                d: 'Chaque levier culinaire porte T1/T2/T3 par bottleneck, avec référence pivot (PMID).',
              },
              {
                t: 'Composition IA maîtrisée',
                d: 'Claude compose le plat avec les leviers fournis. Aucun ajout, aucun PMID hallucinés.',
              },
              {
                t: 'Traçabilité totale',
                d: 'Chaque consultation archive input, scoring, leviers, JSON sortie et méta LLM.',
              },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-5">
                <span className="mt-1 flex-shrink-0 w-9 h-9 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg text-ink-900 font-medium mb-1">{f.t}</h3>
                  <p className="text-ink-600 leading-relaxed">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 rounded-full bg-sage-600 hover:bg-sage-700 text-white text-base font-medium px-7 py-3.5 transition-colors"
            >
              Essayer maintenant
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Programme (Primary-style grid) ─────────────────────────── */}
      <section id="programme" className="max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-3 font-semibold">
            Le programme Functional Chef
          </p>
          <h2 className="text-3xl md:text-5xl text-ink-900 tracking-tight leading-tight font-medium">
            Un raisonnement clinique, pas un chatbot patient.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {[
            {
              t: 'Bottleneck dominant',
              d: 'IR, INFLAM, DYSBIOSE aujourd\'hui. Charge allostatique, méthylation, oxydation en v0.3.',
            },
            {
              t: 'Architecture métabolique',
              d: 'Ratios 50 / 20-30 / 20 en poids d\'assiette. Modulateurs obligatoires (séquence, cuisson, timing).',
            },
            {
              t: 'Leviers priorisés',
              d: '≥4 leviers étoile transversaux + leviers ciblés. Tri par tier puis priorité clinique.',
            },
            {
              t: 'Effets datés',
              d: 'Postprandial 2-4h, court terme 4 semaines, long terme 12 semaines. Chaque effet sourcé.',
            },
            {
              t: 'Filtres sécurité',
              d: 'Contre-indications médicales appliquées en amont : les leviers exclus n\'atteignent jamais le composer.',
            },
            {
              t: 'Audit trail',
              d: 'Chaque consultation persistée en base. Tokens LLM, latence, leviers exclus, warnings.',
            },
          ].map((f) => (
            <div key={f.t}>
              <h3 className="text-xl text-ink-900 font-medium mb-3 leading-snug">
                {f.t}
              </h3>
              <p className="text-ink-600 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── Environnement photo ─────────────────────────── */}
      <section className="bg-sage-50/40 border-y border-sage-100">
        <div className="max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-3 font-semibold">
                L'expérience praticien
              </p>
              <h2 className="text-3xl md:text-5xl text-ink-900 tracking-tight leading-tight mb-6 font-medium">
                Un outil qui parle votre langue.
              </h2>
              <p className="text-lg text-ink-600 leading-relaxed mb-4">
                Pensé pour la consultation. Saisie des biomarqueurs, sélection
                d'un intent clinique, sortie prête à valider et transmettre au
                patient sous votre responsabilité.
              </p>
              <p className="text-sm text-ink-500">
                Pas de simplification grand public. Registre médecin à médecin.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-sage-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PROGRAM_IMG}
                  alt="Ingrédients frais préparés — herbes, légumes, huile d'olive"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── EBM Tiering ─────────────────────────── */}
      <section id="ebm" className="max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-3 font-semibold">
            EBM-F Tiering
          </p>
          <h2 className="text-3xl md:text-5xl text-ink-900 tracking-tight leading-tight mb-4 font-medium">
            Chaque levier porte son niveau de preuve.
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed">
            Pas d'inflation de tier par enthousiasme. Un levier sans référence
            pivot n'entre pas en base.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              tier: 'T1',
              color: 'bg-tier-t1',
              label: 'Solide',
              criteria: '≥1 méta-analyse de RCT humains.',
              ex: 'Vinaigre pré-prandial (Shishehbor 2017 méta). Légumineuses 3-4×/sem (Sievenpiper 2009).',
            },
            {
              tier: 'T2',
              color: 'bg-tier-t2',
              label: 'Modéré',
              criteria: 'RCT modeste ou cohorte solide.',
              ex: 'Curcumine culinaire (Sahebkar 2016). Whey pre-load (Jakubowicz 2014).',
            },
            {
              tier: 'T3',
              color: 'bg-tier-t3',
              label: 'Émergent',
              criteria: 'Mécanistique ou observationnel.',
              ex: 'Bouillon d\'os · données mécanistiques seulement, pas de RCT convaincant.',
            },
          ].map((t) => (
            <div key={t.tier} className="rounded-xl border border-ink-200 p-6 bg-white">
              <div className="flex items-baseline gap-3 mb-3">
                <span className={`${t.color} text-white text-xs font-bold font-mono px-2 py-1 rounded`}>
                  {t.tier}
                </span>
                <span className="text-sm text-ink-600 font-medium uppercase tracking-wider">
                  {t.label}
                </span>
              </div>
              <p className="text-sm text-ink-600 mb-4 leading-relaxed">{t.criteria}</p>
              <p className="text-sm text-ink-800 leading-relaxed">{t.ex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── FAQ ─────────────────────────── */}
      <section id="faq" className="bg-sage-50/40 border-y border-sage-100">
        <div className="max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl mb-14">
            <p className="text-xs uppercase tracking-[0.18em] text-sage-700 mb-3 font-semibold">
              Questions fréquentes
            </p>
            <h2 className="text-3xl md:text-5xl text-ink-900 tracking-tight leading-tight font-medium">
              Ce qu'on nous demande en premier.
            </h2>
          </div>

          <div className="max-w-3xl divide-y divide-ink-200">
            {[
              {
                q: 'Est-ce un dispositif médical ?',
                a: 'Non en v0.1. Outil pédagogique de prescription nutritionnelle. Réévaluation MDR à v1.0 si claim diagnostique. La validation médicale humaine reste requise avant transmission patient.',
              },
              {
                q: 'Comment fonctionne le tiering EBM-F ?',
                a: 'Chaque levier culinaire porte un tier global (T1/T2/T3) et un tier par bottleneck. T1 = ≥1 méta-analyse RCT ; T2 = RCT modeste ou cohorte solide ; T3 = mécanistique ou observationnel. Un levier sans référence pivot n\'entre pas en base.',
              },
              {
                q: 'Les patients peuvent-ils l\'utiliser directement ?',
                a: 'Non. C\'est un outil de médecin, pas un chatbot patient. Le praticien saisit le profil biomarqueur + intent, valide la sortie, puis transmet au patient sous sa responsabilité clinique.',
              },
              {
                q: 'Quels bottlenecks sont couverts aujourd\'hui ?',
                a: 'Trois pilotes : Insulinorésistance, Inflammaging, Dysbiose intestinale. Roadmap v0.3 : charge allostatique, méthylation, oxydation, signal endocrinien. Cible v1.0 : 12 bottlenecks.',
              },
              {
                q: 'Comment sont gérées les contre-indications ?',
                a: 'Filtres durs en amont. MICI active, anticoagulants + curcumine haute dose, hémochromatose + Fe, allergies, SIBO, cœliaque, régimes : les leviers concernés sont exclus avant que le LLM ne compose. Les warnings modérés (grossesse, hypothyroïdie, lithiase oxalique) restent affichés.',
              },
              {
                q: 'Quelle est la roadmap ?',
                a: 'v0.2 (en cours) : 60+ leviers, tests validation clinique, UX 4 écrans. v0.3 : intégration ZOI Analyse Patient, pilote 20 patients. v1.0 : decision gate B2C vs B2B clinique.',
              },
            ].map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <h3 className="text-lg text-ink-900 leading-snug font-medium">
                    {item.q}
                  </h3>
                  <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white border border-ink-300 text-ink-600 text-sm flex items-center justify-center transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink-600 leading-relaxed max-w-2xl">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA with photo bg ─────────────────────────── */}
      <section className="relative overflow-hidden bg-sage-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CTA_IMG}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-sage-900/85 via-sage-900/70 to-sage-800/60" />
        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center w-full">
          <p className="text-xs uppercase tracking-[0.18em] text-sage-100 mb-4 font-semibold">
            Beta praticien
          </p>
          <h2 className="text-4xl md:text-5xl text-white tracking-tight leading-tight mb-6 font-medium">
            Votre premier plat fonctionnel généré en 30 secondes.
          </h2>
          <p className="text-lg text-sage-50 leading-relaxed max-w-xl mx-auto mb-10">
            Beta ouverte à 20 praticiens en médecine fonctionnelle et
            nutritionnelle. Feedback contre accès gratuit 3 mois.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-sage-50 text-sage-800 text-base font-medium px-8 py-3.5 transition-colors"
            >
              Tester la démo
              <span aria-hidden>→</span>
            </Link>
            <a
              href="mailto:rafik@functional-chef.com?subject=Beta%20praticien"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 hover:bg-white/10 text-white text-base font-medium px-8 py-3.5 transition-colors"
            >
              M'inscrire à la beta
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── Footer ─────────────────────────── */}
      <footer className="mt-auto bg-white border-t border-ink-100">
        <div className="max-w-6xl mx-auto px-6 py-14 w-full">
          <div className="grid md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center text-white text-[10px] font-bold">
                  FC
                </span>
                <p className="text-lg text-ink-900 font-medium">Functional Chef</p>
              </div>
              <p className="text-sm text-ink-600 leading-relaxed max-w-xs">
                Le premier moteur de prescription culinaire EBM-driven, ciblé
                par bottleneck physiopathologique.
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold mb-4">
                Produit
              </p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li><Link href="/consultation" className="hover:text-sage-700 transition-colors">Consultation</Link></li>
                <li><a href="#programme" className="hover:text-sage-700 transition-colors">Programme</a></li>
                <li><a href="#ebm" className="hover:text-sage-700 transition-colors">EBM-F Tiering</a></li>
                <li><a href="#features" className="hover:text-sage-700 transition-colors">Fonctionnalités</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold mb-4">
                Ressources
              </p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li><a href="#faq" className="hover:text-sage-700 transition-colors">FAQ</a></li>
                <li>
                  <a
                    href="https://github.com/rafikg-del/functional-chef-v0.1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sage-700 transition-colors"
                  >
                    GitHub (privé)
                  </a>
                </li>
                <li><span className="text-ink-400">Changelog · à venir</span></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold mb-4">
                À propos
              </p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li><span className="text-ink-400">Manifeste</span></li>
                <li><span className="text-ink-400">Conseil scientifique</span></li>
                <li><span className="text-ink-400">Roadmap</span></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-widest text-ink-500 font-semibold mb-4">
                Contact
              </p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>
                  <a href="mailto:rafik@functional-chef.com" className="hover:text-sage-700 transition-colors">
                    rafik@functional-chef.com
                  </a>
                </li>
                <li><span className="text-ink-400">LinkedIn · Dr Rafik Gounane</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-ink-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ink-500">
            <span>© 2027 Dr Rafik Gounane · Tous droits réservés</span>
            <span className="font-mono text-[10px]">
              scaffold v0.2 · 83 leviers · 30 profils patients · 95 tests
            </span>
            <div className="flex gap-4">
              <span className="text-ink-400">Mentions légales</span>
              <span className="text-ink-400">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
