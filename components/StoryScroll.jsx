"use client";

import React, { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
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
    highlighted:
      "At Seed & Spoon, we don't just feed people. We see them — and respond with compassion and care.",
  },
];

export default function StoryScroll() {
  const panelsRef = useRef([]);

  useLayoutEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Skip animations if user prefers reduced motion
      return;
    }

    // Animate each panel as it enters viewport
    const panels = panelsRef.current;

    panels.forEach((panel, index) => {
      if (!panel) return;

      const image = panel.querySelector(".story-image");
      const text = panel.querySelector(".story-text");

      gsap.fromTo(
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
            start: "top 70%",
            end: "top 20%",
            toggleActions: "play none none none",
          },
        }
      );

      // Subtle image scale effect
      if (image) {
        gsap.fromTo(
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
              start: "top 70%",
              end: "top 20%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="our-story"
      className="bg-gradient-to-b from-[#f5f1e8] to-[#faf8f4] py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section intro */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Story
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Five moments that capture what Seed & Spoon is all about.
          </p>
        </div>

        {/* Story panels */}
        <div className="space-y-24 md:space-y-32">
          {storyPanels.map((panel, index) => {
            const isEven = index % 2 === 1;

            return (
              <div
                key={panel.id}
                ref={(el) => (panelsRef.current[index] = el)}
                className="story-panel min-h-[70vh] flex items-center"
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`story-image ${
                      isEven ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
                      <Image
                        src={panel.image}
                        alt={panel.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div
                    className={`story-text ${
                      isEven ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                      {panel.heading}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                      {panel.subtext}
                    </p>
                    {panel.highlighted && (
                      <p className="text-xl md:text-2xl font-semibold text-[#8B4513] leading-relaxed border-l-4 border-[#8B4513] pl-4 py-2 bg-white/50 rounded-r-lg">
                        {panel.highlighted}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
