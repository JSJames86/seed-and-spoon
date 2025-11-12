// components/Header.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);

  const logoDefault = "/assets/new-logos/logo-compact.png";
  const logoScrolled = "/assets/new-logos/logo-full.png";

  // Force transparency on load and ensure sentinel exists
  useEffect(() => {
    // Wait for DOM to be ready
    const checkSentinel = () => {
      const sentinel = document.getElementById("hero-sentinel");
      if (sentinel) {
        document.body.classList.add("has-hero-at-top");
        setIsScrolled(false);
      } else {
        // No hero on this page, show solid header
        setIsScrolled(true);
        document.body.classList.remove("has-hero-at-top");
      }
    };

    // Check immediately and after a short delay to ensure DOM is ready
    checkSentinel();
    const timer = setTimeout(checkSentinel, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const preloadImages = [logoDefault, logoScrolled];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isAtTop = entry.isIntersecting;
          setIsScrolled(!isAtTop);
          if (isAtTop) {
            document.body.classList.add("has-hero-at-top");
          } else {
            document.body.classList.remove("has-hero-at-top");
          }
        });
      },
      { rootMargin: "-16px 0px 0px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) closeMenu();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const focusable = menuRef.current.querySelectorAll('a[href], button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const handleTab = (e) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      };
      document.addEventListener("keydown", handleTab);
      first?.focus();
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => hamburgerRef.current?.focus(), 100);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-14 md:h-16 lg:h-[72px] z-[1000] transition-all duration-300 ${
          isScrolled
            ? "bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/30"
            : "bg-white/5 backdrop-blur-lg"
        }`}
        style={{
          backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)',
          WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'blur(16px) saturate(150%)'
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex-shrink-0 bg-transparent">
            <img
              src={isScrolled ? logoScrolled : logoDefault}
              alt="Seed & Spoon NJ"
              style={{
                background: 'transparent',
                mixBlendMode: 'normal'
              }}
              className={`
                h-12 sm:h-14 md:h-16 lg:h-20
                w-auto object-contain
                transition-all duration-300
                hover:scale-105
                min-w-40
                bg-transparent
                drop-shadow-lg
                ${isScrolled ? "scale-95" : "scale-100"}
              `}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-white font-semibold hover:text-yellow-400 transition">About</Link>
            <Link href="/causes" className="text-white font-semibold hover:text-yellow-400 transition">Causes</Link>
            <Link href="/get-help" className="text-white font-semibold hover:text-yellow-400 transition">Get Help</Link>
            <Link href="/donate" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg">Donate</Link>
            <Link href="/volunteer" className="text-white font-semibold hover:text-yellow-400 transition">Volunteer</Link>
            <div className="flex gap-3 ml-4">
              <a href="https://instagram.com/seedandspoon_nj" target="_blank" rel="noopener" className="text-white hover:text-yellow-400" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://facebook.com/seedandspoon_nj" target="_blank" rel="noopener" className="text-white hover:text-yellow-400" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://x.com/seedandspoon_nj" target="_blank" rel="noopener" className="text-white hover:text-yellow-400" aria-label="X">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </nav>

          {/* Brand-Styled Hamburger Menu - Fixed to prevent icon overlap */}
          <button
            ref={hamburgerRef}
            className="md:hidden p-2 relative w-12 h-12 flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <div className="relative w-7 h-7">
              {/* Top bar */}
              <span
                className={`absolute left-0 block w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'top-3 rotate-45'
                    : 'top-0 rotate-0'
                }`}
              ></span>
              {/* Middle bar */}
              <span
                className={`absolute left-0 top-3 block w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 ease-in-out ${
                  isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              ></span>
              {/* Bottom bar */}
              <span
                className={`absolute left-0 block w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'top-3 -rotate-45'
                    : 'top-6 rotate-0'
                }`}
              ></span>
            </div>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-green-800 to-green-900 flex flex-col pt-32 px-8"
          >
            <nav className="flex-1 flex flex-col justify-center gap-8 text-center">
              <Link href="/about" onClick={closeMenu} className="text-white text-3xl font-bold hover:text-yellow-400">About</Link>
              <Link href="/causes" onClick={closeMenu} className="text-white text-3xl font-bold hover:text-yellow-400">Causes</Link>
              <Link href="/get-help" onClick={closeMenu} className="text-white text-3xl font-bold hover:text-yellow-400">Get Help</Link>
              <Link href="/volunteer" onClick={closeMenu} className="text-white text-3xl font-bold hover:text-yellow-400">Volunteer</Link>
            </nav>
            <div className="mt-auto">
              <Link href="/donate" onClick={closeMenu} className="block w-full bg-orange-500 text-white text-center py-5 rounded-xl font-bold text-xl hover:bg-orange-600">Donate Now</Link>
              <div className="flex justify-center gap-6 mt-8">
                <a href="https://instagram.com/seedandspoon_nj" onClick={closeMenu} className="text-white hover:text-yellow-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://facebook.com/seedandspoon_nj" onClick={closeMenu} className="text-white hover:text-yellow-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://x.com/seedandspoon_nj" onClick={closeMenu} className="text-white hover:text-yellow-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
            <button onClick={closeMenu} className="mt-6 text-gray-300 text-sm hover:text-white">Press ESC to close</button>
            <div className="absolute inset-0 -z-10" onClick={closeMenu} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
