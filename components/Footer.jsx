// components/Footer.jsx
import Image from 'next/image';
import Link from 'next/link';
import logo from '../assets/logo-transparent.png'; // adjust path if needed

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#f5f5f5',
      padding: '2rem',
      textAlign: 'center'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '1rem' }}>
        <Image src={logo} alt="Seed & Spoon Logo" width={150} height={50} />
      </div>

      {/* Contact Info */}
      <div style={{ marginBottom: '1rem' }}>
        <p>Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
        <p>Email: <a href="mailto:info@seedandspoon.org">info@seedandspoon.org</a></p>
      </div>

      {/* Footer Links */}
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/privacy-policy" style={{ margin: '0 1rem' }}>Privacy Policy</Link>
        <Link href="/terms-of-service" style={{ margin: '0 1rem' }}>Terms of Service</Link>
        <Link href="/food-safety-waiver" style={{ margin: '0 1rem' }}>Food Safety Waiver</Link>
      </div>

      {/* Social Media Links */}
      <div style={{ marginBottom: '1rem' }}>
        <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" style={{ margin: '0 0.5rem' }}>Facebook</a>
        <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" style={{ margin: '0 0.5rem' }}>Instagram</a>
        <a href="https://tiktok.com/@yourpage" target="_blank" rel="noopener noreferrer" style={{ margin: '0 0.5rem' }}>TikTok</a>
      </div>

      {/* Copyright */}
      <p style={{ fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Seed & Spoon. All rights reserved.
      </p>
    </footer>
  );
}