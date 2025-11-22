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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {children}
    </div>
  );
}
