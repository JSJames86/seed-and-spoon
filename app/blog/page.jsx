import BlogClient from './BlogClient';

export const metadata = {
  title: 'Blog – Seed & Spoon',
  description:
    'Updates, stories, and news from Seed & Spoon. Follow our work feeding at-risk youth in Newark and across New Jersey.',
  openGraph: {
    title: 'Blog – Seed & Spoon',
    description: 'Stories and updates from Seed & Spoon.',
    url: 'https://seedandspoon.org/blog',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
