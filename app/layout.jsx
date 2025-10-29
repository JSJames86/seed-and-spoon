// app/layout.jsx
import './globals.css';
import Footer from './components/Footer';

export const metadata = {
  title: 'Seed & Spoon',
  description: 'Community Meals and Meal Prepped Food',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
        <Footer />
      </body>
    </html>
  );
}