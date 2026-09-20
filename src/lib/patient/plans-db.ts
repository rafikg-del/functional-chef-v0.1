import type { SupabaseClient } from '@supabase/supabase-js';
import type { BiomarkerMap } from './types';
import type { PlanListItem, StoredIntakeRow, StoredLabRow, StoredPlanRow } from './plans-handler';

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return [];
}

export function createPatientPlansDb(supabase: SupabaseClient, userId: string) {
  return {
    async insertLab(row: {
      user_id: string;
      source: 'manual';
      parsed_biomarkers: BiomarkerMap;
      edited_biomarkers: BiomarkerMap;
    }): Promise<{ id: string }> {
      const { data, error } = await supabase
        .from('patient_labs')
        .insert(row)
        .select('id')
        .single();
      if (error || !data) {
        throw new Error(error?.message ?? 'lab insert failed');
      }
      return data;
    },

    async insertIntake(row: {
      user_id: string;
      lab_id: string | null;
      problem_text: string;
      goals_text: string;
      goal_tags: string[] | null;
    }): Promise<{ id: string }> {
      const { data, error } = await supabase
        .from('patient_intakes')
        .insert(row)
        .select('id')
        .single();
      if (error || !data) {
        throw new Error(error?.message ?? 'intake insert failed');
      }
      return data;
    },

    async insertPlan(row: {
      user_id: string;
      intake_id: string;
      status: 'ready';
      menu_7d: unknown;
      grocery_list: unknown;
      generation_meta: unknown;
    }): Promise<{ id: string }> {
      const { data, error } = await supabase
        .from('patient_plans')
        .insert(row)
        .select('id')
        .single();
      if (error || !data) {
        throw new Error(error?.message ?? 'plan insert failed');
      }
      return data;
    },

    async loadLab(labId: string): Promise<StoredLabRow | null> {
      const { data, error } = await supabase
        .from('patient_labs')
        .select('parsed_biomarkers, edited_biomarkers')
        .eq('id', labId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        parsed_biomarkers: (data.parsed_biomarkers ?? {}) as BiomarkerMap,
        edited_biomarkers: (data.edited_biomarkers ?? {}) as BiomarkerMap,
      };
    },

    async loadDietaryExclusions(): Promise<string[]> {
      const { data } = await supabase
        .from('patient_profiles')
        .select('dietary_exclusions')
        .eq('user_id', userId)
        .maybeSingle();
      return asStringArray(data?.dietary_exclusions);
    },

    async listPlans(): Promise<PlanListItem[]> {
      const { data, error } = await supabase
        .from('patient_plans')
        .select('id, created_at, status')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id as string,
        created_at: (row.created_at as string | null) ?? null,
        status: row.status as string,
      }));
    },

    async loadPlan(_userId: string, planId: string): Promise<StoredPlanRow | null> {
      const { data, error } = await supabase
        .from('patient_plans')
        .select('id, user_id, intake_id, status, menu_7d, grocery_list, generation_meta, created_at')
        .eq('id', planId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .maybeSingle();
      if (error || !data) return null;
      return data as StoredPlanRow;
    },

    async loadIntake(intakeId: string): Promise<StoredIntakeRow | null> {
      const { data, error } = await supabase
        .from('patient_intakes')
        .select('id, user_id, lab_id, problem_text, goals_text, goal_tags')
        .eq('id', intakeId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data) return null;
      return data as StoredIntakeRow;
    },

    async updatePlan(row: {
      id: string;
      user_id: string;
      status: 'ready';
      menu_7d: unknown;
      grocery_list: unknown;
      generation_meta: unknown;
    }): Promise<{ id: string } | null> {
      const { data, error } = await supabase
        .from('patient_plans')
        .update({
          status: row.status,
          menu_7d: row.menu_7d,
          grocery_list: row.grocery_list,
          generation_meta: row.generation_meta,
        })
        .eq('id', row.id)
        .eq('user_id', userId)
        .select('id')
        .single();
      if (error || !data) return null;
      return data;
    },
  };
}
