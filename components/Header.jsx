"use client";
// components/Header.jsx
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Optional: add slight shadow when scrolling
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrollY > 20 ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 bg-transparent">
        {/* Logo */}
        <Link href="/">
          <img
            src="/assets/logo/seed-and-spoon-logo-full-compact.png"
            alt="Seed & Spoon NJ"
            className="h-24 md:h-28 object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#about" className="text-green-500 font-semibold hover:text-yellow-400 transition-colors">
            About
          </Link>
          <Link href="#programs" className="text-green-500 font-semibold hover:text-yellow-400 transition-colors">
            Programs
          </Link>
          <Link href="#donate" className="text-green-500 font-semibold hover:text-yellow-400 transition-colors">
            Donate
          </Link>
          <Link href="/volunteer" className="text-green-500 font-semibold hover:text-yellow-400 transition-colors">
            Volunteer
          </Link>

          {/* Social Icons */}
          <div className="flex gap-3 ml-4">
            <a href="https://www.instagram.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-yellow-400 transition-colors" aria-label="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="..."/></svg>
            </a>
            <a href="https://www.facebook.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-yellow-400 transition-colors" aria-label="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="..."/></svg>
            </a>
            <a href="https://x.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-yellow-400 transition-colors" aria-label="X (Twitter)">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="..."/></svg>
            </a>
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`block w-6 h-0.5 transition-all ${isOpen ? "rotate-45 translate-y-1 bg-yellow-400" : "bg-green-500"}`}></span>
          <span className={`block w-6 h-0.5 transition-all ${isOpen ? "opacity-0" : "bg-green-500"}`}></span>
          <span className={`block w-6 h-0.5 transition-all ${isOpen ? "-rotate-45 -translate-y-1 bg-yellow-400" : "bg-green-500"}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-transparent flex flex-col gap-4 px-6 py-4 text-green-500">
          <Link href="#about" className="hover:text-yellow-400 transition-colors">About</Link>
          <Link href="#programs" className="hover:text-yellow-400 transition-colors">Programs</Link>
          <Link href="#donate" className="hover:text-yellow-400 transition-colors">Donate</Link>
          <Link href="/volunteer" className="hover:text-yellow-400 transition-colors">Volunteer</Link>

          {/* Optional mobile social links */}
          <div className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">IG</a>
            <a href="https://www.facebook.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">FB</a>
            <a href="https://x.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">X</a>
          </div>
        </div>
      )}
    </header>
  );
}