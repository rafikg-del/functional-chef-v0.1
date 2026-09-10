-- =====================================================================
-- Migration 004 — Beta waitlist (practitioner pre-registration)
-- =====================================================================
-- Stores practitioner interest only: email, specialty, volume, name.
-- No patient identifiers, biomarkers, or clinical notes (no PHI).
-- =====================================================================

CREATE TABLE IF NOT EXISTS beta_waitlist (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text NOT NULL,
  specialty          text NOT NULL CHECK (specialty IN (
    'medecin_fonctionnel', 'medecin_generaliste', 'dieteticien',
    'naturopathe', 'chercheur', 'autre'
  )),
  patients_per_week  text NOT NULL CHECK (patients_per_week IN (
    '0-5', '5-15', '15-30', '30+'
  )),
  full_name          text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
  source             text NOT NULL DEFAULT 'beta_page' CHECK (source IN (
    'landing', 'beta_page', 'demo'
  )),
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE beta_waitlist IS
  'Practitioner beta pre-registration. Contact fields only — no patient PHI.';
COMMENT ON COLUMN beta_waitlist.patients_per_week IS
  'Self-reported weekly nutrition-related patient volume bucket. Not a patient roster.';
COMMENT ON COLUMN beta_waitlist.full_name IS
  'Practitioner display name for outreach. Not a patient identity.';

CREATE UNIQUE INDEX IF NOT EXISTS beta_waitlist_email_lower_idx
  ON beta_waitlist (lower(email));

CREATE INDEX IF NOT EXISTS idx_beta_waitlist_created
  ON beta_waitlist (created_at DESC);

ALTER TABLE beta_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_waitlist FORCE ROW LEVEL SECURITY;

-- Public pre-registration: anon and authenticated may insert.
CREATE POLICY "Public can insert beta waitlist"
  ON beta_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(email)) > 3
    AND char_length(trim(full_name)) BETWEEN 2 AND 120
  );

-- Reads: owner/admin only (Supabase Auth app_metadata.role = admin).
-- service_role bypasses RLS for SQL editor / server admin jobs.
CREATE POLICY "Admins can select beta waitlist"
  ON beta_waitlist
  FOR SELECT
  TO authenticated
  USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

REVOKE ALL ON TABLE beta_waitlist FROM PUBLIC;
GRANT INSERT ON TABLE beta_waitlist TO anon;
GRANT INSERT, SELECT ON TABLE beta_waitlist TO authenticated;
