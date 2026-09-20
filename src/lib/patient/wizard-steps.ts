import type { BiomarkerRow } from './biomarker-fields';
import { hasUsableBiomarkerRows } from './biomarker-fields';

export const GOAL_TAGS = ['énergie', 'digestion', 'poids', 'glycémie ressentie'] as const;

export function canLeaveLabStep(rows: BiomarkerRow[]): boolean {
  return hasUsableBiomarkerRows(rows);
}

export function canLeaveGoalsStep(opts: {
  problem: string;
  goals: string;
  consent: boolean;
}): boolean {
  if (!opts.consent) return false;
  return opts.problem.trim().length > 0 || opts.goals.trim().length > 0;
}
