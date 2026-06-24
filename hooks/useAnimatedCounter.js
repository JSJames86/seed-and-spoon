"use client";

import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(target, duration = 1500, isVisible = false) {
  const [count, setCount] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !isVisible || hasAnimated) {
      setCount(target);
      return;
    }

    setCount(0);
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      setCount(target * easeOutCubic(progress));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        setHasAnimated(true);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, isVisible, hasAnimated]);

  return count;
}
