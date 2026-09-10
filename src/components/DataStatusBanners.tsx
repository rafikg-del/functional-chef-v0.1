export function DataErrorBanner({
  title = 'Impossible de charger les données',
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="p-4 border border-tier-t3/30 bg-tier-t3/5 rounded-sm">
      <p className="text-sm text-tier-t3 font-medium">{title}</p>
      <p className="text-xs text-ink-700 mt-1">{message}</p>
      <p className="text-[11px] text-ink-500 mt-2">
        Les données de démonstration ne sont pas affichées tant que vous êtes connecté.
        Pour un aperçu hors ligne, définissez <code>NEXT_PUBLIC_USE_MOCK_DATA=true</code>.
      </p>
    </div>
  );
}

export function MockDataBanner() {
  return (
    <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-sm">
      <p className="text-xs text-amber-800 font-medium mb-1">Données de démonstration (opt-in)</p>
      <p className="text-[11px] text-amber-700">
        <code>NEXT_PUBLIC_USE_MOCK_DATA=true</code> est actif. Ces lignes ne sont pas des consultations réelles.
      </p>
    </div>
  );
}
