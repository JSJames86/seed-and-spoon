"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[50] transition-all duration-300 ${
        scrolled ? "bg-white shadow-md h-16" : "bg-transparent h-28"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-full">
        <Image
          src={scrolled ? "/logo-dark.png" : "/logo-light.png"}
          alt="Seed & Spoon"
          width={scrolled ? 180 : 280}
          height={scrolled ? 60 : 90}
          className="transition-all duration-300"
          priority
        />

        <nav className={`hidden md:flex space-x-6 font-medium transition-colors duration-300 ${scrolled ? "text-gray-800" : "text-white"}`}>
          <a href="#about" className="hover:text-green-600">About</a>
          <a href="#programs" className="hover:text-green-600">Programs</a>
          <a href="#contact" className="hover:text-green-600">Contact</a>
        </nav>
      </div>
    </header>
  );
}