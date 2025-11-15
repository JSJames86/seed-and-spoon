"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to animate a number from 0 to target value
 * Respects prefers-reduced-motion
 *
 * @param {number} target - The target number to count to
 * @param {number} duration - Animation duration in milliseconds (default: 1500)
 * @param {boolean} isVisible - Whether the element is visible (triggers animation)
 * @returns {number} - Current animated value
 */
export function useAnimatedCounter(target, duration = 1500, isVisible = false) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If reduced motion is preferred, set to target immediately
    if (prefersReducedMotion) {
      setCount(target);
      setHasAnimated(true);
      return;
    }

    // Only animate once when visible
    if (!isVisible || hasAnimated) {
      return;
    }

    let startTime = null;
    const startValue = 0;
    const endValue = target;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (easeOutCubic)
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
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
