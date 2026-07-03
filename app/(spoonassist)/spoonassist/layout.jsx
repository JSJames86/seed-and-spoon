import BottomTabNav from '@/components/spoonassist/BottomTabNav';
import AppHeader from '@/components/spoonassist/AppHeader';
import Footer from '@/components/Footer';
import { PlanProvider } from '@/components/spoonassist/PlanProvider';
import { ThemeProvider } from '@/components/spoonassist/ThemeProvider';
import { SavedRecipesProvider } from '@/components/spoonassist/SavedRecipesProvider';
import './spoonassist-v2.css';

export const metadata = {
  title: {
    default: 'SpoonAssist',
    template: '%s | SpoonAssist',
  },
  description: 'Plan your week, get one smart shopping list, and compare grocery prices before you buy.',
  manifest: '/spoonassist/manifest.webmanifest',
  icons: {
    icon: '/spoonassist/icon.png',
    apple: '/spoonassist/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpoonAssist',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EFF2DC',
};

export default function SpoonAssistV2Layout({ children }) {
  return (
    <PlanProvider>
      <ThemeProvider>
        <SavedRecipesProvider>
          <AppHeader />

          <div className="mx-auto max-w-[1100px] px-4 pb-32 pt-6 lg:px-6 lg:pb-16 lg:pt-8">
            {children}
          </div>

          {/* Mobile bottom tab bar */}
          <BottomTabNav variant="mobile" />

          {/* Full site footer so users always have full navigation back to
              the org, not just a single "A Seed & Spoon service" line. Extra
              bottom padding on mobile keeps its content clear of the fixed
              tab bar. */}
          <div className="pb-24 lg:pb-0">
            <Footer />
          </div>
        </SavedRecipesProvider>
      </ThemeProvider>
    </PlanProvider>
  );
}
