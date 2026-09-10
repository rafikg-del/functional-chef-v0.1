import { classifyBottlenecks } from '@/lib/reasoning/bottleneck-classifier';
import { selectLevers } from '@/lib/reasoning/lever-selector';
import type {
  ClassificationResult,
  ComposedDish,
  LeverSelectionResult,
  PatientProfile,
} from '@/lib/reasoning/types';
import { DEMO_LEVER_MAP, DEMO_LEVERS } from './catalog';
import { DEMO_BOTTLENECKS, DEMO_THRESHOLDS, type DemoCaseKey } from './cases';
import { buildDeterministicDish, FIXTURE_DISHES } from './compose-preview';

export type DemoDishSource = 'fixture' | 'deterministic' | 'live';

export interface PublicDemoResult {
  classification: ClassificationResult;
  lever_selection: LeverSelectionResult;
  dish: ComposedDish | null;
  dish_source: DemoDishSource;
  case_key: DemoCaseKey;
}

export function runPublicDemo(opts: {
  patient: PatientProfile;
  case_key?: DemoCaseKey;
}): PublicDemoResult {
  const case_key = opts.case_key ?? 'custom';
  const classification = classifyBottlenecks(
    opts.patient,
    DEMO_BOTTLENECKS,
    DEMO_THRESHOLDS
  );

  const lever_selection = selectLevers({
    classification,
    available_levers: DEMO_LEVERS,
    lever_bottleneck_map: DEMO_LEVER_MAP,
  });

  if (!classification.dominant) {
    return {
      classification,
      lever_selection,
      dish: null,
      dish_source: 'deterministic',
      case_key,
    };
  }

  if (case_key === 'A' || case_key === 'B' || case_key === 'C') {
    return {
      classification,
      lever_selection,
      dish: FIXTURE_DISHES[case_key],
      dish_source: 'fixture',
      case_key,
    };
  }

  return {
    classification,
    lever_selection,
    dish: buildDeterministicDish(classification.dominant, lever_selection.selected),
    dish_source: 'deterministic',
    case_key,
  };
}
