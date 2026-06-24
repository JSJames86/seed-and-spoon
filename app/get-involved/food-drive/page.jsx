import FoodDriveClient from './FoodDriveClient';

export const metadata = {
  title: 'Host a Food Drive – Seed & Spoon',
  description:
    'Organize a food drive for Seed & Spoon and help feed at-risk youth ages 16–25 in Newark. Schools, businesses, faith communities, and neighbors all welcome.',
  openGraph: {
    title: 'Host a Food Drive – Seed & Spoon',
    description:
      "Bring your community together to fight youth hunger in Newark, NJ. Fill out our simple form and we'll help you every step of the way.",
    url: 'https://seedandspoon.org/get-involved/food-drive',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Host a Food Drive – Seed & Spoon',
    description:
      'Schools, businesses, faith groups, and neighbors: host a food drive to feed at-risk youth in Newark, NJ.',
  },
};

export default function FoodDrivePage() {
  return <FoodDriveClient />;
}
