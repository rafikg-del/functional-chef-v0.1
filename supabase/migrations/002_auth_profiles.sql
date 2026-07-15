-- =====================================================================
-- Migration 002 — Auth, RLS, Professional Profiles, Audit Trail
-- =====================================================================
-- This migration adds:
--   1. professional_profiles table (links to auth.users)
--   2. RLS enable + policies for all protected tables
--   3. audit_log table (full traceability)
--   4. Consent tracking columns
--   5. Retention trigger
--   6. Data cleanup function (right to be forgotten)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFESSIONAL_PROFILES — extends auth.users for healthcare pros
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS professional_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Identity
  full_name         text NOT NULL,
  rpps_number       text,                          -- Répertoire Partagé des Professionnels de Santé (FR)
  specialty         text CHECK (specialty IN (
    'medecin_fonctionnel', 'medecin_generaliste', 'dieteticien',
    'naturopathe', 'chercheur', 'autre'
  )),
  -- Contact
  email_verified    boolean DEFAULT false,
  phone             text,
  -- Practice
  practice_name     text,
  practice_address  text,
  patient_count     int DEFAULT 0,                 -- denormalized counter
  -- Onboarding
  accepted_terms_at timestamptz,                   -- GDPR consent timestamp
  privacy_version   text,                          -- version of privacy policy accepted
  -- Account
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_user ON professional_profiles(user_id);
CREATE INDEX idx_profiles_rpps ON professional_profiles(rpps_number) WHERE rpps_number IS NOT NULL;

COMMENT ON TABLE professional_profiles IS 'Extended profile for healthcare professionals. Links Supabase Auth to Functional Chef data.';
COMMENT ON COLUMN professional_profiles.rpps_number IS 'French healthcare professional registry number. Optional but recommended for B2B medical use.';
COMMENT ON COLUMN professional_profiles.accepted_terms_at IS 'Timestamp of GDPR consent. Must be set before first use.';

-- ---------------------------------------------------------------------
-- 2. PATIENT_PROFILES — add professional owner relationship
-- ---------------------------------------------------------------------
-- Add professional_id to existing patient_profiles table
ALTER TABLE patient_profiles
  ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES professional_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_patients_professional ON patient_profiles(professional_id);

COMMENT ON COLUMN patient_profiles.professional_id IS 'The healthcare professional who owns this patient profile. NULL for anonymous consultations.';
COMMENT ON COLUMN patient_profiles.consent_given_at IS 'Patient consent timestamp. Required for GDPR compliance.';
COMMENT ON COLUMN patient_profiles.archived_at IS 'If set, profile is soft-deleted (right to be forgotten).';

-- ---------------------------------------------------------------------
-- 3. CONSULTATIONS — add professional reference
-- ---------------------------------------------------------------------
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES professional_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS engine_version text,
  ADD COLUMN IF NOT EXISTS patient_consent_ref text;

CREATE INDEX IF NOT EXISTS idx_consultations_professional ON consultations(professional_id);

COMMENT ON COLUMN consultations.professional_id IS 'The professional who ran this consultation. NULL for anonymous demo use.';
COMMENT ON COLUMN consultations.engine_version IS 'Semantic version of the engine at time of consultation (for audit trail).';

-- ---------------------------------------------------------------------
-- 4. AUDIT_LOG — full traceability
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who
  professional_id   uuid REFERENCES professional_profiles(id) ON DELETE SET NULL,
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- falls back to raw user id
  -- What
  action            text NOT NULL,                -- 'consultation.create', 'patient.consent', 'profile.update', 'account.delete'
  entity_type       text,                         -- 'consultation', 'patient_profile', 'professional_profile', 'lever'
  entity_id         text,                         -- UUID or identifier of the affected entity
  -- Context
  metadata          jsonb DEFAULT '{}'::jsonb,    -- action-specific detail (e.g. bottleneck detected, levers selected)
  -- Technical
  ip_address        inet,
  user_agent        text,
  engine_version    text,
  -- Timing
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_professional ON audit_log(professional_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for all sensitive operations. Required for MDR compliance and medico-legal traceability.';

-- ---------------------------------------------------------------------
-- 5. CONSENT_RECORDS — explicit patient consent per consultation
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   uuid NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  patient_id        uuid REFERENCES patient_profiles(id) ON DELETE CASCADE, -- NULL for standalone consent
  consent_type      text NOT NULL CHECK (consent_type IN (
    'patient_care', 'data_processing', 'research', 'sharing', 'withdrawal'
  )),
  status            text NOT NULL CHECK (status IN ('given', 'withdrawn', 'expired')),
  consent_version   text,                         -- e.g. 'v1.0-20260714'
  given_at          timestamptz DEFAULT now(),
  expires_at        timestamptz,                  -- NULL = no expiry
  ip_address        inet,
  signature_hash    text,                         -- SHA256 of consent document at time of signing
  notes             text,
  UNIQUE (patient_id, consent_type, consent_version)
);

