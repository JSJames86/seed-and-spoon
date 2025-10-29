// components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/assets/logo/seed-and-spoon-logo-full-compact.png"
            alt="Seed & Spoon NJ"
            className="h-24 mx-auto"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-4 text-green-600">About Us</h3>
            <p className="text-sm leading-relaxed">
              Seed & Spoon NJ is a mutual aid food program serving families and children across New Jersey with meals, food boxes, and community pantries.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4 text-green-600">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
              <Link href="/causes" className="hover:text-green-600 transition-colors">Our Causes</Link>
              <Link href="/volunteer" className="hover:text-green-600 transition-colors">Volunteer</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-green-600">Get Involved</h3>
            <p className="text-sm mb-2">
              Email: <a href="mailto:contact@seedandspoonnj.org" className="hover:text-green-600 transition-colors">contact@seedandspoonnj.org</a>
            </p>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end gap-4 mt-4">
              <a href="https://www.facebook.com/profile.php?id=61582824954208" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com/seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="X (Twitter)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.threads.net/@seedandspoon_nj" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="Threads">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 1.623-.02 3.094-.412 4.37-1.165.854-.5 1.577-1.132 2.149-1.878a9.764 9.764 0 0 0 1.003-1.852l1.958.515a11.55 11.55 0 0 1-1.207 2.222c-.684.922-1.565 1.718-2.617 2.365-1.578.974-3.413 1.467-5.453 1.467z"/><path d="M17.818 10.388c-.134-1.174-.47-2.115-1-2.8-.53-.685-1.229-1.215-2.08-1.578-.851-.363-1.852-.545-2.978-.545-1.034 0-1.964.182-2.768.545a5.186 5.186 0 0 0-1.955 1.578c-.53.685-.866 1.626-1 2.8-.134 1.174-.2 2.434-.2 3.759 0 1.325.066 2.585.2 3.759.134 1.174.47 2.115 1 2.8.53.685 1.23 1.215 2.08 1.578.851.363 1.852.545 2.978.545 1.034 0 1.964-.182 2.768-.545a5.186 5.186 0 0 0 1.955-1.578c.53-.685.866-1.626 1-2.8.134-1.174.2-2.434.2-3.759 0-1.325-.066-2.585-.2-3.759zm-5.818 8.862c-2.647 0-4.3-1.39-4.3-4.103 0-2.713 1.653-4.103 4.3-4.103s4.3 1.39 4.3 4.103c0 2.713-1.653 4.103-4.3 4.103z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@seedandspoonnj" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors" aria-label="TikTok">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Seed & Spoon NJ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
