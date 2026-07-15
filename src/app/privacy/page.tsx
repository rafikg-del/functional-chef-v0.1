import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
          </Link>
          <Link href="/" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="label">Politique de confidentialité</p>
        <h1 className="font-serif text-4xl text-ink-900 mb-2 tracking-editorial">
          Données personnelles et RGPD
        </h1>
        <p className="text-xs text-ink-500 mb-10">Version v1.0-20260714 · 14 juillet 2026</p>

        <div className="prose prose-sm prose-ink max-w-none space-y-6 text-ink-700">
          <section>
            <h2 className="font-serif text-xl text-ink-900">1. Responsable du traitement</h2>
            <p>
              Functional Chef est un outil développé par Dr Rafik Gounane, 
              médecin fonctionnel. Le traitement des données est effectué sous 
              la responsabilité du professionnel de santé utilisateur (le « Praticien »), 
              qui agit en tant que responsable de traitement pour les données de ses patients.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">2. Données collectées</h2>
            <h3 className="font-serif text-lg text-ink-900 mt-4">Données Praticien</h3>
            <ul>
              <li>Nom, email professionnel, numéro RPPS (optionnel)</li>
              <li>Spécialité, structure d'exercice</li>
              <li>Journal de connexion</li>
            </ul>
            <h3 className="font-serif text-lg text-ink-900 mt-4">Données Patient</h3>
            <ul>
              <li>Biomarqueurs biologiques (HOMA-IR, CRP-us, etc.)</li>
              <li>Signaux cliniques (Bristol stool scale, fréquence ballonnements)</li>
              <li>Contraintes alimentaires (allergies, régimes, aversions)</li>
              <li>Âge et sexe (optionnels)</li>
            </ul>
            <p className="text-xs text-ink-500 mt-2">
              <strong>Aucune donnée nominative directe</strong> (nom, prénom, adresse, 
              numéro de sécurité sociale) n'est stockée dans le système.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">3. Base légale du traitement</h2>
            <p>Le traitement des données repose sur :</p>
            <ul>
              <li><strong>Pour les Praticiens</strong> : intérêt légitime + exécution de conditions d'utilisation</li>
              <li><strong>Pour les Patients</strong> : consentement explicite (Article 9.2.a RGPD — données de santé)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">4. Hébergement et sécurité</h2>
            <ul>
              <li><strong>Hébergement</strong> : Supabase (PostgreSQL) — hébergement France/UE</li>
              <li><strong>Chiffrement</strong> : Chiffré au repos (AES-256) et en transit (TLS 1.3)</li>
              <li><strong>Appels LLM</strong> : Les données transmises à l'API LLM (Anthropic/OpenAI) sont anonymisées. Aucun identifiant patient n'est inclus dans les prompts.</li>
              <li><strong>Authentification</strong> : Supabase Auth avec email + mot de passe ou Magic Link</li>
              <li><strong>RLS</strong> : Un praticien ne peut voir que ses propres patients et consultations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">5. Durée de conservation</h2>
            <ul>
              <li>Consultations : <strong>3 ans</strong> après la création</li>
              <li>Profils patients : <strong>5 ans</strong> après la dernière consultation</li>
              <li>Journal d'audit : <strong>10 ans</strong> (obligation médico-légale)</li>
              <li>Données Praticien : jusqu'à suppression du compte</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">6. Droits des personnes (RGPD Articles 15-22)</h2>
            <p>Vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès</strong> (Article 15) — obtenir une copie des données</li>
              <li><strong>Droit de rectification</strong> (Article 16) — corriger les données inexactes</li>
              <li><strong>Droit à l'effacement</strong> (Article 17) — supprimer le compte et les données via la fonctionnalité dédiée</li>
              <li><strong>Droit à la limitation</strong> (Article 18)</li>
              <li><strong>Droit à la portabilité</strong> (Article 20)</li>
            </ul>
            <p>Pour exercer ces droits, contactez : <em>dpo@functional-chef.app</em></p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">7. Transferts hors UE</h2>
            <p>
              Les appels API LLM (Anthropic/OpenAI) peuvent impliquer un transfert de données 
              vers les États-Unis. Ces transferts sont encadrés par les clauses contractuelles 
              types (CCT) de la Commission européenne. Les données transférées sont limitées 
              aux biomarqueurs et signaux cliniques anonymisés — aucune donnée nominative 
              directe n'est transmise.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ink-900">8. Contact</h2>
            <p>
              Pour toute question relative à la protection des données :<br />
              Email : <em>dpo@functional-chef.app</em><br />
              GitHub : <a href="https://github.com/rafikg-del/functional-chef-v0.1" className="text-saffron-700 hover:underline">rafikg-del/functional-chef-v0.1</a>
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-ink-200 py-6 text-xs text-ink-500">
        <div className="max-w-3xl mx-auto px-6 flex justify-between">
          <span>Functional Chef · v1.0-20260714</span>
          <Link href="/" className="hover:text-ink-700 transition-colors">Accueil</Link>
        </div>
      </footer>
    </main>
  );
}
