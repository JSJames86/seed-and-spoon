import Link from 'next/link';

export const metadata = {
  title: 'Access by invitation | Seed & Spoon',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="mt-6 text-3xl font-extrabold text-charcoal">Access is by invitation</h1>
        <p className="text-gray-600">
          Seed &amp; Spoon accounts are created by invitation for the families we serve, donors,
          volunteers, and board members. If you were invited, use the link in your invitation email.
        </p>
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--green-primary)] hover:text-[var(--leaf-mid)]">
            Sign in
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          Looking for help with food? Visit{' '}
          <Link href="/get-help" className="font-medium text-[var(--green-primary)] hover:text-[var(--leaf-mid)]">
            Get Help
          </Link>
          . Questions? Email{' '}
          <a href="mailto:hello@seedandspoon.org" className="font-medium text-[var(--green-primary)]">
            hello@seedandspoon.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
