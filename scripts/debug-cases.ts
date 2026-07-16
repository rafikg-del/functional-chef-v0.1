import { classifyBottlenecks } from '../src/lib/reasoning/bottleneck-classifier';

const B = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'IR', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'INFLAM', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'DYSBIOSE', priority_rank: 3 },
];

const T = [
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, weight: 'major' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, weight: 'major' },
  { id: '10', bottleneck_id: 'IR', biomarker_id: 'SHBG', functional_target_min: 50, functional_target_max: null, alert_threshold_low: 30, alert_threshold_high: null, weight: 'moderate' },
  { id: '11', bottleneck_id: 'IR', biomarker_id: 'LIVER_FAT_PDFF', functional_target_min: null, functional_target_max: 5, alert_threshold_low: null, alert_threshold_high: 5, weight: 'major' },
  { id: '12', bottleneck_id: 'IR', biomarker_id: 'A_HYDROXYBUTYRATE', functional_target_min: null, functional_target_max: null, alert_threshold_low: null, alert_threshold_high: 12, weight: 'discriminant' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, weight: 'moderate' },
  { id: '6', bottleneck_id: 'IR', biomarker_id: 'GGT', functional_target_min: null, functional_target_max: 30, alert_threshold_low: null, alert_threshold_high: 40, weight: 'moderate' },
  { id: '8', bottleneck_id: 'IR', biomarker_id: 'URIC_ACID', functional_target_min: null, functional_target_max: 5.5, alert_threshold_low: null, alert_threshold_high: 6, weight: 'minor' },
  { id: '9', bottleneck_id: 'IR', biomarker_id: 'WAIST_HEIGHT_RATIO', functional_target_min: null, functional_target_max: 0.5, alert_threshold_low: null, alert_threshold_high: 0.55, weight: 'moderate' },
  { id: '20', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, weight: 'major' },
  { id: '21', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, weight: 'major' },
  { id: '22', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, weight: 'major' },
  { id: '24', bottleneck_id: 'INFLAM', biomarker_id: 'NLR', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 2.5, weight: 'moderate' },
  { id: '26', bottleneck_id: 'INFLAM', biomarker_id: 'FIBRINOGEN', functional_target_min: null, functional_target_max: 3.5, alert_threshold_low: null, alert_threshold_high: 4, weight: 'moderate' },
  { id: '30', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, weight: 'major' },
  { id: '31', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, weight: 'major' },
  { id: '32', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, weight: 'major' },
  { id: '34', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, weight: 'moderate' },
  { id: '35', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, weight: 'moderate' },
];

const D3 = { biomarker_values: { CRP_US: 2.8, OMEGA3_INDEX: 5, AA_EPA_RATIO: 12, NLR: 3.2, FIBRINOGEN: 4, CALPROTECTIN: 70 }, clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 3, FIBER_INTAKE: 15 }, exclusions: {}, context: {}, sex: 'F', age: 42 };
const D4 = { biomarker_values: { CRP_US: 2.2, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 14, HOMA_IR: 1.7, TG_HDL_RATIO: 1.4, FASTING_INSULIN: 8, FIBRINOGEN: 4.8, NLR: 3.8 }, clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 3, ABX_LIFETIME: 4, FIBER_INTAKE: 20 }, exclusions: {}, context: {}, sex: 'M', age: 28 };
const D6 = { biomarker_values: { HOMA_IR: 3.2, TG_HDL_RATIO: 2.8, FASTING_INSULIN: 16, SHBG: 18, URIC_ACID: 7.2, WAIST_HEIGHT_RATIO: 0.62, CRP_US: 2.5, OMEGA3_INDEX: 5 }, clinical_signals: { BRISTOL_SCORE: 5, BLOATING_FREQ: 4, ABX_LIFETIME: 2, FIBER_INTAKE: 16 }, exclusions: {}, context: {}, sex: 'F', age: 31 };

for (const [name, p] of Object.entries({D3, D4, D6})) {
  const r = classifyBottlenecks(p, B, T);
  console.log(name, '→ dominant:', r.dominant, 'co:', r.co_dominant);
  for (const s of r.scores) {
    console.log(' ', s.bottleneck_id, 'score:', s.score, 'trig:', s.triggered, 'M:', s.major_hits, 'm:', s.moderate_hits);
    for (const e of s.evidence) {
      console.log('   •', e.biomarker_id, e.observed_value, `(${e.weight})`);
    }
  }
}
