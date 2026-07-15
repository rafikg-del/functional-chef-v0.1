'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (!user) {
        router.push('/auth');
        return;
      }
      // Fetch professional profile
      supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-500">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Dashboard
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-600">{user?.email}</span>
            <button onClick={handleLogout} className="btn-ghost text-xs !py-1.5 !px-3">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-ink-900 mb-2 tracking-editorial">
          {profile ? `Dr ${profile.full_name}` : 'Tableau de bord'}
        </h1>
        <p className="text-sm text-ink-600 mb-10">
          Connecté en tant que {user?.email}
        </p>

        {!profile ? (
          <div className="card !p-6 border-tier-t2/30 bg-amber-50/30">
            <h2 className="font-serif text-xl text-ink-900 mb-2">Complétez votre profil</h2>
            <p className="text-sm text-ink-600 mb-4">
              Pour utiliser Functional Chef, vous devez renseigner votre profil professionnel 
              et accepter les conditions d'utilisation.
            </p>
            <Link href="/auth/profile" className="btn-primary text-sm">
              Compléter mon profil →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card !p-5">
              <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2 font-medium">Mon profil</p>
              <p className="text-sm text-ink-700">{profile.full_name}</p>
              <p className="text-xs text-ink-500">{profile.specialty}</p>
              {profile.rpps_number && (
                <p className="text-xs text-ink-500 mt-1">RPPS : {profile.rpps_number}</p>
              )}
              <p className="text-xs text-ink-500 mt-1">
                RGPD : {profile.accepted_terms_at ? '✅ Accepté' : '❌ En attente'}
              </p>
              <Link href="/consent" className="text-xs text-saffron-700 hover:underline mt-2 inline-block">
                Voir mes consentements →
              </Link>
            </div>
            <div className="card !p-5">
              <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2 font-medium">Lien rapide</p>
              <div className="space-y-3">
                <Link href="/consultation" className="btn-primary text-sm w-full text-center !py-2 !px-4 block">
                  Nouvelle consultation →
                </Link>
                <Link href="/demo" className="btn-ghost text-sm w-full text-center !py-2 !px-4 block">
                  Démo interactive
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-ink-500 hover:text-tier-t3 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-ink-200">
          <Link href="/" className="text-xs text-ink-500 hover:text-ink-700 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
