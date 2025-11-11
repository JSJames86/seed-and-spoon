"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);

  // Logo assets
  const logoDefault = "/assets/logo/seed-and-spoon-logo-full-compact.png";
  const logoScrolled = "/assets/logo/seed-and-spoon-logo-full.png";

  // Preload logo assets to prevent flicker
  useEffect(() => {
    const preloadImages = [logoDefault, logoScrolled];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [logoDefault, logoScrolled]);

  // IntersectionObserver with hysteresis to prevent state thrashing
  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");

    // Fallback: if no sentinel (pages without hero), start in scrolled state
    if (!sentinel) {
      setIsScrolled(true);
      document.body.classList.remove("has-hero-at-top");
      return;
    }

    // Set initial state immediately to prevent FOUC
    document.body.classList.add("has-hero-at-top");
    setIsScrolled(false);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Simple intersection check - when sentinel leaves viewport, header is scrolled
          const isAtTop = entry.isIntersecting;

          setIsScrolled(!isAtTop);

          // Toggle body class for layout adjustments
          if (isAtTop) {
            document.body.classList.add("has-hero-at-top");
          } else {
            document.body.classList.remove("has-hero-at-top");
          }
        });
      },
      {
        // Root margin creates hysteresis - sentinel must be 16px past viewport edge to trigger
        rootMargin: "-16px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      document.body.classList.remove("has-hero-at-top");
    };
  }, []);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap inside mobile menu
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);

      // Focus first element when menu opens
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    // Return focus to hamburger button
    setTimeout(() => {
      hamburgerRef.current?.focus();
    }, 100);
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-14 md:h-16 lg:h-[72px] z-[1000] ${
          isScrolled ? "bg-green-800 shadow-md" : "bg-transparent"
        }`}
        style={{
          transition: 'background-color 200ms ease-in-out, box-shadow 200ms ease-in-out',
          willChange: 'background-color'
        }}
      >
        {/*
          Header heights: 56px mobile (≤640px), 64px tablet (641-1024px), 72px desktop (≥1025px)
          Fixed height prevents any reflow. Only background-color transitions.
        */}
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          {/* Logo - CSS-controlled size transition, no image swap */}
          <Link href="/" className="flex-shrink-0 group">
            <img
              src={logoScrolled}
              alt="Seed & Spoon NJ"
              className={`w-auto object-contain transition-all duration-200 group-hover:scale-105 ${
                isScrolled
                  ? 'h-10 sm:h-12 md:h-13 lg:h-14'
                  : 'h-12 sm:h-14 md:h-15 lg:h-16'
              }`}
              style={{ minWidth: '140px' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-white font-semibold hover:text-yellow-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/causes"
              className="text-white font-semibold hover:text-yellow-400 transition-colors"
            >
              Causes
            </Link>
            <Link
              href="/get-help"
              className="text-white font-semibold hover:text-yellow-400 transition-colors"
            >
              Get Help
            </Link>
            <Link
              href="/donate"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all shadow-lg hover:scale-105"
            >
              Donate
            </Link>
            <Link
              href="/volunteer"
              className="text-white font-semibold hover:text-yellow-400 transition-colors"
            >
              Volunteer
            </Link>

            {/* Social Icons */}
            <div className="flex gap-3 ml-4">
              <a
                href="https://www.instagram.com/seedandspoon_nj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/seedandspoon_nj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://x.com/seedandspoon_nj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </nav>

          {/* Mobile Hamburger - 44x44px tap target for accessibility */}
          <button
            ref={hamburgerRef}
            className="md:hidden flex flex-col gap-1 z-50 p-3 -mr-3"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            style={{ minWidth: "44px", minHeight: "44px" }}
          >
            <span
              className={`block w-6 h-0.5 transition-all duration-200 ${
                isOpen
                  ? "rotate-45 translate-y-1.5 bg-yellow-400"
                  : isScrolled
                  ? "bg-white"
                  : "bg-white"
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 transition-all duration-200 ${
                isOpen ? "opacity-0" : isScrolled ? "bg-white" : "bg-white"
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 transition-all duration-200 ${
                isOpen
                  ? "-rotate-45 -translate-y-1.5 bg-yellow-400"
                  : isScrolled
                  ? "bg-white"
                  : "bg-white"
              }`}
            ></span>
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden bg-gradient-to-b from-green-800 to-green-900 flex flex-col"
            style={{ height: "100dvh" }}
          >
            {/* Content Container */}
            <div className="flex flex-col h-full pt-32 pb-20 px-8">
              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col justify-center gap-8">
                <Link
                  href="/about"
                  onClick={handleLinkClick}
                  className="text-white text-3xl font-bold hover:text-yellow-400 transition-colors text-center"
                >
                  About
                </Link>
                <Link
                  href="/causes"
                  onClick={handleLinkClick}
                  className="text-white text-3xl font-bold hover:text-yellow-400 transition-colors text-center"
                >
                  Causes
                </Link>
                <Link
                  href="/get-help"
                  onClick={handleLinkClick}
                  className="text-white text-3xl font-bold hover:text-yellow-400 transition-colors text-center"
                >
                  Get Help
                </Link>
                <Link
                  href="/volunteer"
                  onClick={handleLinkClick}
                  className="text-white text-3xl font-bold hover:text-yellow-400 transition-colors text-center"
                >
                  Volunteer
                </Link>
              </nav>

              {/* Donate CTA - Fixed at Bottom */}
              <div className="mt-auto">
                <Link
                  href="/donate"
                  onClick={handleLinkClick}
                  className="block w-full bg-orange-500 text-white text-center px-8 py-5 rounded-xl font-bold text-xl hover:bg-orange-600 transition-colors shadow-2xl"
                >
                  Donate Now
                </Link>

                {/* Social Links */}
                <div className="flex justify-center gap-6 mt-8">
                  <a
                    href="https://www.instagram.com/seedandspoon_nj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                    aria-label="Instagram"
                    onClick={handleLinkClick}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/seedandspoon_nj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                    aria-label="Facebook"
                    onClick={handleLinkClick}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/seedandspoon_nj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                    aria-label="X (Twitter)"
                    onClick={handleLinkClick}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Close Button Text */}
              <button
                onClick={closeMenu}
                className="mt-6 text-gray-300 text-sm hover:text-white transition-colors text-center"
              >
                Press ESC or tap outside to close
              </button>
            </div>

            {/* Backdrop - Clicking closes menu */}
            <div
              className="absolute inset-0 -z-10"
              onClick={closeMenu}
              aria-label="Close menu"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
