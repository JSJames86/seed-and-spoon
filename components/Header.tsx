"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <a className={styles.brand} href="/" aria-label="Seed & Spoon Home">
          <Image
            src="/assets/logo/seed-and-spoon-logo-full.png"
            alt="Seed & Spoon"
            className={`${styles.logo} ${styles.logoDefault}`}
            height={48}
            width={160}
            priority
          />
          <Image
            src="/assets/logo/seed-and-spoon-logo-full-compact.png"
            alt="Seed & Spoon Compact"
            className={`${styles.logo} ${styles.logoScrolled}`}
            height={40}
            width={140}
            aria-hidden="true"
          />
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <button
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={styles.menuIcon} aria-hidden="true">☰</span>
            <span className="sr-only">Menu</span>
          </button>

          <ul
            id="primary-menu"
            className={`${styles.menu} ${menuOpen ? styles.menuOpen : ""}`}
          >
            <li><a href="/programs">Programs</a></li>
            <li><a href="/community">Community</a></li>
            <li><a href="/about">About</a></li>
            <li>
              <a href="/donate" className={styles.btnDonate}>Donate</a>
            </li>
          </ul>
        </nav>
      </header>

      <div className={styles.headerSpacer} aria-hidden="true" />
    </>
  );
}
