import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Seed & Spoon NJ | Harvesting Potential and Serving Dignity',
  description: 'We turn local surplus produce into freshly prepared, nutritious meals for New Jersey families facing food insecurity.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
