export const metadata = {
  title: '5 Loaves Intake & Enrollment | Seed & Spoon',
  description: 'Family intake and enrollment for the 5 Loaves Summer Pilot. Captures allergen, dietary, and delivery information required before a household receives kits.',
  robots: { index: false, follow: false },
};

import IntakeEnrollmentPage from '@/components/enrollment/IntakeEnrollmentPage';

export default function EnrollmentRoute() {
  return <IntakeEnrollmentPage />;
}
