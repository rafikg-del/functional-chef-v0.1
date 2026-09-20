'use client';

import type { BiomarkerRow } from '@/lib/patient/biomarker-fields';

export function BiomarkerEditor({
  rows,
  onChange,
}: {
  rows: BiomarkerRow[];
  onChange: (rows: BiomarkerRow[]) => void;
}) {
  function update(index: number, patch: Partial<BiomarkerRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([
      ...rows,
      {
        key: `saisie_${rows.length + 1}`,
        label: 'Autre biomarqueur',
        unit: '',
        value: '',
      },
    ]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-600">
        Corrigez ou saisissez vos biomarqueurs. Une valeur suffit pour
        composer un menu.
      </p>
      <div className="overflow-x-auto border border-ink-200 rounded-sm bg-white">
        <table className="w-full text-sm min-w-[28rem]">
          <thead className="bg-ink-100/80 text-left text-xs uppercase tracking-wider text-ink-600">
            <tr>
              <th className="px-3 py-2 font-medium">Marqueur</th>
              <th className="px-3 py-2 font-medium">Valeur</th>
              <th className="px-3 py-2 font-medium">Unité</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.key}-${index}`} className="border-t border-ink-200">
                <td className="px-3 py-2">
                  <input
                    aria-label={`Nom du biomarqueur ${index + 1}`}
                    value={row.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    className="input-field !py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-2 w-28">
                  <input
                    aria-label={`Valeur ${row.label || row.key}`}
                    inputMode="decimal"
                    value={row.value}
                    onChange={(e) => update(index, { value: e.target.value })}
                    className="input-field biomarker-value !py-1.5 text-sm"
                  />
                </td>
                <td className="px-3 py-2 w-24">
                  <input
                    aria-label={`Unité ${row.label || row.key}`}
                    value={row.unit}
                    onChange={(e) => update(index, { unit: e.target.value })}
                    className="input-field !py-1.5 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="btn-ghost text-xs !py-1.5 !px-3">
        Ajouter un biomarqueur
      </button>
    </div>
  );
}
