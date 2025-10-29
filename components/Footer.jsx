// app/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-8 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        
        {/* Logo */}
        <div className="mb-4 md:mb-0">
          <Link href="/">
            <img
              src="/assets/logo-transparent.png"
              alt="Seed & Spoon Logo"
              className="h-12"
            />
          </Link>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-center">
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/food-safety-waiver" className="hover:underline">
            Food Safety Waiver
          </Link>
        </div>

        {/* Optional copyright */}
        <div className="mt-4 md:mt-0 text-sm text-gray-300 text-center md:text-right">
          &copy; {new Date().getFullYear()} Seed & Spoon NJ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}