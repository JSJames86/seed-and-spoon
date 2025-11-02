"use client";
import { useState } from "react";
import Image from "next/image";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#donate", label: "Donate" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "transparent",
        background: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none"
      }}
    >
      <div 
        className="container mx-auto flex h-16 md:h-20 lg:h-24 items-center justify-between px-4 md:px-6"
        style={{ backgroundColor: "transparent" }}
      >
        <a href="/" className="flex-shrink-0">
          <Image
            src="/logo-light.png"
            alt="Seed & Spoon"
            width={320}
            height={96}
            className="h-12 md:h-16 lg:h-20 w-auto object-contain"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.8))" }}
            priority
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            
              key={href}
              href={href}
              className="text-lg font-semibold text-white hover:text-yellow-400 transition-colors duration-200"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
            >
              {label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="p-2 text-green-400 hover:text-yellow-400 transition-colors"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}
          >
            {mobileOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map(({ href, label }) => (
              
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-green-600 transition-colors text-center py-2"
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