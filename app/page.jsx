// app/page.jsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import ScrollReveal from "@/components/ScrollReveal";
import SocialCTA from "@/components/SocialCTA";

export default function Home() {
  // Set --vh CSS variable for iOS viewport height fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return (
    <>
      {/* HERO SECTION - Video Only */}
      {/* Sentinel for IntersectionObserver - triggers header overlay mode */}
      <section className="hero-section relative w-full overflow-hidden">
        <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none" aria-hidden="true"></div>
        <HeroVideo />
        {/* Optional subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
      </section>

      {/* GREEN HERO CONTENT SECTION - CTAs and Main Message */}
      <ScrollReveal>
        <section className="bg-gradient-to-br from-green-700 to-green-900 py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            {/* Main Headline */}
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              We grow food. We serve meals. But mostly, we <span className="text-yellow-300">see</span> people.
            </h1>

            <p className="mb-8 text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto">
              Building food sovereignty in Essex County—one family, one meal, one skill at a time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-12">
              <Link href="/get-help" className="rounded-lg bg-green-600 px-8 py-4 font-bold text-white transition hover:bg-green-500 shadow-lg hover:shadow-xl">
                Get Help
              </Link>
              <Link href="/donate" className="rounded-lg bg-orange-600 px-8 py-4 font-bold text-white transition hover:bg-orange-500 shadow-lg hover:shadow-xl">
                Donate Now
              </Link>
              <Link href="/volunteer" className="rounded-lg border-2 border-white px-8 py-4 font-bold text-white transition hover:bg-white hover:text-green-900 shadow-lg hover:shadow-xl">
                Volunteer
              </Link>
            </div>

            {/* Mission Statement */}
            <h2 className="text-2xl md:text-4xl font-bold mb-6 border-t border-white/30 pt-12">
              Bridging the gap between surplus and sustenance.
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              <strong>Seed & Spoon NJ</strong> tackles two critical issues simultaneously: the{" "}
              <span className="text-green-300 font-semibold">widespread waste of beautiful, farm-fresh produce</span>{" "}
              and the{" "}
              <span className="text-orange-400 font-semibold">growing challenge of food insecurity</span>{" "}
              in our community.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* 3-STEP IMPACT CYCLE */}
      <ScrollReveal>
        <section id="programs" className="py-20 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800 dark:text-white">
              Our 3-Step Impact Cycle
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
              From rescue to delivery, every meal makes a difference
            </p>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { icon: "Cook", title: "1. Cook", desc: "Skilled volunteers transform rescued produce into nourishing, chef-designed meals." },
                { icon: "Pack", title: "2. Pack", desc: "Meals are packaged individually into eco-friendly containers, labelled, and stored correctly." },
                { icon: "Deliver", title: "3. Deliver", desc: "Distribution teams run efficient routes, connecting meals with those who need them most." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <SocialCTA />
    </>
  );
}