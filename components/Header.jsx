'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <img
          src={scrolled ? '/assets/logo/seed-and-spoon-logo-full-compact.png' : '/assets/logo/seed-and-spoon-logo-full.png'}
          alt="Seed & Spoon NJ"
          className={`transition-all duration-300 ${scrolled ? 'h-32' : 'h-40'}`}
        />
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-gray-700 hover:text-green-600 font-medium">About</a>
          <a href="#programs" className="text-gray-700 hover:text-green-600 font-medium">Programs</a>
          <a href="#volunteer" className="text-gray-700 hover:text-green-600 font-medium">Volunteer</a>
          <a href="#donate" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 font-semibold">Donate</a>
        </nav>
      </div>
    </header>
  );
}
