import Link from 'next/link';
import {
  formula as c,
  FORMULA_SLUG,
  FORMULA_DEFAULT_CONFIG,
  FORMULA_PRESET_UNITS,
  formulaDonateHref,
} from '@/data/formulaSupplementCampaign';
import { STANDARD_PRESET_DOLLARS, FAMILY_INTEREST_LIST_HREF } from '@/data/campaignShared';
import { getCampaignRecord, computeCanGoal } from '@/lib/campaignRecords';
import { getCampaignCashRaised } from '@/lib/campaignTotals';
import CampaignProgress from '@/components/campaigns/CampaignProgress';
import CampaignGiftOptions from '@/components/campaigns/CampaignGiftOptions';
import CampaignPrivacy from '@/components/campaigns/CampaignPrivacy';
import CampaignFooter from '@/components/campaigns/CampaignFooter';

export const revalidate = 300;

const url = `https://seedandspoon.org/campaigns/${FORMULA_SLUG}`;
const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

async function loadCampaign() {
  const record = await getCampaignRecord(FORMULA_SLUG);
  const config = record?.config && Object.keys(record.config).length ? record.config : FORMULA_DEFAULT_CONFIG;
  return { record, goal: computeCanGoal(config) };
}

export async function generateMetadata() {
  const { record } = await loadCampaign();
  const title = `${c.title} | Seed & Spoon NJ`;
  return {
    title,
    description: c.metaDescription,
    robots: record?.status === 'active' ? undefined : { index: false, follow: false },
    openGraph: { title, description: c.metaDescription, url, images: ['/og-image.jpg'], type: 'website' },
    twitter: { card: 'summary_large_image', title, description: c.metaDescription, images: ['/og-image.jpg'] },
  };
}

function giftOptions(goal) {
  if (goal.pending) {
    return STANDARD_PRESET_DOLLARS.map((amount) => ({ amount, href: formulaDonateHref(amount) }));
  }
  return FORMULA_PRESET_UNITS.map((u) => {
    const amount = Math.round((u.cans * goal.priceCents) / 100);
    return { amount, label: u.label, href: formulaDonateHref(amount) };
  });
}

function FormulaProgress({ raised, goal }) {
  if (goal.pending) {
    return (
      <CampaignProgress
        headline={c.gift.pendingLead}
        subline={`${usd(raised)} raised`}
        ariaLabel="Formula funded"
        valueNow={0}
        valueMax={goal.cansMax}
        pct={0}
      />
    );
  }
  const cansFunded = Math.min(Math.floor((raised * 100) / goal.priceCents), goal.cansMax);
  return (
    <CampaignProgress
      headline={`${cansFunded.toLocaleString('en-US')} of ${goal.cansMax.toLocaleString('en-US')} ${c.gift.progressLabel}`}
      subline={`${usd(raised)} raised of ${usd(goal.goalCents / 100)} goal`}
      ariaLabel="Cans of formula funded"
      valueNow={cansFunded}
      valueMax={goal.cansMax}
      pct={(raised * 100 * 100) / goal.goalCents}
      footnote={goal.extrasPending ? c.gift.extrasNote : null}
    />
  );
}

function BulletList({ heading, items, accent }) {
  return (
    <div className={`bg-white/80 rounded-xl p-6 shadow-lg border-l-4 ${accent} space-y-4`}>
      <h2 className="text-2xl md:text-3xl font-bold text-[#02538A]">{heading}</h2>
      <ul className="space-y-3">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3 text-gray-800 leading-relaxed">
            <span className="text-[#77A462] text-xl leading-6 flex-shrink-0" aria-hidden>✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function FormulaSupplementPilotPage() {
  const [{ goal }, { raised }] = await Promise.all([loadCampaign(), getCampaignCashRaised(FORMULA_SLUG)]);
  const options = giftOptions(goal);
  const lead = goal.pending
    ? c.gift.pendingLead
    : c.gift.leadTemplate
        .replace('{perCan}', usd(goal.priceCents / 100))
        .replace('{perWeekend}', usd((goal.priceCents * goal.cansPerBabyPerWeekend) / 100));

  return (
    <div className="min-h-screen bg-[#F9EED4] pt-16 md:pt-20 lg:pt-24">
      <section className="relative bg-gradient-to-br from-[#0B88C2] to-[#02538A] text-white py-16 md:py-20 px-4">
        <div id="hero-sentinel" className="absolute bottom-0 left-0 h-px w-full pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <Link href="/campaigns" className="inline-flex items-center text-white/80 hover:text-white text-sm mb-6">
            ← All campaigns
          </Link>
          <p className="text-sm uppercase tracking-[0.16em] font-semibold text-white/80 mb-3">{c.title}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">{c.hero.headline}</h1>
          {c.hero.paragraphs.map((t) => (
            <p key={t} className="mt-6 text-lg md:text-xl leading-relaxed opacity-95 max-w-3xl">{t}</p>
          ))}
          <Link
            href="#give"
            className="mt-10 inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            {c.causesCard.cta}
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        <FormulaProgress raised={raised} goal={goal} />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BulletList heading={c.howItWorks.heading} items={c.howItWorks.items} accent="border-[#77A462]" />
          <BulletList heading={c.safety.heading} items={c.safety.items} accent="border-[#EA802F]" />
        </section>

        <section className="space-y-6 scroll-mt-28" id="give">
          <h2 className="text-3xl md:text-4xl font-bold text-[#02538A]">{c.gift.heading}</h2>
          <p className="text-xl font-bold text-gray-900">{lead}</p>
          <CampaignGiftOptions options={options} />
          <p className="text-sm text-gray-600">{c.gift.giftUse}</p>
        </section>

        <CampaignPrivacy />

        {FAMILY_INTEREST_LIST_HREF && (
          <p className="text-center text-lg text-gray-800">
            {c.families.text}{' '}
            <Link href={FAMILY_INTEREST_LIST_HREF} className="font-semibold text-[#02538A] underline underline-offset-4 hover:text-[#EA802F]">
              {c.families.linkLabel}
            </Link>
          </p>
        )}
      </div>

      <CampaignFooter />
    </div>
  );
}
