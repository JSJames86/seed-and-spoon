import Link from 'next/link';
import type { Program } from '@/data/programs';

interface DonationCardProps {
  program: Program;
  raisedUsd?: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function DonationCard({ program, raisedUsd = 0 }: DonationCardProps) {
  const pct = Math.min(100, Math.round((raisedUsd / program.goalUsd) * 100));

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <header className="flex items-center gap-3 text-xl font-semibold">
        <span aria-hidden="true" className="text-3xl">{program.emoji}</span>
        <h2>{program.name}</h2>
      </header>

      <p className="text-gray-600 mt-2">{program.summary}</p>

      <div className="mt-4 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Raised: {currencyFormatter.format(raisedUsd)}</span>
          <span>Goal: {currencyFormatter.format(program.goalUsd)}</span>
        </div>
        <div className="h-2 w-full rounded bg-gray-100 mt-2" aria-hidden="true">
          <div
            className="h-2 rounded bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`${pct}% of ${currencyFormatter.format(program.goalUsd)} goal reached`}
          className="sr-only"
        />
      </div>

      <ul className="mt-6 divide-y divide-gray-100">
        {program.tiers.map((tier, idx) => {
          const amountParam = program.ctaHref.includes('?')
            ? `&amount=${tier.amount}`
            : `?amount=${tier.amount}`;
          const donateUrl = `${program.ctaHref}${amountParam}`;

          return (
            <li key={idx} className="flex items-center gap-4 py-3">
              <div className="flex-1">
                <div className="text-lg font-semibold">
                  {currencyFormatter.format(tier.amount)}
                </div>
                <div className="text-sm font-medium text-gray-800">{tier.label}</div>
                <div className="text-sm text-gray-600">{tier.blurb}</div>
              </div>
              <Link
                href={donateUrl}
                className="ml-auto inline-flex items-center rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              >
                {program.ctaLabel || 'Donate'}
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
