import { cn } from '@/lib/utils';

export function NonDmNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'border border-ink-200 bg-ink-100/70 px-4 py-3 text-xs text-ink-700 leading-relaxed',
        className
      )}
      role="note"
    >
      <p>
        <strong>Outil d’aide, pas un dispositif médical.</strong> Functional Chef
        propose des pistes culinaires à valider par un praticien. Il ne pose pas
        de diagnostic et ne remplace pas un avis médical.
      </p>
    </aside>
  );
}
