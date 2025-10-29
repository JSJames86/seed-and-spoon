// app/layout.jsx
import './globals.css';                 // globals.css is in the same folder
import Header from '../components/Header'; // go up one level to root, then into components
import Footer from '../components/Footer'; // go up one level to root, then into components

export const metadata = {
  title: 'Seed & Spoon',
  description: 'Meal-prepped food, grocery boxes, and community meals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}