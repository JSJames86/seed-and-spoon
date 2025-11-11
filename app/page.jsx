// app/page.jsx
"use client";
import Link from "next/link";
import Hero from "@/components/Hero";
import HeroContent from "@/components/HeroContent";
import HeroSlideshow from "@/components/HeroSlideshow";
import ScrollReveal from "@/components/ScrollReveal";
import SocialCTA from "@/components/SocialCTA";

export default function Home() {
  return (
    <>
      <Hero />

      {/* HERO CONTENT SECTION - Below Video */}
      <ScrollReveal>
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <HeroContent />
          </div>
        </section>
      </ScrollReveal>

      {/* IMAGE SLIDESHOW & MISSION SECTION */}
      <ScrollReveal>
        <section className="bg-gradient-to-br from-green-700 to-green-900 py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            {/* Hero Slideshow */}
            <HeroSlideshow />

            {/* Mission Statement */}
            <h2 className="text-2xl md:text-4xl font-bold mb-6 border-t border-white/30 pt-12 mt-12">
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