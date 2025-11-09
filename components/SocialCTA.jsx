"use client";

import { InstagramIcon, TikTokIcon, ThreadsIcon, XIcon, FacebookIcon } from "./icons";
import { socials } from "@/config/footer";

// Icon mapping for social platforms
const iconMap = {
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Threads: ThreadsIcon,
  X: XIcon,
  Facebook: FacebookIcon,
};

export default function SocialCTA() {
  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-3">
          Stay Connected
        </h2>
        <p className="text-base text-neutral-600 mb-8 max-w-2xl mx-auto">
          Follow our journey as we feed families today and grow solutions for tomorrow. Join our community on social media!
        </p>

        {/* Social Pills - Two rows on mobile, single row on desktop */}
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {socials.map((social) => {
            const Icon = iconMap[social.platform];
            return (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all duration-200 font-medium text-sm"
              >
                <Icon className="w-5 h-5" />
                <span>{social.platform}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
