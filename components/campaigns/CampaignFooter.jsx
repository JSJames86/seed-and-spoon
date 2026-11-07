import { ORG_LEGAL_NAME, ORG_EIN } from '@/lib/org';

export default function CampaignFooter() {
  return (
    <footer className="border-t border-[#02538A]/10 py-8 px-4">
      <p className="max-w-5xl mx-auto text-sm text-gray-600 text-center">
        {ORG_LEGAL_NAME} is a 501(c)(3) public charity. EIN {ORG_EIN}. Gifts are tax-deductible to the extent allowed by law.
      </p>
    </footer>
  );
}
