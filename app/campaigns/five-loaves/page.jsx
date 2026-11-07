import Link from 'next/link';
import {
  fiveLoaves as c,
  FIVE_LOAVES_SLUG,
  KIT_COST,
  TOTAL_KITS,
  PHASE_1_GOAL,
  START_THRESHOLD,
  LAUNCH,
  SCHOOL,
  LIVE_PROGRESS,
} from '@/data/fiveLoavesCampaign';
import { getCampaignCashRaised } from '@/lib/campaignTotals';
import { ORG_LEGAL_NAME, ORG_EIN } from '@/lib/org';

// Static route; takes precedence over app/campaigns/[slug] for this slug.
// Totals refresh every 5 minutes.
export const revalidate = 300;

const url = `https://seedandspoon.org/campaigns/${FIVE_LOAVES_SLUG}`;

export const metadata = {
  title: `${c.title} | Seed & Spoon NJ`,
  description: c.metaDescription,
  robots: LAUNCH.launched ? undefined : { index: false, follow: false },
  openGraph: {
    title: `${c.title} | Seed & Spoon NJ`,
    description: c.metaDescription,
    url,
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${c.title} | Seed & Spoon NJ`,
    description: c.metaDescription,
    images: ['/og-image.jpg'],
  },
};

const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

function KitProgress({ raised }) {
  const kitsFunded = Math.floor(raised / KIT_COST);
  const pct = Math.min(100, (raised / PHASE_1_GOAL) * 100);
  const marker = START_THRESHOLD * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <p className="text-2xl md:text-3xl font-bold text-[#02538A]">
        {Math.min(kitsFunded, TOTAL_KITS).toLocaleString('en-US')} of {TOTAL_KITS} weekend kits funded
      </p>
      <p className="mt-1 text-sm text-gray-600">
        {usd(raised)} raised toward the {usd(PHASE_1_GOAL)} Phase 1 food goal
      </p>

      <div className="relative mt-8 mb-2">
        {/* 75% marker label */}
        <div
          className="absolute -top-7 -translate-x-1/2 text-xs font-semibold text-[#EA802F] whitespace-nowrap"
          style={{ left: `${marker}%` }}
        >
          {c.gift.thresholdMarkerLabel}
        </div>
        <div
          role="progressbar"
          aria-label="Weekend kits funded"
          aria-valuemin={0}
          aria-valuemax={TOTAL_KITS}
          aria-valuenow={Math.min(kitsFunded, TOTAL_KITS)}
          aria-valuetext={`${Math.min(kitsFunded, TOTAL_KITS)} of ${TOTAL_KITS} weekend kits funded`}
          className="relative h-4 w-full rounded-full bg-gray-200 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#77A462] to-[#0B88C2]"
            style={{ width: `${pct}%`, minWidth: raised > 0 ? '0.5rem' : 0 }}
          />
        </div>
        <div
          aria-hidden
          className="absolute -top-1 h-6 w-0.5 bg-[#EA802F]"
          style={{ left: `${marker}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">{Math.round(pct)}% of Phase 1</p>
    </div>
  );
}

