
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#donate", label: "Donate" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 lg:h-24 items-center justify-between px-4 md:px-6 lg:px-8">
        <a href="/" className="flex-shrink-0 relative z-10">
          <Image
            src="/logo-light.png"
            alt="Seed & Spoon"
            width={320}
            height={96}
            className={`h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-300 ${
              scrolled ? "brightness-0 dark:brightness-100" : ""
            }`}
            priority
          />
        </a>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ href, label }) => (
            
              key={href}
              href={href}
              className={`text-base lg:text-lg font-semibold transition-colors duration-200 ${
                scrolled
                  ? "text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400"
                  : "text-white hover:text-yellow-400"
              }`}
            >
              {label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        <div className="md:hidden flex items-center gap-3 relative z-10">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className={`p-2 transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
              scrolled
                ? "text-green-600 hover:text-yellow-600"
                : "text-green-400 hover:text-yellow-400"
            }`}
          >
            {mobileOpen ? (
              <HiOutlineX size={28} />
            ) : (
              <HiOutlineMenu size={28} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-full bg-white/98 dark:bg-gray-900/98 backdrop-blur-md shadow-xl border-t border-gray-200 dark:border-gray-700">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors text-center py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
