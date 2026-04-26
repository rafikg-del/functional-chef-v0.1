import { cn } from '@/lib/utils';
import type { EBMTier } from '@/lib/reasoning/types';

const TIER_LABEL: Record<EBMTier, string> = {
  T1: '≥1 méta-RCT humains',
  T2: 'RCT modeste / cohorte solide',
  T3: 'mécanistique / observationnel',
};

const TIER_STYLES: Record<EBMTier, string> = {
  T1: 'bg-tier-t1/10 text-tier-t1 border-tier-t1/30',
  T2: 'bg-tier-t2/10 text-tier-t2 border-tier-t2/30',
  T3: 'bg-tier-t3/10 text-tier-t3 border-tier-t3/30',
};

export function EBMBadge({
  tier,
  showTooltip = false,
  className,
}: {
  tier: EBMTier;
  showTooltip?: boolean;
  className?: string;
}) {
  return (
    <span
      title={showTooltip ? TIER_LABEL[tier] : undefined}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-sm border font-mono text-xs tracking-mono-tight',
        TIER_STYLES[tier],
        className
      )}
    >
      {tier}
    </span>
  );
}
