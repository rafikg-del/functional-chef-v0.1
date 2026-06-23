-- =====================================================================
-- Migration 002 — Tables entraînement (optionnel, sync Supabase)
-- Le stockage fichier data/training/ fonctionne sans cette migration.
-- =====================================================================

CREATE TABLE IF NOT EXISTS training_batches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'uploaded'
                  CHECK (status IN ('uploaded', 'processing', 'ready', 'error')),
  dossier_count   int NOT NULL DEFAULT 0,
  processed_count int NOT NULL DEFAULT 0,
  matched_count   int NOT NULL DEFAULT 0,
  error_count     int NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_dossiers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id                uuid NOT NULL REFERENCES training_batches(id) ON DELETE CASCADE,
  folder_name             text NOT NULL,
  source_file             text,
  status                  text NOT NULL DEFAULT 'parsed'
                          CHECK (status IN ('pending', 'parsed', 'processed', 'error')),
  profile                 jsonb NOT NULL,
  intent                  text,
  meal_type               text,
  expected_dominant       text CHECK (expected_dominant IS NULL OR expected_dominant IN ('IR', 'INFLAM', 'DYSBIOSE')),
  predicted_dominant      text,
  classification_rationale text,
  match_expected          boolean,
  error_message           text,
  processed_at            timestamptz,
  created_at              timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_dossiers_batch ON training_dossiers(batch_id);

COMMENT ON TABLE training_batches IS 'Lots de dossiers patients importés pour entraînement / évaluation.';
COMMENT ON TABLE training_dossiers IS 'Un dossier patient parsé depuis profile.json avec résultat classifier.';
