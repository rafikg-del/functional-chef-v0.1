import type { PatientPlanDay } from '@/lib/patient/types';
import { mealSlotLabel } from '@/lib/patient/plan-view';

export function WeekPlanView({ days }: { days: PatientPlanDay[] }) {
  return (
    <div className="space-y-4">
      <p className="sr-only">Petit-déjeuner, déjeuner et dîner pour chaque jour.</p>
      {days.map((day) => (
        <article key={day.day} className="card !p-4">
          <h3 className="font-serif text-xl text-ink-900 mb-3">
            {day.label || `Jour ${day.day}`}
          </h3>
          <ul className="space-y-3">
            {day.meals.length === 0 ? (
              <li className="text-sm text-ink-500">Pas de plat proposé pour ce jour.</li>
            ) : (
              day.meals.map((meal) => (
                <li key={`${day.day}-${meal.slot}`} className="border-l-2 border-saffron-500 pl-3">
                  <p className="text-[11px] uppercase tracking-wider text-ink-500">
                    {mealSlotLabel(meal.slot)}
                  </p>
                  <p className="font-medium text-ink-900">{meal.title}</p>
                  {meal.summary ? (
                    <p className="text-sm text-ink-600 leading-relaxed">{meal.summary}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </article>
      ))}
    </div>
  );
}
