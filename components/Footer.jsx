"use client";

import Link from "next/link";
import FooterVisual from "./FooterVisual";
import { InstagramIcon, TikTokIcon, ThreadsIcon, XIcon, FacebookIcon } from "./icons";
import { org, cta, columns, socials } from "@/config/footer";
import CapabilityStatementViewer from "./CapabilityStatementViewer";
import { SubscribeFooter } from "./email/SubscribeFooter";
import { FOOTER_SDGS } from "./sdgs/sdgData";

// Icon mapping for socials
const iconMap = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Threads: ThreadsIcon,
  X: XIcon,
  Facebook: FacebookIcon,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--cream)]" aria-label="Footer">
      {/* Visual Block: Illustration + Logo */}
      <FooterVisual />

      {/* CTA Band: Email Capture + Action Chips */}
      <div className="border-t border-neutral-100 bg-[var(--cream)] py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Form */}
          <SubscribeFooter />

          {/* CTA Chips */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {cta.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="tag tag-light inline-flex items-center gap-1.5 px-[18px] py-2 rounded-[20px] text-sm font-medium hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] focus-visible:ring-offset-2 transition-all duration-300"
              >
                {item.label}
                {item.external && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </Link>
            ))}
          </div>

          {/* Capability Statement download */}
          <div className="flex justify-center mt-4">
            <CapabilityStatementViewer compact={true} />
          </div>
        </div>
      </div>

      {/* Link Grid */}
      <div className="border-t border-neutral-100 bg-[var(--cream)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            {columns.map((column, idx) => (
              <div key={idx}>
                <h3 className="label-xs text-slate-600 mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="body-sm text-slate-600 hover:text-[var(--green-primary)] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        {link.external && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Social + Legal */}
      <div className="border-t border-neutral-100 bg-[var(--cream)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Social Icons */}
          <div className="flex justify-center gap-4 mb-6">
            {socials.map((social, idx) => {
              const Icon = iconMap[social.platform];
              return (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-neutral-200 text-slate-700 hover:border-[var(--green-primary)] hover:text-[var(--green-primary)] hover:bg-[rgba(79,175,59,0.1)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] focus-visible:ring-offset-2 transition-all duration-300"
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>

          {/* UN SDG Badges */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Independently aligned with UN Sustainable Development Goals
            </p>
            <div className="flex items-center gap-3">
              {FOOTER_SDGS.map((goal) => (
                <a
                  key={goal.number}
                  href={goal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`SDG ${goal.number}: ${goal.name}`}
                  className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`/images/sdg/sdg-${goal.slug}.png`}
                    alt={`SDG ${goal.number}: ${goal.name}`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Legal Row 1 */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-slate-500 mb-3">
            <span>© {currentYear} {org.name}</span>
            <span>•</span>
            <Link href="/legal/privacy" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/legal/terms" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Terms
            </Link>
            <span>•</span>
            <Link href="/legal/food-waiver" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Food Safety & Allergy Waiver
            </Link>
          </div>

          {/* Legal Row 2 */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-slate-500">
            <a href={`tel:${org.phone}`} className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              (732) 707-1769
            </a>
            <span>•</span>
            <a href={`mailto:${org.email}`} className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              {org.email}
            </a>
            <span>•</span>
            <Link href="/legal/donor-privacy" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Donor Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/legal/non-discrimination" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Non-Discrimination Statement
            </Link>
            <span>•</span>
            <Link href="/accessibility" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Accessibility
            </Link>
            <span>•</span>
            <Link href="/legal/cookies" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Cookie Settings
            </Link>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-[var(--charcoal)] hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-primary)] rounded-sm">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
