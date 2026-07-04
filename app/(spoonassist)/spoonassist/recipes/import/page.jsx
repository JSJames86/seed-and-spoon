'use client';

import { useRouter } from 'next/navigation';
import ImportRecipe from '@/components/spoonassist/ImportRecipe';

export default function ImportRecipePage() {
  const router = useRouter();

  return <ImportRecipe onBrowseLibrary={() => router.push('/spoonassist/recipes')} />;
}
