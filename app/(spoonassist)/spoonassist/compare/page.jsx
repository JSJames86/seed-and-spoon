'use client';

import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';

// Price comparison across stores lands in Phase 4 (stores + price_quotes +
// the compare grid). This stub keeps the List page's CTA from dead-ending.
export default function SpoonAssistComparePage() {
  const plan = usePlan();

  return (
    <EmptyState
      title="Price comparison is coming soon"
      description={
        plan.hydrated && plan.consolidatedItems.length > 0
          ? `Your list has ${plan.consolidatedItems.length} items ready to compare across stores once this ships.`
          : 'Build a list first, then come back here to compare store prices.'
      }
      action={
        <PillButton as={Link} href="/spoonassist/list">
          Back to list
        </PillButton>
      }
    />
  );
}
