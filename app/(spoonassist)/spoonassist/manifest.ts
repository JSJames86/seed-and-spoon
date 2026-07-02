import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpoonAssist — Household Food Coverage',
    short_name: 'SpoonAssist',
    description: 'Plan your week, get one smart shopping list, and compare grocery prices before you buy.',
    start_url: '/spoonassist',
    scope: '/spoonassist',
    display: 'standalone',
    background_color: '#EFF2DC',
    theme_color: '#EFF2DC',
    icons: [
      {
        src: '/spoonassist/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