export default async function FiveLoavesCampaignPage() {
  const { raised } = await getCampaignCashRaised(FIVE_LOAVES_SLUG);
  const schoolParagraph = c.pilot.schoolParagraph.replace(
    '{school}',
    LAUNCH.schoolNameApproved ? SCHOOL.name : SCHOOL.genericName,
  );
  const p = LIVE_PROGRESS;

  return (
    <div className="min-h-screen bg-[#F9EED4] pt-16 md:pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B88C2] to-[#02538A] text-white py-16 md:py-20 px-4">
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <Link href="/campaigns" className="inline-flex items-center text-white/80 hover:text-white text-sm mb-6">
            ← All campaigns
          </Link>
          <p className="text-sm uppercase tracking-[0.16em] font-semibold text-white/80 mb-3">{c.title}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">{c.hero.headline}</h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed opacity-95 max-w-3xl">{c.hero.body}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.hero.stats.map((block) => (
              <div key={block.label} className="rounded-2xl bg-white/10 border border-white/20 p-6">
                <h2 className="text-sm uppercase tracking-[0.14em] font-semibold text-white/80 mb-4">{block.label}</h2>
                <ul className="space-y-3">
                  {block.items.map((item) => (
                    <li key={item.value + item.text}>
                      <span className="text-3xl md:text-4xl font-bold">{item.value}</span>{' '}
                      <span className="text-lg opacity-95">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href={c.hero.primaryCta.href}
            className="mt-10 inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            {c.hero.primaryCta.label}
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* Progress */}
        <KitProgress raised={raised} />

        {/* The pilot */}
        <section className="space-y-5">
          <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">{c.pilot.heading}</h2>
          {c.pilot.paragraphs.map((t) => (
            <p key={t} className="text-lg text-gray-800 leading-relaxed">{t}</p>
          ))}
          <p className="text-lg text-gray-800 leading-relaxed">{schoolParagraph}</p>

          <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-[#77A462] space-y-4">
            <h3 className="text-2xl font-bold text-[#02538A]">{c.pilot.selection.heading}</h3>
            {c.pilot.selection.paragraphs.map((t) => (
              <p key={t} className="text-gray-800 leading-relaxed">{t}</p>
            ))}
            <p className="font-bold text-[#02538A]">{c.pilot.selection.callout}</p>
          </div>
        </section>

        {/* How your gift works */}
        <section className="space-y-6" id="give">
          <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">{c.gift.heading}</h2>
          <p className="text-xl font-bold text-gray-900">{c.gift.lead}</p>
          <p className="text-lg text-gray-800 leading-relaxed">{c.gift.body}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.gift.options.map((o) => (
              <Link
                key={o.amount}
                href={o.href}
                className="group rounded-xl bg-white p-5 shadow-md border border-[#02538A]/10 hover:border-[#EA802F] hover:shadow-lg transition-all"
              >
                <span className="block text-2xl font-bold text-[#02538A] group-hover:text-[#EA802F]">{usd(o.amount)}</span>
                <span className="block mt-1 text-gray-700">{o.label}</span>
              </Link>
            ))}
            <Link
              href={c.gift.monthly.href}
              className="group rounded-xl bg-[#77A462] p-5 shadow-md text-white hover:bg-[#5a8a4a] transition-all"
            >
              <span className="block text-2xl font-bold">$50 / month</span>
              <span className="block mt-1">{c.gift.monthly.label}</span>
            </Link>
          </div>

          <p className="text-sm text-gray-600">{c.gift.giftUse}</p>

          <div className="bg-white/80 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-2xl font-bold text-[#02538A]">{c.gift.phasesHeading}</h3>
            <ul className="space-y-2">
              {c.gift.phases.map((ph) => (
                <li key={ph.name} className="flex flex-wrap items-baseline gap-x-2 text-gray-800">
                  <span className="font-bold">{ph.name}{ph.goal ? `: ${ph.goal}` : ':'}</span>
                  <span className={ph.live ? 'text-[#77A462] font-semibold' : 'text-gray-600'}>({ph.note})</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-800 leading-relaxed">
              <strong>{c.gift.thresholdLead}</strong> {c.gift.thresholdBody}
            </p>
          </div>
        </section>

        {/* Privacy */}
        <section className="rounded-2xl bg-[#02538A] text-white p-8 space-y-4">
          <h2 className="text-3xl font-bold">{c.privacy.heading}</h2>
          {c.privacy.paragraphs.map((t) => (
            <p key={t} className="text-lg leading-relaxed opacity-95">{t}</p>
          ))}
        </section>

        {/* What we'll measure */}
        <section className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">{c.measure.heading}</h2>
          <p className="text-lg text-gray-800 leading-relaxed">{c.measure.intro}</p>

          <div className="overflow-x-auto rounded-xl shadow-lg">
            <table className="w-full bg-white text-left">
              <thead className="bg-[#0B88C2] text-white">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">What we track</th>
                  <th scope="col" className="px-5 py-3 font-semibold">How</th>
                </tr>
              </thead>
              <tbody>
                {c.measure.rows.map((r) => (
                  <tr key={r.what} className="border-t border-gray-100">
                    <th scope="row" className="px-5 py-3 font-semibold text-gray-900">{r.what}</th>
                    <td className="px-5 py-3 text-gray-700">{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-[#EA802F] space-y-4">
            <h3 className="text-2xl font-bold text-[#02538A]">{c.measure.liveHeading}</h3>
            {p.weekendsCompleted > 0 ? (
              <>
                <p className="text-xl font-bold text-gray-900">
                  Week {p.weekendsCompleted} of {p.totalWeekends} · {p.kitsDelivered.toLocaleString('en-US')} kits delivered
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ['Weekend kits delivered', p.kitsDelivered.toLocaleString('en-US')],
                    ['Weekends completed', `${p.weekendsCompleted} of ${p.totalWeekends}`],
                    ['Children served', p.childrenServed.toLocaleString('en-US')],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#F9EED4] p-4">
                      <dt className="text-sm text-gray-600">{label}</dt>
                      <dd className="text-2xl font-bold text-[#02538A]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-gray-800">
                Weekly totals start here once the first kits go out: weekend kits delivered, weekends completed (of {p.totalWeekends}), and children served.
              </p>
            )}
            <p className="text-sm text-gray-600">{c.measure.liveNote}</p>
          </div>

          <p className="text-lg text-gray-800 leading-relaxed">{c.measure.closing}</p>
        </section>

        {/* Closing CTA */}
        <section className="text-center space-y-4">
          <Link
            href={c.hero.primaryCta.href}
            className="inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            {c.hero.primaryCta.label}
          </Link>
        </section>
      </div>

      <footer className="border-t border-[#02538A]/10 py-8 px-4">
        <p className="max-w-5xl mx-auto text-sm text-gray-600 text-center">
          {ORG_LEGAL_NAME} is a 501(c)(3) public charity. EIN {ORG_EIN}. Gifts are tax-deductible to the extent allowed by law.
        </p>
      </footer>
    </div>
  );
}
