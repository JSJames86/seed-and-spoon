export const metadata = {
  title: "Donor Privacy Policy | Seed & Spoon NJ - Protecting Your Contributions",
  description:
    "Seed & Spoon NJ values donor privacy. Learn how we protect your donation information, financial data, and personal details with transparency and care.",
  openGraph: {
    title: "Donor Privacy Policy | Seed & Spoon NJ",
    description:
      "Our commitment to protecting donor information. Learn how we handle contributions and financial data with security and respect.",
    url: "https://seedandspoon.org/legal/donor-privacy",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donor Privacy | Seed & Spoon NJ",
    description:
      "Learn how we protect donor information and handle contributions with transparency and security.",
    images: ["/og-default.jpg"],
  },
};

export default function DonorPrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Donor Privacy Policy
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Seed & Spoon NJ is deeply grateful for the generosity of our donors. We recognize that your support makes our mission possible, and we are committed to protecting your privacy and handling your information with the highest level of care and transparency. This Donor Privacy Policy explains how we collect, use, and safeguard donor information.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            1. What Donor Information We Collect
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            When you make a donation to Seed & Spoon NJ, we may collect the following information:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Personal information:</strong> Name, email address, phone number, and mailing address</li>
            <li><strong>Donation details:</strong> Donation amount, date, frequency (one-time or recurring), and designation (if specified)</li>
            <li><strong>Payment information:</strong> Credit card or bank account details processed securely through our payment processor (we do not store full payment credentials)</li>
            <li><strong>Communication preferences:</strong> Whether you wish to receive updates, newsletters, or acknowledgments</li>
            <li><strong>Employer information:</strong> If you participate in employer matching gift programs</li>
            <li><strong>Tribute or memorial information:</strong> If your donation is made in honor or memory of someone</li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Corporate and Organizational Donors
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            For businesses, foundations, and organizations, we may also collect:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Organization name and contact person</li>
            <li>Business address and tax identification number</li>
            <li>Grant or partnership terms and reporting requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            2. How We Use Donor Information
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Process your donation:</strong> Complete your transaction and issue a receipt for tax purposes</li>
            <li><strong>Send acknowledgments:</strong> Thank you for your contribution and confirm receipt</li>
            <li><strong>Provide tax documentation:</strong> Generate year-end donation summaries and IRS-compliant receipts</li>
            <li><strong>Share impact updates:</strong> Inform you about how your donation is being used and the difference it's making</li>
            <li><strong>Send communications:</strong> Share newsletters, program updates, volunteer opportunities, and event invitations (only if you opt in)</li>
            <li><strong>Ensure compliance:</strong> Maintain accurate financial records for tax and legal purposes</li>
            <li><strong>Improve donor experience:</strong> Analyze donation trends to better understand donor preferences and improve our fundraising efforts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            3. Public Recognition and Donor Lists
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We respect your privacy and give you control over how your donation is recognized:
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Options for Recognition
          </h3>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Public acknowledgment:</strong> Your name may appear in donor lists on our website, annual reports, newsletters, or event materials</li>
            <li><strong>Anonymous donation:</strong> You may request that your donation remain anonymous, and we will honor that request</li>
            <li><strong>Partial anonymity:</strong> You may choose to be recognized privately (internal records only) but not publicly</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You can update your recognition preferences at any time by contacting us at <strong>seedandspoonnj@gmail.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            4. We Do Not Sell or Trade Donor Information
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ will never sell, rent, trade, or share your personal information with third parties for their marketing purposes.</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Your donor information is confidential and will only be used to support our mission and communicate with you as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            5. Third-Party Payment Processors
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We use secure third-party payment platforms, such as Stripe, to process donations. When you make a donation, your payment information is transmitted directly to the payment processor and is subject to their privacy policy and security standards.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Seed & Spoon NJ does not store full credit card numbers or bank account details on our servers. We only retain transaction confirmation data and donation amounts for record-keeping purposes.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Payment processors are bound by industry-standard security protocols, including PCI-DSS compliance, to protect your financial information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            6. Opt-Out and Communication Preferences
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You have full control over the communications you receive from us:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Email updates:</strong> You can unsubscribe from our mailing list at any time by clicking the "unsubscribe" link in any email or contacting us directly</li>
            <li><strong>Phone calls:</strong> If you prefer not to receive phone calls, let us know and we will remove your number from our contact list</li>
            <li><strong>Postal mail:</strong> You can opt out of receiving physical mail by contacting us</li>
            <li><strong>Tax receipts:</strong> You will continue to receive donation receipts for tax purposes, even if you opt out of other communications</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To update your preferences, email us at <strong>seedandspoonnj@gmail.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            7. Data Retention
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We retain donor records in accordance with legal and regulatory requirements:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Donation records:</strong> Maintained for at least 7 years to comply with IRS and nonprofit accounting standards</li>
            <li><strong>Communication history:</strong> Stored as long as you remain an active supporter or until you request deletion</li>
            <li><strong>Inactive donor records:</strong> Periodically reviewed and archived or deleted in accordance with our data retention policies</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you request deletion of your information, we will remove it from active systems while retaining the minimum necessary for legal compliance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            8. Security Measures
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We take the security of your information seriously and implement reasonable safeguards, including:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Secure, encrypted connections (SSL/TLS) for all donation transactions</li>
            <li>Restricted access to donor information, limited to authorized staff and volunteers</li>
            <li>Regular security reviews and updates to our systems</li>
            <li>Secure storage of physical and digital records</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            While we strive to protect your information, no method of transmission or storage is 100% secure. We encourage you to use strong passwords and report any suspicious activity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            9. Access, Correction, and Deletion
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            As a donor, you have the right to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Request access:</strong> Ask for a copy of the personal and donation information we have on file</li>
            <li><strong>Request correction:</strong> Update or correct inaccurate information (such as your mailing address or email)</li>
            <li><strong>Request deletion:</strong> Ask us to remove your information from our active systems (subject to legal retention requirements)</li>
            <li><strong>Cancel recurring donations:</strong> Stop automatic monthly or recurring donations at any time</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To exercise any of these rights, contact us at <strong>seedandspoonnj@gmail.com</strong>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            10. Transparency and Accountability
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We believe in transparency with our donors. If you have questions about:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>How your donation is being used</li>
            <li>Our financial statements or annual reports</li>
            <li>Our nonprofit status and tax-exempt documentation</li>
            <li>How we protect your privacy</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Please don't hesitate to reach out. We are committed to building trust and maintaining open communication with our supporters.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            11. Updates to This Policy
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may update this Donor Privacy Policy from time to time to reflect changes in our practices, legal requirements, or services. The "Last updated" date at the top will indicate when the policy was last revised.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If we make significant changes, we will notify donors via email or through a notice on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            12. Contact Us
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Donor Privacy Policy, please contact us:
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ</strong><br />
            Email: <strong>seedandspoonnj@gmail.com</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Your trust and support are invaluable to us. Thank you for helping Seed & Spoon NJ fight hunger and build a more equitable food system.
          </p>
        </section>
      </div>
    </div>
  );
}
