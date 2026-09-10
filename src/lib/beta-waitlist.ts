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
