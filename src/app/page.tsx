import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header rule */}
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-xl tracking-tight text-ink-900">
              Functional Chef
            </span>
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium">
              v0.1
            </span>
          </div>
          <nav className="text-sm text-ink-600 flex gap-6">
            <Link href="/consultation" className="hover:text-ink-900 transition-colors">
              Consultation
            </Link>
            <a
              href="https://github.com"
              className="hover:text-ink-900 transition-colors"
            >
              Doc
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-8">
          <p className="text-xs uppercase tracking-widest text-saffron-700 mb-6">
            IA cuisinière EBM-driven
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-editorial text-ink-900 mb-8">
            On ne cuisine pas
            <br />
            des aliments mais
            <br />
            <em className="text-saffron-700 not-italic">des voies métaboliques.</em>
          </h1>
          <p className="text-lg text-ink-600 max-w-xl leading-relaxed mb-10">
            Functional Chef traduit un objectif physiopathologique précis — lever
            un bottleneck métabolique, inflammatoire, microbien — en architecture
            culinaire opérationnelle. Chaque levier mobilisé porte son tier EBM-F
            (T1, T2, T3) explicite.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/consultation" className="btn-primary">
              Lancer une consultation
            </Link>
            <a href="#methode" className="btn-ghost">
              Méthode
            </a>
          </div>
        </div>

        {/* Side panel — 3 bottlenecks */}
        <aside className="md:col-span-4 md:pt-2">
          <p className="label">Trois bottlenecks pilotes</p>
          <ul className="space-y-4 mt-2">
            <li className="border-l-2 border-saffron-500 pl-4">
              <p className="font-serif text-xl text-ink-900">Insulinorésistance</p>
              <p className="text-sm text-ink-600 mt-1">
                HOMA-IR 1.5–2.5 · TG/HDL &gt;1.5 · HbA1c 5.4–5.6%
              </p>
            </li>
            <li className="border-l-2 border-saffron-500 pl-4">
              <p className="font-serif text-xl text-ink-900">Inflammaging</p>
              <p className="text-sm text-ink-600 mt-1">
                CRP-us 1–3 mg/L · OmegaIndex &lt;6% · AA/EPA &gt;7
              </p>
            </li>
            <li className="border-l-2 border-saffron-500 pl-4">
              <p className="font-serif text-xl text-ink-900">Dysbiose</p>
              <p className="text-sm text-ink-600 mt-1">
                Bristol 1-2 ou 6-7 · ballonnements quotidiens · fibres &lt;15g/j
              </p>
            </li>
          </ul>
        </aside>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="divider-rule" />
      </div>

      {/* Method */}
      <section id="methode" className="max-w-6xl mx-auto px-6 py-16">
        <p className="label">Méthode</p>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-900 mb-10 max-w-2xl">
          Cinq étapes, deux gardes-fous, zéro hallucination scientifique.
        </h2>

        <ol className="grid md:grid-cols-5 gap-8 mt-8">
          {[
            {
              n: '01',
              t: 'Classification',
              d: 'Score déterministe sur biomarqueurs et signaux cliniques. Bottleneck dominant identifié, hiérarchie causale appliquée si triple co-dominance.',
            },
            {
              n: '02',
              t: 'Filtres durs',
              d: 'MICI, anticoagulants, allergies, régime. Aucun levier dangereux ne passe le filtre.',
            },
            {
              n: '03',
              t: 'Sélection',
              d: '≥4 leviers étoile transversaux + leviers ciblés du bottleneck dominant. Tri par tier puis priorité.',
            },
            {
              n: '04',
              t: 'Composition',
              d: 'Claude API compose le plat à partir des leviers fournis. Aucune liberté d’ajout. JSON strict.',
            },
            {
              n: '05',
              t: 'Persistance',
              d: 'Trace complète : input, scoring, leviers, JSON sortie, métadonnées LLM. Auditable.',
            },
          ].map((s) => (
            <li key={s.n}>
              <p className="font-mono text-xs text-saffron-700 tracking-mono-tight mb-3">
                {s.n}
              </p>
              <p className="font-serif text-xl text-ink-900 mb-2">{s.t}</p>
              <p className="text-sm text-ink-600 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-auto border-t border-ink-200 py-6 text-xs text-ink-500">
        <div className="max-w-6xl mx-auto px-6 flex justify-between">
          <span>Functional Chef · scaffold v0.1</span>
          <span className="font-mono">Dr Rafik Gounane × Claude</span>
        </div>
      </footer>
    </main>
  );
}
