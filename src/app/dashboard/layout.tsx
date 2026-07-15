'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return; }
      setUser(user);
      const { data } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-500">Chargement...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', label: 'Accueil', icon: '◉' },
    { href: '/dashboard/consultations', label: 'Consultations', icon: '📋' },
    { href: '/dashboard/stats', label: 'Statistiques', icon: '📊' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-ink-200 bg-ink-50/50 flex flex-col shrink-0">
        <div className="p-5 border-b border-ink-200">
          <Link href="/dashboard" className="font-serif text-lg text-ink-900 tracking-editorial">
            Functional Chef
          </Link>
          <p className="text-[10px] text-ink-500 mt-1">Tableau de bord</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                  active
                    ? 'bg-saffron-700 text-ink-50'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-200">
          <p className="text-xs text-ink-600 truncate">{user?.email}</p>
          {profile && <p className="text-[10px] text-ink-500">{profile.full_name}</p>}
          <button
            onClick={handleLogout}
            className="text-[10px] text-ink-400 hover:text-tier-t3 transition-colors mt-2"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
