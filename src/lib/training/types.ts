/**
 * Types pour l'import multi-dossiers patients et l'entraînement du modèle.
 */

import type { BottleneckId, MealType, PatientProfile } from '../reasoning/types';

/** Format attendu dans chaque dossier patient (profile.json). */
export interface DossierFileInput {
  external_id?: string;
  label?: string;
  age?: number;
  sex?: 'F' | 'M' | 'O';
  biomarker_values?: Record<string, number>;
  clinical_signals?: Record<string, number | string>;
  exclusions?: PatientProfile['exclusions'];
  context?: PatientProfile['context'];
  /** Intent clinique optionnel pour générer des exemples composer. */
  intent?: string;
  meal_type?: MealType;
  /** Vérité terrain pour évaluer le classifier lors de l'entraînement. */
  expected_dominant?: BottleneckId;
  notes?: string;
}

export type DossierStatus = 'pending' | 'parsed' | 'processed' | 'error';
export type BatchStatus = 'uploaded' | 'processing' | 'ready' | 'error';

export interface TrainingDossier {
  id: string;
  batch_id: string;
  folder_name: string;
  source_file: string;
  status: DossierStatus;
  profile: PatientProfile;
  intent?: string;
  meal_type?: MealType;
  expected_dominant?: BottleneckId;
  notes?: string;
  /** Résultat après traitement batch. */
  predicted_dominant?: BottleneckId | null;
  classification_rationale?: string;
  match_expected?: boolean;
  error_message?: string;
  processed_at?: string;
}

export interface TrainingBatch {
  id: string;
  name: string;
  status: BatchStatus;
  dossier_count: number;
  processed_count: number;
  matched_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
  /** Si true, le batch inclut des appels composer (nécessite ANTHROPIC_API_KEY). */
  with_compose?: boolean;
}

export interface TrainingBatchDetail extends TrainingBatch {
  dossiers: TrainingDossier[];
}

/** Ligne JSONL exportée pour fine-tuning / évaluation. */
export interface TrainingExampleLine {
  dossier_id: string;
  external_id?: string;
  input: {
    patient: PatientProfile;
    intent?: string;
    meal_type?: MealType;
  };
  output: {
    dominant: BottleneckId | null;
    co_dominant?: BottleneckId | null;
    rationale: string;
    expected_dominant?: BottleneckId;
    match?: boolean;
  };
  metadata: {
    batch_id: string;
    folder_name: string;
    processed_at: string;
  };
}

export interface UploadSummary {
  batch: TrainingBatch;
  imported: number;
  skipped: number;
  errors: { file: string; message: string }[];
}

export interface ProcessSummary {
  batch: TrainingBatch;
  processed: number;
  matched: number;
  errors: number;
}
