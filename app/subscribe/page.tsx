import { SubscribeForm } from '@/components/email/SubscribeForm';

export const metadata = {
  title: 'Subscribe | Seed & Spoon NJ',
  description:
    'Stay connected with Seed & Spoon NJ. Get fresh food resources, volunteer opportunities, and impact stories straight to your inbox.',
};

export default function SubscribePage() {
  return (
    <section className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-4 py-24">
      <div className="max-w-lg w-full text-center">
        <p className="footer-heading mb-2">STAY CONNECTED</p>
        <h1 className="heading-h2 text-[var(--charcoal)] mb-4">
          Get <span className="text-[var(--green-primary)]">Updates</span>
        </h1>
        <p className="body-md text-slate-600 mb-8">
          Fresh food resources, volunteer opportunities, and impact stories—straight to your inbox.
        </p>
        <SubscribeForm />
      </div>
    </section>
  );
}
