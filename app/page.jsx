"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        scrolled ? "bg-white shadow-md h-16" : "bg-transparent h-28"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full">

        {/* Logo */}
        <div
          className={`flex items-center transition-all duration-300 ${
            scrolled ? "-translate-y-1" : "translate-y-0"
          }`}
        >
          <Image
            src={scrolled ? "/logo-dark.png" : "/logo-light.png"}
            alt="Seed & Spoon"
            width={scrolled ? 180 : 280}
            height={scrolled ? 60 : 90}
            className="transition-all duration-300"
            priority
          />
        </div>

        {/* Desktop Navigation */}
        <nav
          className={`hidden md:flex space-x-6 font-medium transition-colors duration-300 ${
            scrolled ? "text-gray-800" : "text-white"
          }`}
        >
          <a href="#about" className="hover:text-green-600 transition-colors">
            About
          </a>
          <a href="#programs" className="hover:text-green-600 transition-colors">
            Programs
          </a>
          <a href="#contact" className="hover:text-green-600 transition-colors">
            Contact
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none z-50"
            aria-label="Toggle Menu"
          >
            <svg
              className={`w-6 h-6 transition-colors duration-300 ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Mobile Menu */}
          <div
            className={`absolute top-full left-0 w-full bg-white shadow-lg transform transition-transform duration-300 origin-top ${
              menuOpen ? "scale-y-100" : "scale-y-0"
            } md:hidden`}
          >
            <a
              href="#about"
              className="block px-6 py-3 border-b border-gray-200 hover:bg-green-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#programs"
              className="block px-6 py-3 border-b border-gray-200 hover:bg-green-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Programs
            </a>
            <a
              href="#contact"
              className="block px-6 py-3 hover:bg-green-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}