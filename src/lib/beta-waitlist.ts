import { z } from 'zod';

export const WAITLIST_SPECIALTIES = [
  'medecin_fonctionnel',
  'medecin_generaliste',
  'dieteticien',
  'naturopathe',
  'chercheur',
  'autre',
] as const;

export const WAITLIST_VOLUME_BUCKETS = ['0-5', '5-15', '15-30', '30+'] as const;

export const WAITLIST_SOURCES = ['landing', 'beta_page', 'demo'] as const;

export const BetaWaitlistSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Nom trop court')
    .max(120, 'Nom trop long'),
  email: z
    .string()
    .trim()
    .email('Email invalide')
    .max(254)
    .transform((value) => value.toLowerCase()),
  specialty: z.enum(WAITLIST_SPECIALTIES, {
    errorMap: () => ({ message: 'Spécialité invalide' }),
  }),
  patients_per_week: z.enum(WAITLIST_VOLUME_BUCKETS, {
    errorMap: () => ({ message: 'Volume invalide' }),
  }),
  source: z.enum(WAITLIST_SOURCES).optional().default('beta_page'),
});

export type BetaWaitlistInput = z.input<typeof BetaWaitlistSchema>;
export type BetaWaitlistPayload = z.output<typeof BetaWaitlistSchema>;

export function parseWaitlistPayload(raw: unknown):
  | { ok: true; data: BetaWaitlistPayload }
  | { ok: false; error: string } {
  const parsed = BetaWaitlistSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      first.email?.[0] ??
      first.full_name?.[0] ??
      first.specialty?.[0] ??
      first.patients_per_week?.[0] ??
      'Formulaire incomplet';
    return { ok: false, error: message };
  }
  return { ok: true, data: parsed.data };
}

export const WAITLIST_OPERATOR_CHECKLIST_FR = [
  'Appliquer `supabase/migrations/004_beta_waitlist.sql` sur le projet Supabase de production (SQL Editor → Run, ou `supabase db push`).',
  'Renseigner `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel (Production + Preview), puis redéployer.',
  'Vérifier que la table `beta_waitlist` existe et que la politique RLS « Public can insert beta waitlist » autorise INSERT pour le rôle `anon`.',
] as const;

export type WaitlistFailureCode =
  | 'waitlist_supabase_unconfigured'
  | 'waitlist_table_missing'
  | 'waitlist_rls_denied'
  | 'waitlist_duplicate'
  | 'waitlist_insert_failed';

export interface WaitlistFailure {
  status: 409 | 500 | 503;
  code: WaitlistFailureCode;
  error: string;
  operator_checklist: readonly string[];
}

export function isSupabasePublicConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('YOUR_PROJECT'));
}

function looksLikeMissingTable(code?: string, message?: string): boolean {
  const msg = (message ?? '').toLowerCase();
  if (code === '42P01' || code === 'PGRST205' || code === 'PGRST204') return true;
  return (
    msg.includes('does not exist') ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    (msg.includes('beta_waitlist') && msg.includes('not find'))
  );
}

function looksLikeRlsDenied(code?: string, message?: string): boolean {
  const msg = (message ?? '').toLowerCase();
  if (code === '42501' || code === 'PGRST301') return true;
  return msg.includes('row-level security') || msg.includes('permission denied');
}

export function explainWaitlistInsertFailure(insertError: {
  code?: string;
  message?: string;
}): WaitlistFailure {
  if (insertError.code === '23505') {
    return {
      status: 409,
      code: 'waitlist_duplicate',
      error: 'Cet email est déjà pré-inscrit. Nous vous recontacterons.',
      operator_checklist: [],
    };
  }

  if (looksLikeMissingTable(insertError.code, insertError.message)) {
    return {
      status: 503,
      code: 'waitlist_table_missing',
      error:
        'Pré-inscription indisponible : la table beta_waitlist est absente sur ce projet Supabase (migration 004 non appliquée, ou cache PostgREST). Ce n’est pas un succès simulé.',
      operator_checklist: WAITLIST_OPERATOR_CHECKLIST_FR,
    };
  }

  if (looksLikeRlsDenied(insertError.code, insertError.message)) {
    return {
      status: 503,
      code: 'waitlist_rls_denied',
      error:
        'Pré-inscription refusée par les droits de la base (RLS / rôle anon). L’inscription n’a pas été enregistrée.',
      operator_checklist: WAITLIST_OPERATOR_CHECKLIST_FR,
    };
  }

  return {
    status: 500,
    code: 'waitlist_insert_failed',
    error:
      'Impossible d’enregistrer l’inscription. La file d’attente n’est pas simulée : vérifiez la configuration opérateur ci-dessous.',
    operator_checklist: WAITLIST_OPERATOR_CHECKLIST_FR,
  };
}

export function explainWaitlistUnconfigured(): WaitlistFailure {
  return {
    status: 503,
    code: 'waitlist_supabase_unconfigured',
    error:
      'Pré-inscription indisponible : Supabase n’est pas configuré sur cet environnement (URL / clé anon manquantes).',
    operator_checklist: WAITLIST_OPERATOR_CHECKLIST_FR,
  };
}
