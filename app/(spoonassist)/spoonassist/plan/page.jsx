import Link from 'next/link';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';

export const metadata = { title: 'Plan' };

export default function SpoonAssistPlanPage() {
  return (
    <EmptyState
      title="Your weekly plan is empty"
      description="Add recipes to see them laid out across the week, with an overlap callout showing how many meals you get from how few items."
      action={
        <PillButton as={Link} href="/spoonassist/recipes">
          Browse recipes
        </PillButton>
      }
    />
  );
}
