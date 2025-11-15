"use client";

import React from "react";
import Image from "next/image";

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
  return (
    <section
      id="our-story"
      className="bg-gradient-to-b from-[#faf8f4] to-[#f5f1e8] py-16 px-4 sm:px-6 lg:px-8"
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
                className="story-panel min-h-[400px] flex items-center"
              >
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`${
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
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div
                    className={`${
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
