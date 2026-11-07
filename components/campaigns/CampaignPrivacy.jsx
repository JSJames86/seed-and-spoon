import { CAMPAIGN_PRIVACY } from '@/data/campaignShared';

export default function CampaignPrivacy() {
  return (
    <section className="rounded-2xl bg-[#02538A] text-white p-8 space-y-4">
      <h2 className="text-3xl font-bold">{CAMPAIGN_PRIVACY.heading}</h2>
      {CAMPAIGN_PRIVACY.paragraphs.map((t) => (
        <p key={t} className="text-lg leading-relaxed opacity-95">{t}</p>
      ))}
    </section>
  );
}
