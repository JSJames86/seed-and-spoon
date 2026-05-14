"use client";

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

// Register ScrollTrigger plugin (only runs in browser)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const storyPanels = [
  {
    id: 1,
    image: "/media/story/IMG_3092.jpeg",
    alt: "Hands planting seeds in soil",
    heading: "The seed that feeds.",
    subtext: "Every act of care starts small — like a seed planted with intention.",
  },
  {
    id: 2,
    image: "/media/story/serving-meal.jpg",
    alt: "Ladle serving warm food",
    heading: "The spoon that serves.",
    subtext: "Warm, home-style meals offered with dignity, not pity.",
  },
  {
    id: 3,
    image: "/media/story/child-hope.jpeg",
    alt: "Child's hopeful face",
    heading: "The voice that's heard.",
    subtext:
      "Kids, elders, veterans, and disabled neighbors who deserve more than the noise — they deserve to be seen and listened to.",
  },
  {
    id: 4,
    image: "/media/story/kids-running.jpg",
    alt: "Silhouette of kids running",
    heading: "The care that's shared.",
    subtext: "One neighbor leading another toward a safe place they trust.",
  },
  {
    id: 5,
    image: "/media/story/food-box.png",
    alt: "Volunteers packing a food box",
    heading: "The community that nourishes.",
    subtext:
      "Volunteers, donors, local chefs, gardens, and resources coming together so no one is left out.",
  },
];

export default function StoryScroll() {
  const containerRef = useRef(null);
  const storyHeaderRef = useRef(null);
  const manifestoRef = useRef(null);

  // Apply reveal animations
  useRevealOnScroll(storyHeaderRef, { duration: 0.8 });
  useRevealOnScroll(manifestoRef, { duration: 0.8 });

  useLayoutEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    // Get all story panels within the container
    const panels = gsap.utils.toArray(".story-panel", containerRef.current);
    const triggers = [];

    panels.forEach((panel) => {
      // Find the image element within this panel
      const image = panel.querySelector(".story-image");

      // Animate the panel: fade and slide up
      const panelTween = gsap.fromTo(
        panel,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Store the trigger for cleanup
      if (panelTween.scrollTrigger) {
        triggers.push(panelTween.scrollTrigger);
      }

      // Animate the image: subtle scale effect
      if (image) {
        const imageTween = gsap.fromTo(
          image,
          {
            scale: 0.96,
          },
          {
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Store the trigger for cleanup
        if (imageTween.scrollTrigger) {
          triggers.push(imageTween.scrollTrigger);
        }
      }
    });

    // Cleanup function
    return () => {
      // Kill all stored triggers
      triggers.forEach((trigger) => trigger.kill());
      // Kill any remaining tweens on the panels
      gsap.killTweensOf(panels);
    };
  }, []);

  return (
    <>
      {/* Our Story Header - Full width green gradient */}
      <section className="w-full bg-gradient-to-b from-[#226214] to-[#43CC25] py-16 md:py-24">
        <div ref={storyHeaderRef} className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-libre text-3xl md:text-4xl font-bold text-[#F8F6F0] tracking-tight">
            Our Story
          </h2>
          <div className="heading-underline"></div>
          <p className="mt-4 text-lg md:text-xl font-medium text-[#F8F6F0]/90">
            Five moments that capture what Seed &amp; Spoon is all about.
          </p>
        </div>
      </section>

      {/* Story Cards Section */}
      <section
        ref={containerRef}
        id="our-story"
        className="bg-[var(--cream)] py-16 md:py-24"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          {/* Story cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {storyPanels.map((panel) => {
              return (
                <div
                  key={panel.id}
                  className="story-panel overflow-hidden rounded-3xl shadow-sm border border-slate-100 bg-white"
                >
                  {/* Image */}
                  <div className="story-image relative w-full h-64 md:h-80">
                    <Image
                      src={panel.image}
                      alt={panel.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <h3 className="heading-h3 text-[var(--charcoal)] mb-2">
                      {panel.heading}
                    </h3>
                    <p className="body-md text-slate-700">
                      {panel.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manifesto Band */}
      <section className="w-full bg-gradient-to-r from-[#FF7A3D] via-[#FF9A52] to-[#FFB278] py-16 md:py-24">
        <div ref={manifestoRef} className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <p className="font-libre font-bold text-white text-2xl md:text-4xl leading-snug tracking-tight">
            At Seed &amp; Spoon, we don&apos;t just feed people.<br />
            We see them — and respond with compassion and care.
          </p>
        </div>
      </section>
    </>
  );
}
