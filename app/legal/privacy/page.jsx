export const metadata = {
  title: "Privacy Policy | Seed & Spoon NJ - Protecting Your Information",
  description:
    "Learn how Seed & Spoon NJ protects your privacy, handles personal information, and ensures confidentiality for clients, donors, and volunteers.",
  openGraph: {
    title: "Privacy Policy | Seed & Spoon NJ",
    description:
      "Our commitment to protecting your personal information and privacy. Read our privacy policy for clients, donors, and volunteers.",
    url: "https://seedandspoon.org/legal/privacy",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Seed & Spoon NJ",
    description:
      "Learn how we protect your privacy and personal information at Seed & Spoon NJ.",
    images: ["/og-default.jpg"],
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Privacy Policy
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Seed & Spoon NJ ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your personal information when you interact with our website, programs, and services.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            1. Information We Collect
          </h2>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Information You Provide to Us
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We collect information you voluntarily provide when you:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Apply for food assistance or other services</li>
            <li>Sign up to volunteer</li>
            <li>Make a donation</li>
            <li>Subscribe to our newsletter or updates</li>
            <li>Contact us via email, phone, or forms</li>
            <li>Participate in surveys or feedback requests</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            This may include your name, email address, phone number, mailing address, household size, dietary restrictions, payment information, and any other details you choose to share.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Information Collected Automatically
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            When you visit our website, we may automatically collect certain technical information, such as your IP address, browser type, device type, pages visited, time spent on pages, and referring URLs. This is collected through cookies, web beacons, and similar technologies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Provide food assistance, meals, and other services</li>
            <li>Process donations and send receipts</li>
            <li>Coordinate volunteer activities and schedules</li>
            <li>Communicate with you about programs, updates, and opportunities</li>
            <li>Improve our website, programs, and services</li>
            <li>Comply with legal obligations and maintain records</li>
            <li>Protect against fraud and ensure security</li>
            <li>Analyze usage patterns and measure program impact</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            3. Legal Bases for Processing
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We process your personal information based on:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Consent:</strong> When you voluntarily provide information or opt in to communications</li>
            <li><strong>Legitimate interests:</strong> To operate our nonprofit mission, improve services, and ensure safety</li>
            <li><strong>Legal obligations:</strong> To comply with tax, accounting, and nonprofit regulations</li>
            <li><strong>Contractual necessity:</strong> To fulfill services you've requested (e.g., processing donations)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We do not sell, rent, or trade your personal information. We may share information with:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Service providers:</strong> Payment processors (Stripe), email platforms, analytics tools, and form management services that help us operate</li>
            <li><strong>Partner organizations:</strong> When necessary to coordinate food distribution or services (with your consent or as required for program delivery)</li>
            <li><strong>Legal authorities:</strong> If required by law, court order, or to protect rights and safety</li>
            <li><strong>Volunteers and staff:</strong> Only the minimum information needed to fulfill their responsibilities</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            All third parties are required to protect your information and use it only for specified purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            5. Data Retention
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations (such as tax records), resolve disputes, and enforce our agreements. Specific retention periods vary by data type:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Donation records: At least 7 years for tax compliance</li>
            <li>Client assistance records: Duration of service plus reasonable period for follow-up</li>
            <li>Volunteer records: Duration of service plus 3 years</li>
            <li>Website analytics: Typically 24-36 months</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            6. Security Measures
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We implement reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, or alteration. This includes secure data storage, encrypted payment processing, access controls, and regular security reviews.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            7. Children's Privacy
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our website and services are not directed to children under 13. We do not knowingly collect personal information from children under 13 without parental consent. If we learn we have collected such information, we will delete it promptly.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            When minors participate in our programs (such as youth workshops), we collect information through a parent or guardian.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            8. Your Rights and Choices
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Ask us to update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your information (subject to legal retention requirements)</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time using the link in our messages</li>
            <li><strong>Restrict processing:</strong> Ask us to limit how we use your information in certain circumstances</li>
            <li><strong>Data portability:</strong> Request your information in a structured, commonly used format</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To exercise these rights, contact us at <strong>seedandspoonnj@gmail.com</strong>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            9. Third-Party Services
          </h2>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Payment Processing (Stripe)
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We use Stripe to process donations. When you make a payment, your payment information is transmitted directly to Stripe and is subject to Stripe's Privacy Policy. We do not store full credit card numbers on our servers.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Email Communications
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may use email service providers to send newsletters, updates, and receipts. These providers are bound by confidentiality agreements and only process data on our behalf.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Analytics Tools
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may use analytics services to understand how visitors use our website. These tools may use cookies and collect anonymized or aggregated data. You can opt out of analytics tracking through your browser settings or third-party opt-out tools.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Form and Survey Tools
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may use third-party form and survey platforms to collect feedback, applications, and registrations. Information submitted through these forms is subject to both our policy and the provider's privacy practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            10. Updates to This Policy
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or services. The "Last updated" date at the top indicates when the policy was last revised. We encourage you to review this page periodically.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If we make material changes, we will provide notice through our website or email when appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            11. Contact Us
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ</strong><br />
            Email: <strong>seedandspoonnj@gmail.com</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We take privacy seriously and will respond to your inquiry as promptly as possible.
          </p>
        </section>
      </div>
    </div>
  );
}
