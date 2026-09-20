'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { GroceryListView } from '@/components/patient/GroceryListView';
import { PatientNotice, PatientShell, WrongAccountNotice } from '@/components/patient/PatientShell';
import { WeekPlanView } from '@/components/patient/WeekPlanView';
import { createClient } from '@/lib/supabase/client';
import { redirectForPatientApiStatus } from '@/lib/patient/patient-paths';
import { PATIENT_PLAN_DISCLAIMER } from '@/lib/patient/sanitize-plan';
import type { PatientPlanClient } from '@/lib/patient/types';

type Tab = 'days' | 'grocery';

export default function PatientPlanDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState<PatientPlanClient | null>(null);
  const [tab, setTab] = useState<Tab>('days');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const claim = await fetch('/api/patient/claim-role', { method: 'POST' });
      if (claim.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      const claimDest = redirectForPatientApiStatus(claim.status, `/patient/plans/${id}`);
      if (claimDest) {
        router.push(claimDest);
        return;
      }
      await supabase.auth.refreshSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/patient/auth?next=/patient/plans/${id}`);
        return;
      }
      setEmail(user.email ?? null);
      const res = await fetch(`/api/patient/plans/${id}`);
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }
      const dest = redirectForPatientApiStatus(res.status, `/patient/plans/${id}`);
      if (dest) {
        router.push(dest);
        return;
      }
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Impossible de charger ce menu.');
        setLoading(false);
        return;
      }
      setPlan(body as PatientPlanClient);
      setLoading(false);
    })();
  }, [id, router]);

  async function handleRegenerate() {
    setError('');
    setRegenerating(true);
    try {
      const res = await fetch(`/api/patient/plans/${id}/regenerate`, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) {
        setError(
          typeof body.error === 'string' ? body.error : 'Régénération impossible pour le moment.'
        );
        return;
      }
      setPlan(body as PatientPlanClient);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <PatientShell email={email}>
      <div className="print:hidden">
        <p className="label">Menu de la semaine</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">Votre menu</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/patient/plans" className="btn-ghost text-xs !py-2 !px-3">
              Historique
            </Link>
            <button
              type="button"
              className="btn-ghost text-xs !py-2 !px-3"
              onClick={() => window.print()}
            >
              Imprimer / PDF
            </button>
            <button
              type="button"
              className="btn-primary text-xs !py-2 !px-3"
              disabled={regenerating || !plan}
              onClick={() => void handleRegenerate()}
            >
              {regenerating ? 'Régénération…' : 'Régénérer'}
            </button>
          </div>
        </div>
      </div>

      <PatientNotice className="mb-6 print:border-0" />

      {forbidden ? <WrongAccountNotice /> : null}

      {error && (
        <p className="text-xs text-tier-t3 bg-tier-t3/10 border border-tier-t3/30 p-3 rounded-sm mb-4 print:hidden">
          {error}
        </p>
      )}

      {forbidden ? null : loading ? (
        <p className="text-sm text-ink-500">Chargement…</p>
      ) : !plan ? (
        <p className="text-sm text-ink-600">Menu introuvable.</p>
      ) : (
        <>
          <p className="text-xs text-ink-500 mb-6">{plan.disclaimer || PATIENT_PLAN_DISCLAIMER}</p>
          <div className="print:hidden flex border border-ink-200 rounded-sm overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setTab('days')}
              className={`flex-1 py-2 text-sm ${
                tab === 'days' ? 'bg-saffron-700 text-ink-50' : 'bg-white text-ink-600'
              }`}
            >
              Jours
            </button>
            <button
              type="button"
              onClick={() => setTab('grocery')}
              className={`flex-1 py-2 text-sm ${
                tab === 'grocery' ? 'bg-saffron-700 text-ink-50' : 'bg-white text-ink-600'
              }`}
            >
              Courses
            </button>
          </div>
          <div className="print:block">
            {tab === 'days' ? (
              <WeekPlanView days={plan.days} />
            ) : (
              <GroceryListView aisles={plan.grocery_list} />
            )}
          </div>
          <div className="hidden print:block mt-8">
            <WeekPlanView days={plan.days} />
            <div className="mt-8">
              <GroceryListView aisles={plan.grocery_list} />
            </div>
          </div>
        </>
      )}
    </PatientShell>
  );
}
