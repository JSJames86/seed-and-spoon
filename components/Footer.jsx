// components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-leaf-mid text-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/assets/logo/seed-and-spoon-logo-full-compact.png"
            alt="Seed & Spoon NJ"
            className="h-32 mx-auto"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 text-cream">About Us</h3>
            <p className="text-sm leading-relaxed">
              Seed & Spoon NJ is a mutual aid food program serving families and children across New Jersey with meals, food boxes, and community pantries.
            </p>
            <p className="text-sm mt-2">Phone: <a href="tel:+1234567890" className="hover:text-leaf-light transition-colors">(123) 456-7890</a></p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4 text-cream">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-leaf-light transition-colors">Home</Link>
              <Link href="/causes" className="hover:text-leaf-light transition-colors">Our Causes</Link>
              <Link href="/volunteer" className="hover:text-leaf-light transition-colors">Volunteer</Link>
              <Link href="/privacy-policy" className="hover:text-leaf-light transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="hover:text-leaf-light transition-colors">Terms & Conditions</Link>
              <Link href="/food-waiver" className="hover:text-leaf-light transition-colors">Food Waiver</Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-cream">Get Involved</h3>
            <p className="text-sm mb-2">
              Email: <a href="mailto:contact@seedandspoonnj.org" className="hover:text-leaf-light transition-colors">contact@seedandspoonnj.org</a>
            </p>
            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end gap-4 mt-4">
              {/* Example: Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61582824954208" target="_blank" rel="noopener noreferrer" className="text-cream hover:text-leaf-light transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Repeat other icons: Instagram, X/Twitter, Threads, TikTok */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-leaf-light pt-6 text-center text-sm text-cream">
          <p>&copy; {new Date().getFullYear()} Seed & Spoon NJ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}