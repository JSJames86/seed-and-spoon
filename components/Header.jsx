// components/header.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerRef = useRef(null);
  const menuRef = useRef(null);

  const logoDefault = "/assets/logo/seed-and-spoon-logo-full-compact.png";
  const logoScrolled = "/assets/logo/seed-and-spoon-logo-full.png";

  useEffect(() => {
    const preloadImages = [logoDefault, logoScrolled];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setIsScrolled(true);
      document.body.classList.remove("has-hero-at-top");
      return;
    }

    document.body.classList.add("has-hero-at-top");
    setIsScrolled(false);

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
        className={`fixed top-0 left-0 right-0 h-16 md:h-20 z-[1000] transition-all duration-300 ${
          isScrolled ? "bg-green-800 shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex-shrink-0">
            <img
              src={isScrolled ? logoScrolled : logoDefault}
              alt="Seed & Spoon NJ"
              className={`
                h-12 sm:h-14 md:h-16 lg:h-20 
                w-auto object-contain 
                transition-all duration-300 
                hover:scale-105
                min-w-40
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a href="https://facebook.com/seedandspoon_nj" target="_blank" rel="noopener" className="text-white hover:text-yellow-400" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​