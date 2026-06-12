import { Sora, Inter } from 'next/font/google';

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const interFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-spoon-inter',
  display: 'swap',
});

export const metadata = {
  title: 'SpoonAssist | Seed & Spoon',
  description: 'Compare local grocery prices for any recipe and create shopping lists.',
  icons: {
    icon: '/spoonassist/favicon.ico',
    apple: '/spoonassist/icon.png'
  }
};

export default function SpoonAssistLayout({ children }) {
  return (
    <div className={`${sora.variable} ${interFont.variable} spoonassist min-h-screen overflow-x-hidden`}>
      <div className="spoon-blob spoon-blob-1" aria-hidden="true" />
      <div className="spoon-blob spoon-blob-2" aria-hidden="true" />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
