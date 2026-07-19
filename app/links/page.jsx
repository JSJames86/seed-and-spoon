'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';
import { SOCIAL_LINKS } from '@/data/socialLinks';

const UTM_SOURCE = 'seedandspoon';
const UTM_MEDIUM = 'links_page';

const LINKS = [
  { emoji: '💚', label: 'Donate', destination: '/give', external: false },
  { emoji: '🤝', label: 'Volunteer', destination: '/volunteer', external: false },
  {
    emoji: '📄',
    label: 'Read Our Research',
    destination: 'https://zenodo.org/records/20299779',
    external: true,
  },
  { emoji: '🛒', label: 'SpoonAssist', destination: '/spoonassist', external: false },
  { emoji: '🧾', label: 'Send Us the Receipts', destination: '/receipts', external: false },
  { emoji: '📊', label: 'Impact Engine', destination: '/impact', external: false },
  { emoji: '🌐', label: 'Full Website', destination: '/', external: false },
];

const SOCIAL_MONOGRAMS = {
  instagram: 'IG',
  threads: '@',
  x: 'X',
  facebook: 'f',
  tiktok: 'TT',
  linkedin: 'in',
};

function withTracking(url) {
  const withUtm = new URL(url);
  withUtm.searchParams.set('utm_source', UTM_SOURCE);
  withUtm.searchParams.set('utm_medium', UTM_MEDIUM);
  return withUtm.toString();
}

function getIncomingUtmSource() {
  if (typeof window === 'undefined') return undefined;
  return new URLSearchParams(window.location.search).get('utm_source') || undefined;
}

export default function LinksPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    captureEvent(EVENTS.LINKS_PAGE_VIEW, {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
    });
  }, []);

  const handleClick = (link) => {
    captureEvent(EVENTS.LINKS_PAGE_CLICK, {
      destination: link.destination,
      label: link.label,
      utm_source: getIncomingUtmSource(),
    });

    if (link.external) {
      window.location.href = withTracking(link.destination);
    } else {
      window.location.href = link.destination;
    }
  };

  const handleSocialClick = (social) => {
    captureEvent(EVENTS.LINKS_PAGE_CLICK, {
      destination: social.url,
      label: social.label,
      utm_source: getIncomingUtmSource(),
    });

    window.open(withTracking(social.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        <Image
          src="/assets/new-logos/logo-full.png"
          alt="Seed & Spoon"
          width={376}
          height={118}
          className="w-48 h-auto mb-4"
          priority
        />
        <p className="text-center text-[var(--dark-forest)] body-sm font-medium mb-8">
          Neighbors feeding neighbors in Essex County, NJ
        </p>

        <div className="w-full flex flex-col gap-4">
          {LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleClick(link)}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-full px-6 py-4 bg-[var(--white)] text-[var(--dark-forest)] font-semibold text-lg shadow-card border-2 border-transparent transition-all duration-300 hover:border-[var(--green-primary)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]"
            >
              <span aria-hidden="true">{link.emoji}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full flex justify-center gap-3 mt-8">
          {SOCIAL_LINKS.map((social) => (
            <button
              key={social.platform}
              onClick={() => handleSocialClick(social)}
              aria-label={social.label}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--white)] text-[var(--dark-forest)] font-bold text-sm shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:text-[var(--green-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-primary)]"
            >
              {SOCIAL_MONOGRAMS[social.platform]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
