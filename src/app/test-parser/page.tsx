'use client';

import { useState } from 'react';

export default function TestParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set('file', file);

    try {
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur inconnue');
      } else {
        setResult(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">🧪 Test parseur PDF Synlab</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Envoie un PDF d&apos;analyse Synlab pour tester l&apos;extraction automatique des biomarqueurs.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fichier PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm border border-neutral-300 rounded-lg p-2"
          />
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Extraction en cours…' : '🔬 Tester'}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <h2 className="font-bold text-lg">✅ Résultat</h2>

          {/* Patient */}
          <div className="bg-neutral-50 border rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-1">Patient</p>
            <p className="font-medium">{result.patient.id || 'NR'}</p>
            <p className="text-sm text-neutral-600">{result.patient.age} ans · {result.patient.gender}</p>
          </div>

          {/* Métadonnées */}
          <div className="flex gap-4 text-sm">
            <span className="bg-neutral-100 px-3 py-1 rounded">📅 {result.sample_date}</span>
            <span className="bg-neutral-100 px-3 py-1 rounded">🔬 {result.lab_ref}</span>
            <span className="bg-neutral-100 px-3 py-1 rounded">
              🎯 Confiance : {Math.round(result.extraction_confidence * 100)}%
            </span>
          </div>

          {/* Biomarqueurs */}
          <div>
            <p className="text-sm font-medium mb-2">
              Biomarqueurs extraits : {Object.keys(result.biomarkers).length}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-[10px] text-neutral-500 uppercase tracking-wider">
                  <th className="text-left pb-1">Marqueur FC</th>
                  <th className="text-left pb-1">Valeur</th>
                  <th className="text-left pb-1">Unité</th>
                  <th className="text-left pb-1">Réf.</th>
                  <th className="text-left pb-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.biomarkers).map(([key, bm]: [string, any]) => (
                  <tr key={key} className="border-b border-neutral-100">
                    <td className="py-1 font-mono text-xs">{key}</td>
                    <td className="py-1 font-mono">{bm.value ?? '-'}</td>
                    <td className="py-1 text-neutral-500">{bm.unit}</td>
                    <td className="py-1 text-neutral-500 font-mono text-xs">
                      {bm.ref?.min ?? '-'} – {bm.ref?.max ?? '-'}
                    </td>
                    <td className="py-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        bm.status === 'high' ? 'bg-red-100 text-red-800' :
                        bm.status === 'low' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {bm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* JSON brut */}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-neutral-600">📄 JSON brut</summary>
            <pre className="mt-2 bg-neutral-50 border rounded-lg p-4 text-xs overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}
