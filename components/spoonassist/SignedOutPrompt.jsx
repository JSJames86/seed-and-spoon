import Link from 'next/link';
import PillButton from './PillButton';
import EmptyState from './EmptyState';

// Shown in place of a Profile sub-page's content (Pantry, Saved recipes,
// List history, Stores & ZIP) when nobody's signed in -- these all need an
// account to persist anything, so this is a real destination (sign up),
// never a disabled row.
export default function SignedOutPrompt({ title }) {
  return (
    <EmptyState
      title={title}
      description="Sign up to save this to your account."
      action={
        <PillButton as={Link} href="/signup">
          Sign up
        </PillButton>
      }
    />
  );
}
