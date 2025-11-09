"use client";

import { useState } from "react";
import Link from "next/link";
import FooterBanner from "./FooterBanner";
import FooterBrand from "./FooterBrand";
import { InstagramIcon, TikTokIcon, ThreadsIcon, XIcon, FacebookIcon } from "./icons";
import { org, cta, columns, legal, socials } from "@/config/footer";

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

    // Placeholder for newsletter subscription logic
    // TODO: Integrate with your newsletter service (Mailchimp, ConvertKit, etc.)
    setSubscribeStatus("Subscribed! Thank you.");
    setEmail("");

    setTimeout(() => setSubscribeStatus(""), 3000);
  };

  const currentYear = new Date().getFullYear();
  const showEIN = org.ein && org.ein !== "TBD";

  return (
    <footer
      className="mt-24 border-t border-black/10 bg-white text-black"
      aria-label="Footer"
    >
      {/* Banner */}
      <FooterBanner />

      {/* CTA Band with Newsletter */}
      <div className="relative overflow-hidden border-b border-black/10 bg-gradient-to-br from-emerald-50/50 via-lime-50/30 to-white">
        {/* Decorative blur blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-lime-300/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Newsletter Form */}
          <div className="max-w-xl mx-auto text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mb-3">
              Stay Connected
            </h2>
            <p className="text-sm text-black/70 mb-6">
              Get updates on fresh food, volunteer opportunities, and community impact.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full border border-black/20 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-all"
              >
                Subscribe
              </button>
            </form>
            {subscribeStatus && (
              <p className="mt-3 text-sm font-medium text-emerald-700">
                {subscribeStatus}
              </p>
            )}
          </div>

          {/* CTA Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {cta.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm text-sm font-medium text-black hover:bg-black hover:text-white hover:border-black focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-all"
              >
                {item.label}
                {item.external && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Link Grid */}
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {columns.map((column, idx) => (
              <div key={idx}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-black/50 mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-black/80 hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded transition-colors inline-flex items-center gap-1.5"
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

      {/* Brand + Social + Legal/Contact */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Brand + Socials Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 pb-6 border-b border-black/10">
            <FooterBrand />

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socials.map((social, idx) => {
                const Icon = iconMap[social.platform];
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-black/10 text-black hover:bg-black hover:text-white hover:border-black focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Legal + Contact Row */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-xs text-black/60">
            {/* Left: Copyright + Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-3 gap-y-2">
              <span>© {currentYear} {org.name}</span>
              <span className="hidden sm:inline text-black/30">•</span>
              {legal.slice(0, 3).map((item, idx) => (
                <span key={idx} className="flex items-center gap-3">
                  <Link
                    href={item.href}
                    className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded transition-colors"
                  >
                    {item.label}
                  </Link>
                  {idx < 2 && <span className="text-black/30">•</span>}
                </span>
              ))}
            </div>

            {/* Right: Contact Info */}
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-x-3 gap-y-2">
              <a
                href={`tel:${org.phone}`}
                className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded transition-colors"
              >
                {org.phone.replace(/^\+1/, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
              </a>
              <span className="text-black/30">•</span>
              <a
                href={`mailto:${org.email}`}
                className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded transition-colors"
              >
                {org.email}
              </a>
              {showEIN && (
                <>
                  <span className="text-black/30">•</span>
                  <span>
                    {org.name} is a 501(c)(3) nonprofit. EIN: {org.ein}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Additional Legal Links (Mobile-friendly) */}
          <div className="mt-4 pt-4 border-t border-black/10 flex flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-black/60">
            {legal.slice(3).map((item, idx) => (
              <span key={idx} className="flex items-center gap-3">
                <Link
                  href={item.href}
                  className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded transition-colors"
                >
                  {item.label}
                </Link>
                {idx < legal.slice(3).length - 1 && (
                  <span className="text-black/30">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
