import BlogClient from './BlogClient';

export const metadata = {
  title: 'Blog – Seed & Spoon NJ',
  description:
    'Updates, stories, and news from Seed & Spoon NJ. Follow our work feeding at-risk youth in Newark and across New Jersey.',
  openGraph: {
    title: 'Blog – Seed & Spoon NJ',
    description: 'Stories and updates from Seed & Spoon NJ.',
    url: 'https://seedandspoon.org/blog',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}
