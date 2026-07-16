/**
 * ═══════════════════════════════════════════════════════════
 *  PATIENT_PROFILES — Base de cas cliniques pour validation
 *  ═══════════════════════════════════════════════════════════
 *
 *  30 profils couvrant l'espace clinique des 3 bottlenecks
 *  + phénotypes enrichis (v0.2).
 *
 *  Usage :
 *    import { PATIENT_PROFILES } from './patient-profiles';
 *    for (const p of PATIENT_PROFILES) {
 *      const result = classifyBottlenecks(p.profile, BOTTLENECKS, THRESHOLDS);
 *      expect(result.dominant).toBe(p.expected.dominant);
 *    }
 */

import type { PatientProfile } from '../types';

export interface PatientTestCase {
  id: string;
  label: string;
  description: string;
  profile: PatientProfile;
  expected: {
    dominant: string | null;
    co_dominant?: string | null;
    phenotypes?: string[];
    inflam_phenotypes?: string[];
    ir_triggered?: boolean;
    inflam_triggered?: boolean;
    dysbiose_triggered?: boolean;
    min_score_ir?: number;
    min_score_inflam?: number;
    min_score_dysbiose?: number;
  };
}

export const PATIENT_PROFILES: PatientTestCase[] = [
  // ══════════════════════════════════════════════════════════
  //  GROUPE A : IR dominant (7 cas)
  // ══════════════════════════════════════════════════════════

  {
    id: 'A1',
    label: 'IR simple — homme 45 ans',
    description: 'IR classique, pas de comorbidité inflammatoire. HOMA-IR 2.5, TG/HDL 2.0, insuline 12. Poids stable.',
    profile: {
      biomarker_values: { HOMA_IR: 2.5, TG_HDL_RATIO: 2.0, FASTING_INSULIN: 12, WAIST_HEIGHT_RATIO: 0.58 },
      clinical_signals: {},
      exclusions: {},
      context: {}, sex: 'M', age: 45,
    },
    expected: { dominant: 'IR', ir_triggered: true, inflam_triggered: false, dysbiose_triggered: false, min_score_ir: 9 },
  },
  {
    id: 'A2',
    label: 'IR + MASLD — femme 52 ans',
    description: 'IR avec stéatose hépatique confirmée par PDFF. HOMA-IR 3.0, ALT 45, PDFF 8%.',
    profile: {
      biomarker_values: { HOMA_IR: 3.0, TG_HDL_RATIO: 2.4, FASTING_INSULIN: 14, ALT: 45, LIVER_FAT_PDFF: 8, GGT: 42 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'F', age: 52,
    },
    expected: { dominant: 'IR', phenotypes: ['hepatic_masld'], min_score_ir: 12 },
  },
  {
    id: 'A3',
    label: 'IR + PCOS — femme 29 ans',
    description: 'SOPK infraclinique : HOMA-IR 2.2, SHBG 22, acide urique 6.8, waist/height 0.56. Cycle irrégulier.',
    profile: {
      biomarker_values: { HOMA_IR: 2.2, TG_HDL_RATIO: 1.8, FASTING_INSULIN: 9, SHBG: 22, URIC_ACID: 6.8, WAIST_HEIGHT_RATIO: 0.56 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'F', age: 29,
    },
    expected: { dominant: 'IR', phenotypes: ['pcos_adipose'], min_score_ir: 10 },
  },
  {
    id: 'A4',
    label: 'IR limite — seuils exacts',
    description: 'Cas limite : HOMA-IR exactement à 1.5 (seuil major), insuline 8.0 (seuil major). 2 majors seulement → pas de déclenchement IR.',
    profile: {
      biomarker_values: { HOMA_IR: 1.5, FASTING_INSULIN: 8.0, TG_HDL_RATIO: 1.0 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 60,
    },
    expected: { dominant: null, ir_triggered: false },
  },
  {
    id: 'A5',
    label: 'IR précoce — femme 34 ans',
    description: 'Signes infracliniques : HOMA-IR 1.8, insuline 9, TG/HDL 1.6, SHBG 32. Fatigue postprandiale.',
    profile: {
      biomarker_values: { HOMA_IR: 1.8, FASTING_INSULIN: 9, TG_HDL_RATIO: 1.6, SHBG: 32 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'F', age: 34,
    },
    expected: { dominant: 'IR', min_score_ir: 8 },
  },
  {
    id: 'A6',
    label: 'IR sévère — homme 55 ans, pré-diabète',
    description: 'HbA1c 6.0, HOMA-IR 4.5, insuline 18, TG/HDL 3.0. Pré-diabète franc.',
    profile: {
      biomarker_values: { HOMA_IR: 4.5, TG_HDL_RATIO: 3.0, FASTING_INSULIN: 18, HBA1C: 6.0, WAIST_HEIGHT_RATIO: 0.62 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 55,
    },
    expected: { dominant: 'IR', min_score_ir: 12 },
  },
  {
    id: 'A7',
    label: 'IR avec α-HB élevé — homme 48 ans',
    description: 'IR avec α-hydroxybutyrate >12. Discriminant hepatic_masld sans imagerie. HOMA-IR 2.8, α-HB 14.',
    profile: {
      biomarker_values: { HOMA_IR: 2.8, TG_HDL_RATIO: 2.0, FASTING_INSULIN: 11, A_HYDROXYBUTYRATE: 14, ALT: 35 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 48,
    },
    expected: { dominant: 'IR', phenotypes: [], min_score_ir: 9 }, // α-HB seul → pas de tag hepatic_masld
  },

  // ══════════════════════════════════════════════════════════
  //  GROUPE B : INFLAM dominant (6 cas)
  // ══════════════════════════════════════════════════════════

  {
    id: 'B1',
    label: 'INFLAM simple — homme 62 ans',
    description: 'CRP-us 3.5, Omega-3 Index 4.8%, AA/EPA 15. Inflammation chronique bas grade. Pas d\'IR.',
    profile: {
      biomarker_values: { CRP_US: 3.5, OMEGA3_INDEX: 4.8, AA_EPA_RATIO: 15, NLR: 3.5, FIBRINOGEN: 4.5 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 62,
    },
    expected: { dominant: 'INFLAM', min_score_inflam: 9 },
  },
  {
    id: 'B2',
    label: 'INFLAM + blocage fer — femme 38 ans',
    description: 'CRP 2.5 + TSAT 18% + ferritine 280. Blocage fonctionnel du fer. Fatigue réfractaire.',
    profile: {
      biomarker_values: { CRP_US: 2.5, OMEGA3_INDEX: 6.1, AA_EPA_RATIO: 8, TSAT: 18, FERRITIN: 280 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'F', age: 38,
    },
    expected: { dominant: 'INFLAM', inflam_phenotypes: ['functional_iron_blockade'], min_score_inflam: 6 },
  },
  {
    id: 'B3',
    label: 'INFLAM léger — homme 45 ans',
    description: 'CRP 1.2, Omega-3 Index 6.5%, AA/EPA 5. Inflammation limite. 1 major + 1 moderate → pas de déclenchement.',
    profile: {
      biomarker_values: { CRP_US: 1.2, OMEGA3_INDEX: 6.5, AA_EPA_RATIO: 5 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 45,
    },
    expected: { dominant: null, inflam_triggered: false },
  },
  {
    id: 'B4',
    label: 'INFLAM post-infectieux — femme 28 ans',
    description: 'CRP 4.2, fibrinogène 5.0, NLR 4.0. Suite infection virale persistante. Pas d\'IR ni dysbiose.',
    profile: {
      biomarker_values: { CRP_US: 4.2, FIBRINOGEN: 5.0, NLR: 4.0, OMEGA3_INDEX: 5.0, AA_EPA_RATIO: 10 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'F', age: 28,
    },
    expected: { dominant: 'INFLAM', min_score_inflam: 9 },
  },
  {
    id: 'B5',
    label: 'INFLAM + omega-3 très bas — homme 70 ans',
    description: 'Omega-3 Index 3.2% (extrêmement bas). CRP 1.5, AA/EPA 18. Sujet âgé, inflammation liée à l\'âge.',
    profile: {
      biomarker_values: { OMEGA3_INDEX: 3.2, CRP_US: 1.5, AA_EPA_RATIO: 18, FIBRINOGEN: 4.2, NLR: 3.0 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 70,
    },
    expected: { dominant: 'INFLAM', min_score_inflam: 9 },
  },
  {
    id: 'B6',
    label: 'INFLAM co-dominant avec IR — homme 50 ans',
    description: 'CRP 2.0, Omega-3 5.5% (INFLAM modéré) ET HOMA-IR 2.2, TG/HDL 1.7 (IR modéré). Co-dominance.',
    profile: {
      biomarker_values: { CRP_US: 2.0, OMEGA3_INDEX: 5.5, AA_EPA_RATIO: 7, HOMA_IR: 2.2, TG_HDL_RATIO: 1.7, FASTING_INSULIN: 9 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 50,
    },
    expected: { dominant: 'IR', co_dominant: 'INFLAM' },
  },

  // ══════════════════════════════════════════════════════════
  //  GROUPE C : DYSBIOSE dominant (5 cas)
  // ══════════════════════════════════════════════════════════

  {
    id: 'C1',
    label: 'DYSBIOSE simple — femme 32 ans',
    description: 'Bristol 6, ballonnements 5/sem, calprotectine 80, ABX 4 cures, fibres 12g/j. Constipation alternant diarrhée.',
    profile: {
      biomarker_values: { CALPROTECTIN: 80 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 4, FIBER_INTAKE: 12 },
      exclusions: {}, context: {}, sex: 'F', age: 32,
    },
    expected: { dominant: 'DYSBIOSE', min_score_dysbiose: 12 },
  },
  {
    id: 'C2',
    label: 'DYSBIOSE constipation — homme 40 ans',
    description: 'Bristol 1 (constipation sévère), ballonnements 3/sem, fibres 8g/j. SIBO breath test positif.',
    profile: {
      biomarker_values: { SIBO_BREATH_TEST: 'positif', CALPROTECTIN: 30 },
      clinical_signals: { BRISTOL_SCORE: 1, BLOATING_FREQ: 3, FIBER_INTAKE: 8, ABX_LIFETIME: 2 },
      exclusions: {}, context: {}, sex: 'M', age: 40,
    },
    expected: { dominant: 'DYSBIOSE', dysbiose_triggered: true, min_score_dysbiose: 7 }, // SIBO + Bristol 1 + ballonnements 3 + fibres 8 → assez de moderate + major
  },
  {
    id: 'C3',
    label: 'DYSBIOSE post-ABX — femme 55 ans',
    description: '3 cures d\'antibiotiques en 12 mois. Bristol 6, ballonnements 4/sem, calprotectine 65. Selles molles.',
    profile: {
      biomarker_values: { CALPROTECTIN: 65 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 4, ABX_LIFETIME: 6, FIBER_INTAKE: 18 },
      exclusions: {}, context: {}, sex: 'F', age: 55,
    },
    expected: { dominant: 'DYSBIOSE', min_score_dysbiose: 11 },
  },
  {
    id: 'C4',
    label: 'DYSBIOSE normale — Bristol 4',
    description: 'Bristol 4 (normal), pas de ballonnements, fibres 25g/j. Pas de déclenchement malgré ABX passés.',
    profile: {
      biomarker_values: {},
      clinical_signals: { BRISTOL_SCORE: 4, BLOATING_FREQ: 0, FIBER_INTAKE: 25, ABX_LIFETIME: 2 },
      exclusions: {}, context: {}, sex: 'M', age: 30,
    },
    expected: { dominant: null, dysbiose_triggered: false },
  },
  {
    id: 'C5',
    label: 'DYSBIOSE minime — Bristol 5, ballonnements 2/sem',
    description: 'Bristol 5 (marginal), ballonnements 2/sem, pas de calpro, fibres 20g/j. Cas limite.',
    profile: {
      biomarker_values: {},
      clinical_signals: { BRISTOL_SCORE: 5, BLOATING_FREQ: 2, FIBER_INTAKE: 20, ABX_LIFETIME: 2 },
      exclusions: {}, context: {}, sex: 'F', age: 35,
    },
    expected: { dominant: null, dysbiose_triggered: false },
  },

  // ══════════════════════════════════════════════════════════
  //  GROUPE D : Cascades et multi-bottlenecks (6 cas)
  // ══════════════════════════════════════════════════════════

  {
    id: 'D1',
    label: 'Triple cascade IR > INFLAM > DYSBIOSE',
    description: 'Femme 34 ans, fatigue, prise de poids 4kg/6 mois, ballonnements. HOMA-IR 2.3, CRP 1.8, Bristol 6. Cas clinique de référence.',
    profile: {
      biomarker_values: { HOMA_IR: 2.3, TG_HDL_RATIO: 1.9, FASTING_INSULIN: 10, CRP_US: 1.8, OMEGA3_INDEX: 5.2, SHBG: 24, CALPROTECTIN: 55 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 4, ABX_LIFETIME: 4, FIBER_INTAKE: 14 },
      exclusions: {}, context: {}, sex: 'F', age: 34,
    },
    expected: { dominant: 'IR', co_dominant: 'INFLAM', ir_triggered: true, inflam_triggered: true, dysbiose_triggered: true },
  },
  {
    id: 'D2',
    label: 'Triple avec IR MASLD + DYSBIOSE',
    description: 'Homme 60 ans, stéatose + dysbiose. HOMA-IR 3.5, PDFF 10%, Bristol 2 (constipation), calprotectine 45. La classification reelle depend des scores compares.',
    profile: {
      biomarker_values: { HOMA_IR: 3.5, TG_HDL_RATIO: 2.5, FASTING_INSULIN: 15, ALT: 55, LIVER_FAT_PDFF: 10, GGT: 48, CALPROTECTIN: 45 },
      clinical_signals: { BRISTOL_SCORE: 2, BLOATING_FREQ: 3, FIBER_INTAKE: 12, ABX_LIFETIME: 3 },
      exclusions: {}, context: {}, sex: 'M', age: 60,
    },
    expected: { dominant: 'IR', phenotypes: ['hepatic_masld'], ir_triggered: true, dysbiose_triggered: false }, // Bristol 2 seul major + fibres 12 moderate = pas assez pour DYSBIOSE
  },
  {
    id: 'D3',
    label: 'INFLAM + DYSBIOSE (IR absent)',
    description: 'Patiente 42 ans, CRP 2.8, Omega-3 5.0%, Bristol 6, ballonnements 5/sem. Pas d\'IR.',
    profile: {
      biomarker_values: { CRP_US: 2.8, OMEGA3_INDEX: 5.0, AA_EPA_RATIO: 12, NLR: 3.2, FIBRINOGEN: 4.0, CALPROTECTIN: 70 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 3, FIBER_INTAKE: 15 },
      exclusions: {}, context: {}, sex: 'F', age: 42,
    },
    expected: { dominant: 'INFLAM', inflam_triggered: true, dysbiose_triggered: false }, // DYSBIOSE: 3 majors + 0 moderate → règle exige ≥2 majors + ≥1 moderate
  },
  {
    id: 'D4',
    label: 'Triple cascade post-COVID',
    description: 'Jeune homme 28 ans, fatigue persistante post-COVID. CRP 2.2, Omega-3 4.5%, HOMA-IR 1.7, Bristol 6.',
    profile: {
      biomarker_values: { CRP_US: 2.2, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 14, HOMA_IR: 1.7, TG_HDL_RATIO: 1.4, FASTING_INSULIN: 8, FIBRINOGEN: 4.8, NLR: 3.8 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 3, ABX_LIFETIME: 4, FIBER_INTAKE: 20 },
      exclusions: {}, context: {}, sex: 'M', age: 28,
    },
    expected: { dominant: 'INFLAM', inflam_triggered: true, dysbiose_triggered: false, ir_triggered: false }, // IR: 1 major seul. DYSBIOSE: 1 major + 1 moderate. INFLAM seul domine
  },
  {
    id: 'D5',
    label: 'Triple avec phénotype fer',
    description: 'Femme 48 ans, fatigue réfractaire, CRP 3.0, TSAT 18%, ferritine 320, HOMA-IR 2.0, Bristol 5.',
    profile: {
      biomarker_values: { CRP_US: 3.0, OMEGA3_INDEX: 5.8, AA_EPA_RATIO: 9, TSAT: 18, FERRITIN: 320, HOMA_IR: 2.0, TG_HDL_RATIO: 1.6, FASTING_INSULIN: 9 },
      clinical_signals: { BRISTOL_SCORE: 5, BLOATING_FREQ: 2, FIBER_INTAKE: 18, ABX_LIFETIME: 2 },
      exclusions: {}, context: {}, sex: 'F', age: 48,
    },
    expected: { dominant: 'INFLAM', inflam_phenotypes: ['functional_iron_blockade'], inflam_triggered: true, ir_triggered: true }, // INFLAM domine par score (CRP 3.0 + Omega-3 5.8)
  },
  {
    id: 'D6',
    label: 'Triple avec PCOS + inflammation',
    description: 'Femme 31 ans, SOPK avéré. HOMA-IR 3.2, SHBG 18, acide urique 7.2, CRP 2.5, Bristol 5.',
    profile: {
      biomarker_values: { HOMA_IR: 3.2, TG_HDL_RATIO: 2.8, FASTING_INSULIN: 16, SHBG: 18, URIC_ACID: 7.2, WAIST_HEIGHT_RATIO: 0.62, CRP_US: 2.5, OMEGA3_INDEX: 5.0 },
      clinical_signals: { BRISTOL_SCORE: 5, BLOATING_FREQ: 4, ABX_LIFETIME: 2, FIBER_INTAKE: 16 },
      exclusions: {}, context: {}, sex: 'F', age: 31,
    },
    expected: { dominant: 'IR', phenotypes: ['pcos_adipose'], inflam_triggered: true, dysbiose_triggered: false }, // DYSBIOSE: 1 major (bloating 4) seul → pas assez. IR massif (HOMA 3.2, TG/HDL 2.8, insuline 16) domine
  },

  // ══════════════════════════════════════════════════════════
  //  GROUPE E : Cas sains et limites (6 cas)
  // ══════════════════════════════════════════════════════════

  {
    id: 'E1',
    label: 'Patient sain — homme 25 ans',
    description: 'Aucun biomarqueur en dehors des normes. HOMA-IR 0.8, CRP 0.3, Omega-3 8.5%, Bristol 4.',
    profile: {
      biomarker_values: { HOMA_IR: 0.8, TG_HDL_RATIO: 0.8, FASTING_INSULIN: 4, CRP_US: 0.3, OMEGA3_INDEX: 8.5, AA_EPA_RATIO: 2.5, NLR: 1.2, FIBRINOGEN: 2.8 },
      clinical_signals: { BRISTOL_SCORE: 4, BLOATING_FREQ: 0, FIBER_INTAKE: 30, ABX_LIFETIME: 1 },
      exclusions: {}, context: {}, sex: 'M', age: 25,
    },
    expected: { dominant: null, ir_triggered: false, inflam_triggered: false, dysbiose_triggered: false },
  },
  {
    id: 'E2',
    label: 'Patient sain 2 — femme 30 ans, sportive',
    description: 'Sportive régulière. HOMA-IR 0.5, CRP 0.1, Omega-3 9%, Bristol 3.',
    profile: {
      biomarker_values: { HOMA_IR: 0.5, TG_HDL_RATIO: 0.6, FASTING_INSULIN: 3, CRP_US: 0.1, OMEGA3_INDEX: 9.0, AA_EPA_RATIO: 2.0 },
      clinical_signals: { BRISTOL_SCORE: 3, BLOATING_FREQ: 0, FIBER_INTAKE: 35, ABX_LIFETIME: 0 },
      exclusions: {}, context: {}, sex: 'F', age: 30,
    },
    expected: { dominant: null, ir_triggered: false, inflam_triggered: false, dysbiose_triggered: false },
  },
  {
    id: 'E3',
    label: 'Patient sain âgé — homme 65 ans',
    description: 'HOMA-IR 1.2, CRP 0.8 (limite haute), Omega-3 7%. Sportif senior.',
    profile: {
      biomarker_values: { HOMA_IR: 1.2, TG_HDL_RATIO: 1.0, FASTING_INSULIN: 6, CRP_US: 0.8, OMEGA3_INDEX: 7.0, AA_EPA_RATIO: 4 },
      clinical_signals: { BRISTOL_SCORE: 4, BLOATING_FREQ: 0, FIBER_INTAKE: 28, ABX_LIFETIME: 1 },
      exclusions: {}, context: {}, sex: 'M', age: 65,
    },
    expected: { dominant: null, ir_triggered: false, inflam_triggered: false, dysbiose_triggered: false },
  },
  {
    id: 'E4',
    label: 'Marqueurs manquants — patient partiel',
    description: 'Seulement HOMA-IR disponible (1.3). Pas de TG/HDL ni insuline → pas assez pour déclencher IR.',
    profile: {
      biomarker_values: { HOMA_IR: 1.3 },
      clinical_signals: {},
      exclusions: {}, context: {}, sex: 'M', age: 40,
    },
    expected: { dominant: null, ir_triggered: false },
  },
  {
    id: 'E5',
    label: 'Un seul marqueur par bottleneck',
    description: 'HOMA-IR 1.6 (1 major), CRP 1.1 (1 major), Bristol 6 (1 major). Aucun ne cumule assez pour trigger.',
    profile: {
      biomarker_values: { HOMA_IR: 1.6, CRP_US: 1.1 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 2 },
      exclusions: {}, context: {}, sex: 'F', age: 35,
    },
    expected: { dominant: null, ir_triggered: false, inflam_triggered: false, dysbiose_triggered: false },
  },
  {
    id: 'E6',
    label: 'Exclusion MICI — ne pas classifier DYSBIOSE',
    description: 'Patient avec MICI connue. Bristol 6, ballonnements, calprotectine 200. Le champ exclusions bloque la classification DYSBIOSE.',
    profile: {
      biomarker_values: { CALPROTECTIN: 200 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 2, FIBER_INTAKE: 15 },
      exclusions: { IBD: true, Crohn: true },
      context: { known_IBD: true }, sex: 'M', age: 35,
    },
    expected: { dominant: null, dysbiose_triggered: false }, // Exclu par IBD
  },
];
