"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
        scrolled ? "bg-white/100 shadow-md h-20" : "bg-transparent h-28"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full">
        {/* Logo */}
        <Image
          src={scrolled ? "/logo-dark.png" : "/logo-light.png"}
          alt="Seed & Spoon"
          width={scrolled ? 200 : 320} // very big, scales slightly on scroll
          height={scrolled ? 65 : 100}
          className="transition-all duration-300"
          priority
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 font-semibold text-lg">
          <a href="#about" className="hover:text-green-600 transition-colors">About</a>
          <a href="#programs" className="hover:text-green-600 transition-colors">Programs</a>
          <a href="#donate" className="hover:text-yellow-500 transition-colors">Donate</a>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobile} className="text-green-600 hover:text-yellow-500 text-3xl focus:outline-none">
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/90 backdrop-blur-md shadow-lg">
          <nav className="flex flex-col items-center space-y-4 py-6">
            <a href="#about" className="text-gray-800 font-semibold text-lg">About</a>
            <a href="#programs" className="text-gray-800 font-semibold text-lg">Programs</a>
            <a href="#donate" className="text-gray-800 font-semibold text-lg">Donate</a>
          </nav>
        </div>
      )}
    </header>
  );
}