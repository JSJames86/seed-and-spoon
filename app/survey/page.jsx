export const metadata = {
  title: '5 Loaves Pilot Survey | Seed & Spoon',
  description: 'Participant survey for the 5 Loaves Summer Pilot Program. Share your experience to help us measure impact and keep the program running.',
  robots: { index: false, follow: false },
};

import SurveyPage from '@/components/survey/SurveyPage';

export default function SurveyRoute() {
  return <SurveyPage />;
}
