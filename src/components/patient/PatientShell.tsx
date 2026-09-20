'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function PatientNotice({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`border border-ink-200 bg-ink-100/70 px-4 py-3 text-xs text-ink-700 leading-relaxed ${className}`}
      role="note"
    >
      <p>
        <strong>Aide culinaire, pas un dispositif médical.</strong> Functional
        Chef propose un menu de la semaine et une liste de courses. Ce n’est
        pas un avis médical, pas un diagnostic, pas un traitement.
      </p>
    </aside>
  );
}

export function PatientPublicHeader() {
  return (
    <header className="border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/patient" className="font-serif text-lg sm:text-xl tracking-tight text-ink-900">
          Functional Chef
          <span className="text-[10px] uppercase tracking-[0.18em] text-saffron-700 font-medium ml-2">
            Patient
          </span>
        </Link>
        <Link href="/patient/auth" className="text-sm text-ink-600 hover:text-ink-900">
          Connexion
        </Link>
      </div>
    </header>
  );
}

export function PatientShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/patient');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/patient/plans" className="font-serif text-lg tracking-tight text-ink-900 shrink-0">
            Functional Chef
          </Link>
          <nav className="flex items-center gap-3 text-xs sm:text-sm text-ink-600">
            <Link href="/patient/new" className="hover:text-ink-900">
              Nouveau
            </Link>
            <Link href="/patient/plans" className="hover:text-ink-900">
              Menus
            </Link>
            <Link href="/patient/onboarding" className="hover:text-ink-900 hidden sm:inline">
              Profil
            </Link>
            <button type="button" onClick={handleLogout} className="hover:text-ink-900">
              Sortir
            </button>
          </nav>
        </div>
        {email ? (
          <div className="max-w-3xl mx-auto px-4 pb-2">
            <p className="text-[11px] text-ink-500 truncate">{email}</p>
          </div>
        ) : null}
      </header>
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</div>
    </div>
  );
}

export function WrongAccountNotice({ message }: { message?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/patient/auth');
    router.refresh();
  }

  return (
    <div className="card !p-5 space-y-3">
      <p className="text-sm text-ink-700">
        {message ??
          'Ce compte n’est pas un compte patient. Déconnectez-vous, puis créez ou utilisez un compte dédié à l’espace patient.'}
      </p>
      <button type="button" className="btn-primary text-sm" onClick={() => void handleLogout()}>
        Changer de compte
      </button>
    </div>
  );
}
