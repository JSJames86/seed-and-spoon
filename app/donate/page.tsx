import { DonationGrid } from '@/components/DonationGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate — Seed & Spoon',
  description: 'Support our programs with a donation to Seed & Spoon.',
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Donate — Seed & Spoon
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Your gift fuels the Spoon (care today) and the Seed (solutions for tomorrow).
            Choose a program below.
          </p>
        </header>

        <DonationGrid />

        <footer className="mt-12 text-center text-sm text-gray-600">
          <p>90% programs / 10% operations overall (est.)</p>
        </footer>
      </div>
    </main>
  );
}
