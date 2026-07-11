-- =====================================================================
-- Functional Chef — Schema v0.1
-- 8 tables : bottlenecks, biomarkers, biomarker_thresholds,
--            culinary_levers, lever_bottleneck_map, bioavailability_synergies,
--            patient_profiles, consultations
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. BOTTLENECKS — 3 pilots in v0.1
-- ---------------------------------------------------------------------
CREATE TABLE bottlenecks (
  id              text PRIMARY KEY,         -- 'IR', 'INFLAM', 'DYSBIOSE'
  name            text NOT NULL,
  display_name_fr text NOT NULL,
  display_name_en text,
  description     text,
  priority_rank   int NOT NULL,             -- 1=IR, 2=INFLAM, 3=DYSBIOSE (causal cascade)
  classifier_rule text,                     -- human-readable summary of detection rule
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT bottleneck_priority_unique UNIQUE (priority_rank)
);

COMMENT ON TABLE bottlenecks IS 'Physiopathological bottlenecks targeted by Functional Chef. v0.1 contains 3 pilots.';
COMMENT ON COLUMN bottlenecks.priority_rank IS 'Tie-breaker for triple co-dominance: IR(1) > INFLAM(2) > DYSBIOSE(3) (causal cascade upstream→downstream).';

-- ---------------------------------------------------------------------
-- 2. BIOMARKERS — reference catalog
-- ---------------------------------------------------------------------
CREATE TABLE biomarkers (
  id          text PRIMARY KEY,             -- e.g. 'HOMA_IR', 'CRP_US', 'OMEGA_INDEX'
  name        text NOT NULL,
  unit        text,
  category    text CHECK (category IN ('metabolic', 'inflammatory', 'lipid', 'microbiome', 'clinical', 'composition', 'hepatic', 'renal', 'endocrine', 'autonomic', 'sleep')),
  description text,
  is_clinical boolean DEFAULT false,        -- true = subjective/symptom-based (e.g. Bristol)
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_biomarkers_category ON biomarkers(category);

COMMENT ON TABLE biomarkers IS 'Reference catalog of biomarkers and clinical signals usable in patient profiles.';

-- ---------------------------------------------------------------------
-- 3. BIOMARKER_THRESHOLDS — bottleneck × biomarker thresholds
-- ---------------------------------------------------------------------
CREATE TABLE biomarker_thresholds (
  id                       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bottleneck_id            text NOT NULL REFERENCES bottlenecks(id) ON DELETE CASCADE,
  biomarker_id             text NOT NULL REFERENCES biomarkers(id) ON DELETE CASCADE,
  -- Functional target (the "ideal" zone)
  functional_target_min    numeric,
  functional_target_max    numeric,
  -- Alert thresholds (trigger detection)
  alert_threshold_low      numeric,
  alert_threshold_high     numeric,
  -- For categorical / clinical signals
  alert_categorical_value  text,            -- e.g. 'positive' for SIBO breath test
  -- Weighting in classifier
  weight                   text NOT NULL CHECK (weight IN ('major', 'moderate', 'minor', 'discriminant')),
  notes                    text,
  CONSTRAINT thresholds_unique UNIQUE (bottleneck_id, biomarker_id)
);

CREATE INDEX idx_thresholds_bottleneck ON biomarker_thresholds(bottleneck_id);

COMMENT ON TABLE biomarker_thresholds IS 'Per-bottleneck thresholds with weighting (major/moderate/minor/discriminant) used by classifier.';

-- ---------------------------------------------------------------------
-- 4. CULINARY_LEVERS — the IP heart
-- ---------------------------------------------------------------------
CREATE TABLE culinary_levers (
  id                  text PRIMARY KEY,     -- e.g. 'L_VINEGAR_PRE', 'L_RESISTANT_STARCH'
  name_fr             text NOT NULL,
  name_en             text,
  description         text NOT NULL,
  category            text NOT NULL CHECK (category IN (
    'preparation', 'ingredient', 'timing', 'sequence', 'cooking', 'fermentation', 'dose', 'avoidance'
  )),
  expected_effect     text NOT NULL,        -- "↓20% AUC glucose 2h"
  -- EBM-F tiering
  ebm_tier            text NOT NULL CHECK (ebm_tier IN ('T1', 'T2', 'T3')),
  primary_reference   text,                 -- pivot citation (Author Year)
  pubmed_ids          text[],               -- array of PMIDs
  -- Implementation details
  dose_or_protocol    text,                 -- "15-30 ml, 10 min before meal"
  cooking_constraint  text,                 -- "≤120°C"
  -- Risk
  contraindications   text[],               -- ['anticoagulants', 'MICI_active']
  precautions         text[],
  -- Universal flag (transversal lever, ≥2 bottlenecks at T1)
  is_universal_star   boolean DEFAULT false,
  -- Operational
  active              boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE INDEX idx_levers_tier ON culinary_levers(ebm_tier);
CREATE INDEX idx_levers_universal ON culinary_levers(is_universal_star) WHERE is_universal_star = true;
CREATE INDEX idx_levers_category ON culinary_levers(category);

COMMENT ON TABLE culinary_levers IS 'The proprietary referential. Each lever = one EBM-tiered culinary intervention with mechanism and references.';
COMMENT ON COLUMN culinary_levers.is_universal_star IS 'TRUE = "leviers étoile" : transversal across ≥2 bottlenecks at T1. Forms the universal foundation of any output.';

-- ---------------------------------------------------------------------
-- 5. LEVER_BOTTLENECK_MAP — many-to-many with per-bottleneck tier
-- ---------------------------------------------------------------------
CREATE TABLE lever_bottleneck_map (
  id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lever_id                text NOT NULL REFERENCES culinary_levers(id) ON DELETE CASCADE,
  bottleneck_id           text NOT NULL REFERENCES bottlenecks(id) ON DELETE CASCADE,
  -- A lever can have different evidence tiers depending on the targeted bottleneck
  tier_for_bottleneck     text NOT NULL CHECK (tier_for_bottleneck IN ('T1', 'T2', 'T3')),
  priority                int DEFAULT 50,   -- 1-100, lower = higher priority
  bottleneck_specific_note text,
  CONSTRAINT lever_bottleneck_unique UNIQUE (lever_id, bottleneck_id)
);

CREATE INDEX idx_lbm_bottleneck ON lever_bottleneck_map(bottleneck_id, priority);

COMMENT ON TABLE lever_bottleneck_map IS 'A lever can serve multiple bottlenecks at different evidence tiers (e.g. EVOO is T1 for IR, T1 for INFLAM, T2 for DYSBIOSE).';

-- ---------------------------------------------------------------------
-- 6. BIOAVAILABILITY_SYNERGIES — molecule × matrix interactions
-- ---------------------------------------------------------------------
CREATE TABLE bioavailability_synergies (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  molecule_a         text NOT NULL,
  molecule_b         text NOT NULL,
  matrix_required    text,                  -- 'lipid_warm', 'acidic_medium'
  effect_description text NOT NULL,
  effect_magnitude   text,                  -- '+2000% (Shoba 1998, n=8)'
  ebm_tier           text NOT NULL CHECK (ebm_tier IN ('T1', 'T2', 'T3')),
  reference          text,
  is_synergy         boolean DEFAULT true,  -- false = anti-synergy
  notes              text,
  created_at         timestamptz DEFAULT now()
);

COMMENT ON TABLE bioavailability_synergies IS 'Couples of molecules with positive (synergy) or negative (anti-synergy) interactions used by composer to optimize/avoid pairings.';
COMMENT ON COLUMN bioavailability_synergies.is_synergy IS 'TRUE = pairing recommended. FALSE = pairing to avoid (e.g. polyphenols × non-heme iron).';

-- ---------------------------------------------------------------------
-- 7. PATIENT_PROFILES — input
-- ---------------------------------------------------------------------
CREATE TABLE patient_profiles (
  id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id        text,                  -- ZOI patient id if linked, NULL for standalone
  -- Demographics
  age                int CHECK (age IS NULL OR (age > 0 AND age < 120)),
  sex                text CHECK (sex IS NULL OR sex IN ('F', 'M', 'O')),
  -- Inputs (flexible schema for evolving biomarker set)
  biomarker_values   jsonb NOT NULL DEFAULT '{}'::jsonb,    -- {"HOMA_IR": 2.1, "CRP_US": 0.8}
  clinical_signals   jsonb NOT NULL DEFAULT '{}'::jsonb,    -- {"bristol_score": 6, "bloating_freq_per_week": 7}
  -- Constraints
  exclusions         jsonb NOT NULL DEFAULT '{}'::jsonb,    -- {"allergies": ["nuts"], "medical": ["MICI_active"]}
  context            jsonb NOT NULL DEFAULT '{}'::jsonb,    -- {"cuisine_pref": "mediterranean", "time_per_meal": 30, "budget": "medium", "equipment": ["oven","steam"]}
  -- Audit
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX idx_patients_external ON patient_profiles(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_patients_biomarkers ON patient_profiles USING gin (biomarker_values);
CREATE INDEX idx_patients_clinical ON patient_profiles USING gin (clinical_signals);

COMMENT ON TABLE patient_profiles IS 'Patient input. JSONB allows flexible biomarker set evolution without schema migration.';

-- ---------------------------------------------------------------------
-- 8. CONSULTATIONS — engine runs and output trace
-- ---------------------------------------------------------------------
CREATE TABLE consultations (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_profile_id    uuid REFERENCES patient_profiles(id) ON DELETE SET NULL,
  -- Intent
  intent                text NOT NULL,                     -- "Dîner anti-IR post-charge midi"
  meal_type             text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'full_day')),
  -- Pipeline outputs (stored as JSONB for full traceability)
  detected_bottlenecks  jsonb NOT NULL,                    -- [{id, score, dominance, breakdown}]
  selected_levers       jsonb NOT NULL,                    -- [{lever_id, tier, role}]
  output_dish           jsonb NOT NULL,                    -- full dish object
  ebm_summary           jsonb,                             -- {T1: 4, T2: 2, T3: 0}
  expected_effects      jsonb,                             -- {postprandial, short_term, long_term}
  -- Safety
  warnings              text[],
  excluded_levers       jsonb,                             -- levers filtered out + why
  -- LLM trace
  llm_model             text,
  llm_input_tokens      int,
  llm_output_tokens     int,
  llm_latency_ms        int,
  -- Audit
  created_at            timestamptz DEFAULT now(),
  -- Validation by clinician (optional, for B2B clinic flow)
  validated_at          timestamptz,
  validated_by          text,
  validation_notes      text
);

CREATE INDEX idx_consultations_patient ON consultations(patient_profile_id);
CREATE INDEX idx_consultations_created ON consultations(created_at DESC);
CREATE INDEX idx_consultations_bottlenecks ON consultations USING gin (detected_bottlenecks);

COMMENT ON TABLE consultations IS 'Each engine run is fully traceable: input → classification → lever selection → composed dish → LLM metadata.';

-- ---------------------------------------------------------------------
-- TRIGGERS — auto-update updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_culinary_levers
  BEFORE UPDATE ON culinary_levers
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_patient_profiles
  BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY (to enable when auth is added)
-- ---------------------------------------------------------------------
-- ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
-- (Policies to add when Supabase Auth is wired)
