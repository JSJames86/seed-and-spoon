'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <img
            src={scrolled ? '/assets/logo/seed-and-spoon-logo-full-compact.png' : '/assets/logo/seed-and-spoon-logo-full.png'}
            alt="Seed & Spoon NJ"
            className={`transition-all duration-300 ${scrolled ? 'h-12 md:h-32' : 'h-16 md:h-40'}`}
          />
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-gray-700 hover:text-green-600 font-medium">About</a>
            <a href="#programs" className="text-gray-700 hover:text-green-600 font-medium">Programs</a>
            <a href="#volunteer" className="text-gray-700 hover:text-green-600 font-medium">Volunteer</a>
            <a href="#donate" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 font-semibold">Donate</a>
          </nav>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden" style={{top: scrolled ? '48px' : '64px'}}>
          <nav className="flex flex-col items-center gap-6 py-8">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-xl font-medium">About</a>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-xl font-medium">Programs</a>
            <a href="#volunteer" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-xl font-medium">Volunteer</a>
            <a href="#donate" onClick={() => setMobileMenuOpen(false)} className="bg-green-600 text-white px-8 py-3 rounded-full text-xl font-semibold">Donate</a>
          </nav>
        </div>
      )}
    </>
  );
}
