import type { MealSlot } from './types';

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
};

export function mealSlotLabel(slot: MealSlot): string {
  return MEAL_SLOT_LABELS[slot];
}

export function formatPlanCreatedAt(iso: string | null): string {
  if (!iso) return 'Date inconnue';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function planStatusLabel(status: string): string {
  if (status === 'ready') return 'Prêt';
  if (status === 'failed') return 'Échec';
  if (status === 'draft') return 'Brouillon';
  return status;
}
