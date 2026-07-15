'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BetaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', specialty: '', patients_per_week: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Store in localStorage for now (no backend needed for beta signup page)
    const entries = JSON.parse(localStorage.getItem('fc_beta_signups') || '[]');
    entries.push({ ...form, timestamp: new Date().toISOString() });
    localStorage.setItem('fc_beta_signups', JSON.stringify(entries));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-serif text-3xl text-ink-900 mb-4 tracking-editorial">
            Inscription confirmée
          </h1>
          <p className="text-sm text-ink-600 mb-6">
            Merci {form.name} ! Vous êtes pré-inscrit à la beta Functional Chef. 
            Nous vous contacterons dès l'ouverture du pilote (1er trimestre 2027).
          </p>
          <p className="text-xs text-ink-500 mb-8">
            En attendant, vous pouvez explorer la <Link href="/demo" className="text-saffron-700 hover:underline">démo interactive</Link>.
          </p>
          <Link href="/" className="btn-primary">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Beta praticien
            </span>
          </Link>
          <Link href="/" className="text-sm text-ink-600 hover:text-ink-900 transition-colors">
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="label">Beta 2027</p>
        <h1 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial mb-4">
          Inscription beta praticien
        </h1>
        <p className="text-sm text-ink-600 mb-8 leading-relaxed">
          La beta est limitée à <strong>20 praticiens</strong>. Vous bénéficierez de 3 mois 
          d'accès gratuit au moteur complet (classification + composition Claude + export PDF) 
          en échange de votre feedback.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Dr Marie Dupont"
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email professionnel</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="marie.dupont@cabinet.fr"
            />
          </div>
          <div>
            <label className="label" htmlFor="specialty">Spécialité</label>
            <select
              id="specialty"
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="input-field"
            >
              <option value="">— Sélectionnez —</option>
              <option value="medecin_fonctionnel">Médecine fonctionnelle / nutritionnelle</option>
              <option value="medecin_generaliste">Médecine générale</option>
              <option value="dieteticien">Diététicien(ne) / Nutritionniste</option>
              <option value="naturopathe">Naturopathe</option>
              <option value="chercheur">Chercheur / enseignant</option>
              <option value="autre">Autre professionnel de santé</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="patients_per_week">Patients avec volet nutritionnel / semaine</label>
            <select
              id="patients_per_week"
              required
              value={form.patients_per_week}
              onChange={(e) => setForm({ ...form, patients_per_week: e.target.value })}
              className="input-field"
            >
              <option value="">— Sélectionnez —</option>
              <option value="0-5">0-5</option>
              <option value="5-15">5-15</option>
              <option value="15-30">15-30</option>
              <option value="30+">30+</option>
            </select>
          </div>
          <div className="pt-2">
            <p className="text-[11px] text-ink-500 leading-relaxed mb-4">
              En soumettant ce formulaire, vous acceptez d'être contacté par email 
              dans le cadre de la beta. Aucun partage de données avec des tiers.
            </p>
            <button type="submit" className="btn-primary w-full text-base !py-3">
              M'inscrire à la beta →
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-ink-200">
          <p className="text-xs text-ink-500 text-center">
            Une question ? Contactez-nous via 
            {' '}<a href="https://github.com/rafikg-del/functional-chef-v0.1" className="text-saffron-700 hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
            {' '}ou sur les réseaux.
          </p>
        </div>
      </div>
    </main>
  );
}
