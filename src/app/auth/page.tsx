'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setMagicSent(true);
        return;
      }

      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMagicSent(true); // Shows "check your email"
        return;
      }

      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h1 className="font-serif text-3xl text-ink-900 mb-4 tracking-editorial">
            Vérifiez votre email
          </h1>
          <p className="text-sm text-ink-600 mb-2">
            Un lien de connexion vous a été envoyé à <strong>{email}</strong>.
          </p>
          <p className="text-xs text-ink-500 mb-8">
            Si vous ne le trouvez pas, vérifiez vos spams.
          </p>
          <button onClick={() => { setMagicSent(false); setMode('magic'); }} className="btn-ghost text-sm">
            Renvoyer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm mx-auto px-6 w-full">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl text-ink-900 tracking-editorial">
            Functional Chef
          </Link>
          <p className="text-xs text-ink-600 mt-2">Espace praticien</p>
        </div>

        <div className="card !p-6">
          <div className="flex border border-ink-200 rounded-sm overflow-hidden mb-6">
            {(['login', 'register', 'magic'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === m
                    ? 'bg-saffron-700 text-ink-50'
                    : 'bg-white text-ink-600 hover:bg-ink-100'
                }`}
              >
                {m === 'login' ? 'Connexion' : m === 'register' ? 'Inscription' : 'Magic Link'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email professionnel</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="prenom@cabinet.fr"
              />
            </div>

            {mode !== 'magic' && (
              <div>
                <label className="label" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-tier-t3/10 border border-tier-t3/30 rounded-sm">
                <p className="text-xs text-tier-t3">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 text-sm"
            >
              {loading
                ? 'Chargement...'
                : mode === 'login'
                ? 'Se connecter'
                : mode === 'register'
                ? 'Créer un compte'
                : 'Envoyer le lien magique'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          <Link href="/" className="hover:text-ink-700 transition-colors">← Retour à l'accueil</Link>
        </p>
      </div>
    </main>
  );
}
