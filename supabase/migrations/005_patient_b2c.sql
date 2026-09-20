-- =====================================================================
-- Migration 005 — Patient B2C (autonomous culinary plans)
-- =====================================================================
-- Spec: docs/superpowers/specs/2026-09-20-patient-b2c-design.md §6, §10
--
-- Auth: set auth.users raw_app_meta_data / JWT app_metadata.role = 'patient'
-- on signup (Auth Hook or post-auth API). requirePatientUser() enforces it.
--
-- Naming: public.patient_profiles already exists (001/002) as practitioner
-- consultation input. This migration ADDS the B2C columns from spec §6
-- (user_id, display_name, dietary_exclusions, allergies, household_size)
-- and owner RLS (auth.uid() = user_id). It does not drop or rename the
-- existing table. New tables patient_labs / patient_intakes / patient_plans
-- are created here.
--
-- generation_meta on patient_plans is server-internal (model, fixture/live).
-- Never return method internals (bottlenecks, scores, thresholds, T1/T2/T3,
-- classification traces) to the patient client.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. patient_profiles — B2C columns on the existing table
-- ---------------------------------------------------------------------
ALTER TABLE patient_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS dietary_exclusions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS allergies jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS household_size int,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

ALTER TABLE patient_profiles
  DROP CONSTRAINT IF EXISTS patient_profiles_household_size_check;
ALTER TABLE patient_profiles
  ADD CONSTRAINT patient_profiles_household_size_check
  CHECK (household_size IS NULL OR household_size > 0);

ALTER TABLE patient_profiles
  DROP CONSTRAINT IF EXISTS patient_profiles_b2c_xor_professional;
ALTER TABLE patient_profiles
  ADD CONSTRAINT patient_profiles_b2c_xor_professional
  CHECK (user_id IS NULL OR professional_id IS NULL);

COMMENT ON COLUMN patient_profiles.user_id IS
  'B2C autonomous account (auth.users). NULL for practitioner-owned consultation snapshots.';
COMMENT ON COLUMN patient_profiles.dietary_exclusions IS
  'B2C culinary exclusions (jsonb array or object). Distinct from practitioner exclusions jsonb.';
COMMENT ON COLUMN patient_profiles.deleted_at IS
  'Optional soft-delete timestamp (schema ready; MVP does not require a purge job).';

-- ---------------------------------------------------------------------
-- 2. patient_labs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_labs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source              text NOT NULL CHECK (source IN ('pdf', 'manual', 'pdf_edited')),
  storage_path        text,
  parsed_biomarkers   jsonb NOT NULL DEFAULT '{}'::jsonb,
  edited_biomarkers   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

CREATE INDEX IF NOT EXISTS idx_patient_labs_user ON patient_labs (user_id, created_at DESC);

COMMENT ON TABLE patient_labs IS
  'B2C lab uploads / manual biomarker entry. edited_biomarkers is the source of truth for plan generation.';
COMMENT ON COLUMN patient_labs.storage_path IS
  'Object path in private bucket patient-labs, prefixed by user_id/.';

-- ---------------------------------------------------------------------
-- 3. patient_intakes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_intakes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id        uuid REFERENCES patient_labs(id) ON DELETE SET NULL,
  problem_text  text NOT NULL DEFAULT '',
  goals_text    text NOT NULL DEFAULT '',
  goal_tags     text[],
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_patient_intakes_user ON patient_intakes (user_id, created_at DESC);

COMMENT ON TABLE patient_intakes IS
  'B2C problem / goals captured before generating a 7-day culinary plan.';

-- ---------------------------------------------------------------------
-- 4. patient_plans
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_id        uuid NOT NULL REFERENCES patient_intakes(id) ON DELETE CASCADE,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('ready', 'failed', 'draft')),
  menu_7d          jsonb NOT NULL DEFAULT '[]'::jsonb,
  grocery_list     jsonb NOT NULL DEFAULT '[]'::jsonb,
  generation_meta  jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

CREATE INDEX IF NOT EXISTS idx_patient_plans_user ON patient_plans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_plans_intake ON patient_plans (intake_id);

COMMENT ON TABLE patient_plans IS
  'B2C 7-day culinary menu + grocery list. Return sanitizePlanForClient() to the browser.';
COMMENT ON COLUMN patient_plans.generation_meta IS
  'Server-internal (model, fixture/live). Do not send engine/method fields to the patient client.';

-- ---------------------------------------------------------------------
-- 5. RLS — owner is auth.uid() = user_id (no practitioner cross-read)
-- ---------------------------------------------------------------------
ALTER TABLE patient_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_labs FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_intakes FORCE ROW LEVEL SECURITY;
ALTER TABLE patient_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_plans FORCE ROW LEVEL SECURITY;

-- Existing patient_profiles already has RLS for professionals (002).
-- Additional policies are OR-ed: B2C rows are only those with user_id set.
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can select own b2c profile" ON patient_profiles;
CREATE POLICY "Patients can select own b2c profile"
  ON patient_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can insert own b2c profile" ON patient_profiles;
CREATE POLICY "Patients can insert own b2c profile"
  ON patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own b2c profile" ON patient_profiles;
CREATE POLICY "Patients can update own b2c profile"
  ON patient_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can delete own b2c profile" ON patient_profiles;
CREATE POLICY "Patients can delete own b2c profile"
  ON patient_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can select own labs" ON patient_labs;
CREATE POLICY "Patients can select own labs"
  ON patient_labs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can insert own labs" ON patient_labs;
CREATE POLICY "Patients can insert own labs"
  ON patient_labs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own labs" ON patient_labs;
CREATE POLICY "Patients can update own labs"
  ON patient_labs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can delete own labs" ON patient_labs;
CREATE POLICY "Patients can delete own labs"
  ON patient_labs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can select own intakes" ON patient_intakes;
CREATE POLICY "Patients can select own intakes"
  ON patient_intakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can insert own intakes" ON patient_intakes;
CREATE POLICY "Patients can insert own intakes"
  ON patient_intakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own intakes" ON patient_intakes;
CREATE POLICY "Patients can update own intakes"
  ON patient_intakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can delete own intakes" ON patient_intakes;
CREATE POLICY "Patients can delete own intakes"
  ON patient_intakes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can select own plans" ON patient_plans;
CREATE POLICY "Patients can select own plans"
  ON patient_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can insert own plans" ON patient_plans;
CREATE POLICY "Patients can insert own plans"
  ON patient_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own plans" ON patient_plans;
CREATE POLICY "Patients can update own plans"
  ON patient_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can delete own plans" ON patient_plans;
CREATE POLICY "Patients can delete own plans"
  ON patient_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE ALL ON TABLE patient_labs FROM PUBLIC;
REVOKE ALL ON TABLE patient_intakes FROM PUBLIC;
REVOKE ALL ON TABLE patient_plans FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE patient_labs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE patient_intakes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE patient_plans TO authenticated;

-- ---------------------------------------------------------------------
-- 6. Storage bucket patient-labs (private; path prefix user_id/)
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-labs', 'patient-labs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Patients can select own lab files" ON storage.objects;
CREATE POLICY "Patients can select own lab files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'patient-labs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Patients can insert own lab files" ON storage.objects;
CREATE POLICY "Patients can insert own lab files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'patient-labs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Patients can update own lab files" ON storage.objects;
CREATE POLICY "Patients can update own lab files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'patient-labs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'patient-labs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Patients can delete own lab files" ON storage.objects;
CREATE POLICY "Patients can delete own lab files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'patient-labs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
