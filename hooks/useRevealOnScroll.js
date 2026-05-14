"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin (only runs in browser)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom hook for revealing elements on scroll with GSAP
 *
 * @param {React.RefObject} ref - Reference to the element to animate
 * @param {Object} options - Animation options
 * @param {number} options.y - Initial Y offset (default: 24)
 * @param {number} options.duration - Animation duration in seconds (default: 0.7)
 * @param {string} options.ease - GSAP easing function (default: "power2.out")
 * @param {string} options.start - ScrollTrigger start position (default: "top 80%")
 * @param {number} options.delay - Animation delay in seconds (default: 0)
 */
export function useRevealOnScroll(
  ref,
  options = {}
) {
  const {
    y = 24,
    duration = 0.7,
    ease = "power2.out",
    start = "top 80%",
    delay = 0,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If user prefers reduced motion, just set final state
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, y: 0 });
      return;
    }

    // Animate the element
    const animation = gsap.fromTo(
      element,
      {
        opacity: 0,
        y: y,
      },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: ease,
        delay: delay,
        scrollTrigger: {
          trigger: element,
          start: start,
          toggleActions: "play none none reverse",
        },
      }
    );

    // Cleanup function
    return () => {
      if (animation.scrollTrigger) {
        animation.scrollTrigger.kill();
      }
      animation.kill();
    };
  }, [ref, y, duration, ease, start, delay]);
}
