import type { PatientGroceryAisle } from '@/lib/patient/types';

export function GroceryListView({ aisles }: { aisles: PatientGroceryAisle[] }) {
  if (aisles.length === 0) {
    return <p className="text-sm text-ink-600">Liste de courses encore vide.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-600">Liste de courses groupée par rayon.</p>
      {aisles.map((aisle) => (
        <section key={aisle.aisle} className="card !p-4">
          <h3 className="font-serif text-lg text-ink-900 mb-2">{aisle.aisle || 'Autres'}</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-700">
            {aisle.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
