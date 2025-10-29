// app/layout.jsx
import '../globals.css'; // global styles
import Footer from '../components/Footer'; // go up one level to root

export const metadata = {
  title: 'Seed & Spoon',
  description: 'Meal prep, grocery boxes, and community meals',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <header>
          {/* Add your navigation or header component here */}
        </header>

        <main>
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}