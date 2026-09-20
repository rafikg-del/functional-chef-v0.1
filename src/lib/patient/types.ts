export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export interface PatientPlanMeal {
  slot: MealSlot;
  title: string;
  summary: string;
}

export interface PatientPlanDay {
  day: number;
  label: string;
  meals: PatientPlanMeal[];
}

export interface PatientGroceryAisle {
  aisle: string;
  items: string[];
}

export interface PatientPlanClient {
  id: string;
  days: PatientPlanDay[];
  grocery_list: PatientGroceryAisle[];
  disclaimer: string;
}

export type PatientLabSource = 'pdf' | 'manual' | 'pdf_edited';

export type BiomarkerMap = Record<string, number | string | null>;
