import Link from 'next/link';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';

export const metadata = { title: 'Shopping list' };

export default function SpoonAssistListPage() {
  return (
    <EmptyState
      title="No shopping list yet"
      description="Build a weekly plan first — SpoonAssist consolidates and dedupes the ingredients into one smart list."
      action={
        <PillButton as={Link} href="/spoonassist/plan">
          Go to your plan
        </PillButton>
      }
    />
  );
}
