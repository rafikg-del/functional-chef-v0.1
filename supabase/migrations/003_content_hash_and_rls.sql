-- =====================================================================
-- Migration 003 — Content hash, RLS write policies, validate RPC,
--                  right-to-be-forgotten hardening
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SHA-256 content hash on consultations (LIV-65)
-- ---------------------------------------------------------------------
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS content_hash text;

COMMENT ON COLUMN consultations.content_hash IS
  'SHA-256 hex digest of the canonical consultation payload. Written on physician validate and PDF/JSON export.';

CREATE INDEX IF NOT EXISTS idx_consultations_content_hash
  ON consultations(content_hash)
  WHERE content_hash IS NOT NULL;

-- ---------------------------------------------------------------------
-- 2. RLS — professionals may UPDATE their own consultations
--    (required for LIV-62 validate + hash persist)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Professionals can update own consultations" ON consultations;
CREATE POLICY "Professionals can update own consultations"
  ON consultations FOR UPDATE
  USING (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (professional_id IN (
    SELECT id FROM professional_profiles WHERE user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------
-- 3. RLS — insert own audit events (no UPDATE/DELETE: trail is append-only)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Professionals can insert own audit log" ON audit_log;
CREATE POLICY "Professionals can insert own audit log"
  ON audit_log FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      professional_id IS NULL
      OR professional_id IN (
        SELECT id FROM professional_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------
-- 4. Atomic physician validation + audit (LIV-62)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_consultation(
  target_consultation_id uuid,
  note text DEFAULT NULL,
  payload_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof professional_profiles%ROWTYPE;
  cons consultations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO prof
  FROM professional_profiles
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'professional profile required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO cons
  FROM consultations
  WHERE id = target_consultation_id
    AND professional_id = prof.id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'consultation not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE consultations
  SET
    validated_at = COALESCE(validated_at, now()),
    validated_by = COALESCE(validated_by, prof.full_name),
    validation_notes = COALESCE(note, validation_notes),
    content_hash = COALESCE(payload_hash, content_hash)
  WHERE id = cons.id
  RETURNING * INTO cons;

  INSERT INTO audit_log (
    professional_id, user_id, action, entity_type, entity_id, metadata, engine_version
  ) VALUES (
    prof.id,
    auth.uid(),
    'consultation.validate',
    'consultation',
    cons.id::text,
    jsonb_build_object(
      'validated_by', cons.validated_by,
      'has_note', (cons.validation_notes IS NOT NULL AND cons.validation_notes <> ''),
      'content_hash_prefix', CASE
        WHEN cons.content_hash IS NULL THEN NULL
        ELSE left(cons.content_hash, 12)
      END
    ),
    COALESCE(cons.engine_version, '0.1.0')
  );

  RETURN to_jsonb(cons);
END;
$$;

COMMENT ON FUNCTION validate_consultation(uuid, text, text) IS
  'Physician seal: sets validated_at / validated_by / optional note + content_hash, and appends audit_log. Caller must own the consultation.';

REVOKE ALL ON FUNCTION validate_consultation(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_consultation(uuid, text, text) TO authenticated;

-- ---------------------------------------------------------------------
-- 5. Right to be forgotten — only the authenticated owner may call
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_professional_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof_id uuid;
BEGIN
  IF auth.uid() IS DISTINCT FROM target_user_id THEN
    RAISE EXCEPTION 'not authorized to delete this account' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO prof_id FROM professional_profiles WHERE user_id = target_user_id;
  IF NOT FOUND THEN
    -- Nothing to anonymize at the Functional Chef data layer
    RETURN false;
  END IF;

  INSERT INTO audit_log (professional_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (
    prof_id,
    target_user_id,
    'account.delete',
    'professional_profile',
    prof_id::text,
    '{"_account_deleted": true}'::jsonb
  );

  UPDATE consultations
  SET professional_id = NULL,
      validated_by = NULL
  WHERE professional_id = prof_id;

  UPDATE patient_profiles
  SET professional_id = NULL,
      biomarker_values = '{"_deleted": true}'::jsonb,
      clinical_signals = '{"_deleted": true}'::jsonb,
      exclusions = '{}'::jsonb,
      context = '{}'::jsonb,
      archived_at = now()
  WHERE professional_id = prof_id;

  UPDATE audit_log
  SET professional_id = NULL,
      user_id = NULL,
      metadata = '{"_account_deleted": true}'::jsonb
  WHERE professional_id = prof_id;

  DELETE FROM consent_records WHERE professional_id = prof_id;

  DELETE FROM professional_profiles WHERE id = prof_id;

  -- auth.users deletion is performed by the application via the Admin API
  RETURN true;
END;
$$;

COMMENT ON FUNCTION delete_professional_account(uuid) IS
  'GDPR Article 17 (right to be forgotten). Anonymizes Functional Chef data for the calling user only. auth.users must be deleted via the Admin API.';

REVOKE ALL ON FUNCTION delete_professional_account(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_professional_account(uuid) TO authenticated;

REVOKE ALL ON FUNCTION archive_expired_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION archive_expired_data() TO service_role;
