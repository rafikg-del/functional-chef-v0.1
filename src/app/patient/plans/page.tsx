'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatientShell, WrongAccountNotice } from '@/components/patient/PatientShell';
import { createClient } from '@/lib/supabase/client';
import { redirectForPatientApiStatus } from '@/lib/patient/patient-paths';
import { formatPlanCreatedAt, planStatusLabel } from '@/lib/patient/plan-view';

interface PlanListItem {
  id: string;
  created_at: string | null;
  status: string;
}

export default function PatientPlansPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanListItem[] | null>(null);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const claim = await fetch('/api/patient/claim-role', { method: 'POST' });
      if (claim.status === 403) {
        setForbidden(true);
        setPlans([]);
        return;
      }
      const claimDest = redirectForPatientApiStatus(claim.status, '/patient/plans');
      if (claimDest) {
        router.push(claimDest);
        return;
      }
      await supabase.auth.refreshSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/patient/auth?next=/patient/plans');
        return;
      }
      setEmail(user.email ?? null);
      const res = await fetch('/api/patient/plans');
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setForbidden(true);
        setPlans([]);
        return;
      }
      const dest = redirectForPatientApiStatus(res.status, '/patient/plans');
      if (dest) {
        router.push(dest);
        return;
      }
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Impossible de charger vos menus.');
        setPlans([]);
        return;
      }
      setPlans(Array.isArray(body.plans) ? body.plans : []);
    })();
  }, [router]);

  return (
    <PatientShell email={email}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="label">Historique</p>
          <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">
            Vos menus
          </h1>
        </div>
        <Link href="/patient/new" className="btn-primary text-xs !py-2 !px-3 shrink-0">
          Nouveau
        </Link>
      </div>

      {forbidden ? (
        <WrongAccountNotice />
      ) : (
        <>
          {error && (
            <p className="text-xs text-tier-t3 bg-tier-t3/10 border border-tier-t3/30 p-3 rounded-sm mb-4">
              {error}
            </p>
          )}

          {plans === null ? (
            <p className="text-sm text-ink-500">Chargement…</p>
          ) : plans.length === 0 ? (
            <div className="card !p-6">
              <p className="text-sm text-ink-600 mb-4">
                Pas encore de menu enregistré. Composez une première semaine.
              </p>
              <Link href="/patient/new" className="btn-primary text-sm">
                Créer un menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={`/patient/plans/${plan.id}`}
                    className="card !p-4 flex items-center justify-between gap-3 hover:border-saffron-400 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-ink-900">
                        {formatPlanCreatedAt(plan.created_at)}
                      </p>
                      <p className="text-xs text-ink-500 mt-1">{planStatusLabel(plan.status)}</p>
                    </div>
                    <span className="text-xs text-saffron-700">Ouvrir →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PatientShell>
  );
}