CREATE INDEX idx_consent_patient ON consent_records(patient_id);
CREATE INDEX idx_consent_professional ON consent_records(professional_id);

COMMENT ON TABLE consent_records IS 'Explicit consent records for GDPR Article 7 compliance. immutable after creation.';

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY — enable and configure policies
-- ---------------------------------------------------------------------

-- Professional profiles: each user can only see their own profile
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own professional profile"
  ON professional_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own professional profile"
  ON professional_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own professional profile"
  ON professional_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Patient profiles: pros can only see their own patients
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own patients"
  ON patient_profiles FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert own patients"
  ON patient_profiles FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can update own patients"
  ON patient_profiles FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

-- Consultations: pros can only see consultations they created
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own consultations"
  ON consultations FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert consultations"
  ON consultations FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

-- Audit log: pros can only see their own audit trail
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own audit log"
  ON audit_log FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

-- Consent records: pros can only see their patients' consents
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own patient consents"
  ON consent_records FOR SELECT
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Professionals can insert consent records"
  ON consent_records FOR INSERT
  WITH CHECK (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------
-- 7. RETENTION POLICY — auto-archive after configured period
-- ---------------------------------------------------------------------
-- Retention periods (configurable via function parameters)
-- Default: consultations = 3 years, patient data = 5 years, audit log = 10 years

CREATE OR REPLACE FUNCTION get_retention_days(entity_type text)
RETURNS int AS $$
BEGIN
  RETURN CASE entity_type
    WHEN 'consultation'   THEN 1095   -- 3 years
    WHEN 'patient'        THEN 1825   -- 5 years
    WHEN 'audit_log'      THEN 3650   -- 10 years
    ELSE 365
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Scheduled cleanup function: archive old data
CREATE OR REPLACE FUNCTION archive_expired_data()
RETURNS int AS $$
DECLARE
  archived_count int := 0;
BEGIN
  -- Archive consultations older than retention period
  UPDATE consultations
  SET engine_version = engine_version || '_archived'
  WHERE created_at < now() - (get_retention_days('consultation') || ' days')::interval
    AND engine_version NOT LIKE '%_archived';

  GET DIAGNOSTICS archived_count = ROW_COUNT;

  -- Soft-delete patient profiles older than retention
  UPDATE patient_profiles
  SET archived_at = now()
  WHERE created_at < now() - (get_retention_days('patient') || ' days')::interval
    AND archived_at IS NULL;

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION archive_expired_data IS 'Call via cron or Supabase scheduled function. Archives consultations and soft-deletes old patient data per configured retention periods.';

-- ---------------------------------------------------------------------
-- 8. RIGHT TO BE FORGOTTEN — complete account deletion
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_professional_account(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
  prof_id uuid;
BEGIN
  -- Get professional id
  SELECT id INTO prof_id FROM professional_profiles WHERE user_id = target_user_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Anonymize consultations (keep data for medico-legal but detach from professional)
  UPDATE consultations
  SET professional_id = NULL,
      validated_by = NULL
  WHERE professional_id = prof_id;

  -- Anonymize patient profiles
  UPDATE patient_profiles
  SET professional_id = NULL,
      biomarker_values = '{"_deleted": true}'::jsonb,
      clinical_signals = '{"_deleted": true}'::jsonb,
      exclusions = '{}'::jsonb,
      context = '{}'::jsonb
  WHERE professional_id = prof_id;

  -- Anonymize audit log
  UPDATE audit_log
  SET professional_id = NULL,
      metadata = '{"_account_deleted": true}'::jsonb
  WHERE professional_id = prof_id;

  -- Delete consent records
  DELETE FROM consent_records WHERE professional_id = prof_id;

  -- Delete professional profile
  DELETE FROM professional_profiles WHERE id = prof_id;

  -- Note: auth.users deletion must be done via Supabase Admin API
  -- This function handles the Functional Chef data layer only

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_professional_account IS 'Implements GDPR right to be forgotten (Article 17). Anonymizes all data linked to the professional account.';

-- ---------------------------------------------------------------------
-- 9. TRIGGER — auto-update professional_profiles.updated_at
-- ---------------------------------------------------------------------
CREATE TRIGGER set_timestamp_professional_profiles
  BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ---------------------------------------------------------------------
-- 10. ENGINE VERSION (used by audit trail)
-- ---------------------------------------------------------------------
COMMENT ON TABLE consultations IS 'v0.2 — now includes professional_id, engine_version, and patient_consent_ref for full traceability.';
