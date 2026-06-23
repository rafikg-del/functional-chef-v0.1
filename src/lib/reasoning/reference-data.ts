/**
 * Charge le référentiel bottlenecks / seuils / leviers.
 * Supabase si configuré, sinon fixtures embarquées (dev / entraînement hors DB).
 */

import { createServiceClient } from '../supabase/server';
import {
  BIOMARKER_THRESHOLDS,
  BOTTLENECKS,
  MINIMAL_LEVER_MAP,
  MINIMAL_LEVERS,
} from '../testing/fixtures';
import type {
  BiomarkerThreshold,
  Bottleneck,
  CulinaryLever,
  LeverBottleneckMap,
} from '../reasoning/types';

export interface ReferenceData {
  bottlenecks: Bottleneck[];
  thresholds: BiomarkerThreshold[];
  levers: CulinaryLever[];
  leverMap: LeverBottleneckMap[];
  source: 'supabase' | 'fixtures';
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT')
  );
}

export async function loadReferenceData(): Promise<ReferenceData> {
  if (!isSupabaseConfigured()) {
    return {
      bottlenecks: BOTTLENECKS,
      thresholds: BIOMARKER_THRESHOLDS,
      levers: MINIMAL_LEVERS,
      leverMap: MINIMAL_LEVER_MAP,
      source: 'fixtures',
    };
  }

  try {
    const supabase = createServiceClient();
    const [
      { data: bottlenecks, error: bErr },
      { data: thresholds, error: tErr },
      { data: levers, error: lErr },
      { data: leverMap, error: mErr },
    ] = await Promise.all([
      supabase.from('bottlenecks').select('*'),
      supabase.from('biomarker_thresholds').select('*'),
      supabase.from('culinary_levers').select('*').eq('active', true),
      supabase.from('lever_bottleneck_map').select('*'),
    ]);

    if (bErr || tErr || lErr || mErr || !bottlenecks?.length) {
      throw new Error(bErr?.message ?? tErr?.message ?? 'empty supabase data');
    }

    return {
      bottlenecks: bottlenecks as Bottleneck[],
      thresholds: thresholds as BiomarkerThreshold[],
      levers: (levers ?? MINIMAL_LEVERS) as CulinaryLever[],
      leverMap: (leverMap ?? MINIMAL_LEVER_MAP) as LeverBottleneckMap[],
      source: 'supabase',
    };
  } catch {
    return {
      bottlenecks: BOTTLENECKS,
      thresholds: BIOMARKER_THRESHOLDS,
      levers: MINIMAL_LEVERS,
      leverMap: MINIMAL_LEVER_MAP,
      source: 'fixtures',
    };
  }
}
