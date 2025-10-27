import { DonationGrid } from '@/components/DonationGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate — Seed & Spoon',
  description: 'Support our programs with a donation to Seed & Spoon.',
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-20 sm:pt-[88px] md:pt-24 lg:pt-[104px]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <header className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Donate — Seed & Spoon
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your gift fuels the Spoon (care today) and the Seed (solutions for tomorrow).
            Choose a program below.
          </p>
        </header>

        <DonationGrid />

        <footer className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-gray-600">
          <p>90% programs / 10% operations overall (est.)</p>
        </footer>
      </div>
    </main>
  );
}
