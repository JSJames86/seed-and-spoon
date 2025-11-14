export const metadata = {
  title: "Terms & Conditions | Seed & Spoon NJ - Service Guidelines",
  description:
    "Read the terms and conditions for using Seed & Spoon NJ's website, services, and programs. Understand your rights and responsibilities.",
  openGraph: {
    title: "Terms & Conditions | Seed & Spoon NJ",
    description:
      "Terms governing the use of Seed & Spoon NJ's website and services. Read our service guidelines and user responsibilities.",
    url: "https://seedandspoon.org/legal/terms",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Seed & Spoon NJ",
    description:
      "Read the terms and conditions for using Seed & Spoon NJ services and website.",
    images: ["/og-default.jpg"],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Terms & Conditions
        </h1>

        <p className="text-black/70 mb-6">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-black/70 mb-8">
          These Terms &amp; Conditions govern your use of the Seed & Spoon NJ
          website, participation in our programs, donations, and communication
          with our organization. By accessing our site or taking part in any of
          our services, you agree to the following terms.
        </p>

        {/* -------- 1 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            1. Use of Our Website
          </h2>
          <p className="text-black/70">
            You may use this site for lawful, non-commercial purposes. You agree
            not to disrupt the site, attempt unauthorized access, or misuse any
            information or tools provided.
          </p>
        </section>

        {/* -------- 2 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            2. Program Participation
          </h2>
          <p className="text-black/70 mb-3">
            Seed &amp; Spoon NJ provides food assistance, workshops, community
            meals, and donation-based services on a voluntary, goodwill basis.
          </p>
          <p className="text-black/70">
            We reserve the right to update eligibility requirements, pause
            programs, or adjust services as needed to maintain safety,
            compliance, and operational capacity.
          </p>
        </section>

        {/* -------- 3 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            3. Food Safety, Allergies &amp; Health Risks
          </h2>
          <p className="text-black/70 mb-3">
            While we follow recommended food safety guidelines, meals and food
            boxes may be prepared or packaged in environments containing common
            allergens such as dairy, nuts, eggs, soy, wheat, fish, or
            shellfish.
          </p>
          <p className="text-black/70">
            By accepting food from Seed &amp; Spoon NJ, you acknowledge and
            accept all associated risks and agree to review ingredients and
            exercise personal judgment before consumption.
          </p>
        </section>

        {/* -------- 4 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            4. Donations &amp; Payments
          </h2>
          <p className="text-black/70 mb-3">
            Donations are processed securely through third-party services such as
            Stripe. By donating, you affirm that you are authorized to use the
            provided payment method.
          </p>
          <p className="text-black/70">
            Unless legally required, donations are non-refundable. When a program
            is fully funded, we may reallocate excess funds to areas of highest
            need.
          </p>
        </section>

        {/* -------- 5 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            5. Intellectual Property
          </h2>
          <p className="text-black/70">
            All website content—including text, graphics, logos, and images—is
            the property of Seed &amp; Spoon NJ or licensed to us. You may not
            reproduce or distribute any content without written permission,
            except for personal, non-commercial use.
          </p>
        </section>

        {/* -------- 6 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            6. Third-Party Links
          </h2>
          <p className="text-black/70">
            Our website may link to external sites. Seed &amp; Spoon NJ is not
            responsible for content, policies, or actions taken by third-party
            platforms, including donation processors or partner organizations.
          </p>
        </section>

        {/* -------- 7 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            7. Liability Limitations
          </h2>
          <p className="text-black/70 mb-3">
            Seed &amp; Spoon NJ, including its volunteers and partners, is not
            liable for damages arising from:
          </p>
          <ul className="list-disc pl-6 text-black/70 space-y-2">
            <li>Use of this website</li>
            <li>Participation in our programs</li>
            <li>Food consumption or allergies</li>
            <li>Transportation, delivery, or third-party services</li>
          </ul>
        </section>

        {/* -------- 8 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            8. Updates to These Terms
          </h2>
          <p className="text-black/70">
            We may update these terms periodically to reflect legal changes,
            safety requirements, or organizational policies. The version posted
            here is the most current.
          </p>
        </section>

        {/* -------- 9 -------- */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-black mb-3">
            9. Contact Us
          </h2>
          <p className="text-black/70">
            For questions or concerns regarding these Terms & Conditions:
          </p>
          <p className="text-black font-semibold mt-2">
            seedandspoonnj@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
