"use client";

import { useEffect } from "react";

export function useRevealOnScroll(ref, options = {}) {
  const { y = 24, duration = 0.7, delay = 0 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    Object.assign(element.style, {
      opacity: "0",
      transform: `translateY(${y}px)`,
      transition: `opacity ${duration}s ease, transform ${duration}s ease`,
      transitionDelay: `${delay}s`,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
          observer.unobserve(element);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      element.style.opacity = "";
      element.style.transform = "";
      element.style.transition = "";
      element.style.transitionDelay = "";
    };
  }, [ref, y, duration, delay]);
}
