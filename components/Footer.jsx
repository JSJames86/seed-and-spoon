"use client";

import { useState } from "react";
import Link from "next/link";
import FooterVisual from "./FooterVisual";
import { InstagramIcon, TikTokIcon, ThreadsIcon, XIcon, FacebookIcon } from "./icons";
import { org, cta, columns, socials } from "@/config/footer";

// Icon mapping for socials
const iconMap = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Threads: ThreadsIcon,
  X: XIcon,
  Facebook: FacebookIcon,
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    // TODO: Integrate with newsletter service (Mailchimp, ConvertKit, etc.)
    setSubscribeStatus("Subscribed! Thank you.");
    setEmail("");
    setTimeout(() => setSubscribeStatus(""), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white" aria-label="Footer">
      {/* Visual Block: Illustration + Logo */}
      <FooterVisual />

      {/* CTA Band: Email Capture + Action Chips */}
      <div className="border-t border-neutral-100 bg-white py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Form */}
          <div className="max-w-xl mx-auto text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
              Get Updates
            </h2>
            <p className="text-sm text-neutral-600 mb-6">
              Fresh food resources, volunteer opportunities, and impact stories—straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full border border-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 text-white rounded-full font-medium text-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
              >
                Subscribe
              </button>
            </form>
            {subscribeStatus && (
              <p className="mt-3 text-sm font-medium text-emerald-700">{subscribeStatus}</p>
            )}
          </div>

          {/* CTA Chips */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {cta.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 bg-white text-neutral-700 text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
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
        </div>
      </div>

      {/* Link Grid */}
      <div className="border-t border-neutral-100 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
            {columns.map((column, idx) => (
              <div key={idx}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600 mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-2.5">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-neutral-700 hover:text-black underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm transition-colors inline-flex items-center gap-1"
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
      <div className="border-t border-neutral-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Social Icons */}
          <div className="flex justify-center gap-3 mb-6">
            {socials.map((social, idx) => {
              const Icon = iconMap[social.platform];
              return (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex items-center justify-center h-9 w-9 rounded-full border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          {/* Legal Row 1 */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-neutral-500 mb-3">
            <span>© {currentYear} {org.name}</span>
            <span>•</span>
            <Link href="/legal/privacy" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/legal/terms" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Terms
            </Link>
            <span>•</span>
            <Link href="/legal/food-waiver" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Food Safety & Allergy Waiver
            </Link>
          </div>

          {/* Legal Row 2 */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-neutral-500">
            <a href={`tel:${org.phone}`} className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              (732) 707-1769
            </a>
            <span>•</span>
            <a href={`mailto:${org.email}`} className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              {org.email}
            </a>
            <span>•</span>
            <Link href="/legal/donor-privacy" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Donor Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/legal/non-discrimination" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Non-Discrimination Statement
            </Link>
            <span>•</span>
            <Link href="/accessibility" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Accessibility
            </Link>
            <span>•</span>
            <Link href="/legal/cookies" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Cookie Settings
            </Link>
            <span>•</span>
            <Link href="/sitemap" className="hover:text-black hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
