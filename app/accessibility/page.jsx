export const metadata = {
  title: "Accessibility Statement | Seed & Spoon NJ - Inclusive Design for All",
  description:
    "Seed & Spoon NJ is committed to digital accessibility for people with disabilities. Learn about our efforts to ensure equal access to food resources and information.",
  openGraph: {
    title: "Accessibility Statement | Seed & Spoon NJ",
    description:
      "Our commitment to web accessibility and inclusive design. Seed & Spoon NJ ensures equal access to food assistance information and resources.",
    url: "https://seedandspoon.org/accessibility",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility | Seed & Spoon NJ",
    description:
      "Committed to inclusive digital access for all. Learn about our accessibility standards and resources.",
    images: ["/og-default.jpg"],
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Accessibility Statement
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Seed & Spoon NJ is committed to ensuring that our website and digital resources are accessible to everyone, including people with disabilities. We believe that access to information about food assistance should be available to all members of our community, regardless of ability.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            1. Our Commitment to Accessibility
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We strive to create an inclusive digital experience by:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Designing our website with accessibility in mind from the ground up</li>
            <li>Following established web accessibility guidelines and best practices</li>
            <li>Regularly reviewing and improving our digital content for accessibility</li>
            <li>Providing alternative formats and accommodations when requested</li>
            <li>Training our team on accessibility principles and inclusive design</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            2. Standards We Aim to Meet
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our website aims to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>, an internationally recognized standard for web accessibility developed by the World Wide Web Consortium (W3C).
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            These guidelines help make web content more accessible to people with a wide range of disabilities, including:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Visual impairments (blindness, low vision, color blindness)</li>
            <li>Hearing impairments</li>
            <li>Motor or mobility impairments</li>
            <li>Cognitive and learning disabilities</li>
            <li>Speech disabilities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            3. Accessibility Features
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our website includes the following accessibility features:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Semantic HTML:</strong> Properly structured headings, landmarks, and content hierarchy for screen reader navigation</li>
            <li><strong>Keyboard navigation:</strong> All interactive elements are accessible via keyboard</li>
            <li><strong>Alternative text:</strong> Descriptive alt text for images and graphics</li>
            <li><strong>Color contrast:</strong> Sufficient contrast between text and background colors for readability</li>
            <li><strong>Resizable text:</strong> Text can be resized without loss of functionality</li>
            <li><strong>Clear focus indicators:</strong> Visible focus states for keyboard navigation</li>
            <li><strong>Consistent navigation:</strong> Predictable and consistent navigation structure throughout the site</li>
            <li><strong>Form labels:</strong> Clear labels and instructions for all form fields</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            4. Known Limitations
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            While we work hard to ensure accessibility, we recognize that our website may not be perfect. Some areas where we are actively working to improve include:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Some older content may not fully meet current accessibility standards</li>
            <li>Third-party embedded content (such as maps or payment forms) may have accessibility limitations beyond our control</li>
            <li>Some PDF documents may not be fully accessible and are being converted to alternative formats</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We are committed to addressing these issues and continuously improving the accessibility of our digital content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            5. Assistive Technology Compatibility
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our website is designed to be compatible with common assistive technologies, including:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
            <li>Screen magnification software</li>
            <li>Speech recognition software</li>
            <li>Keyboard-only navigation</li>
            <li>Alternative input devices</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We test our website with various assistive technologies and browsers to ensure broad compatibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            6. Requesting Accommodations or Alternative Formats
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you encounter barriers while using our website or need information in an alternative format, we are here to help. We can provide:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Information in large print</li>
            <li>Plain text versions of documents</li>
            <li>Information read aloud over the phone</li>
            <li>Assistance completing forms or applications</li>
            <li>Email or print versions of web content</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To request an accommodation or alternative format, please contact us at <strong>seedandspoonnj@gmail.com</strong>. Please include:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>A description of the specific information or page you need</li>
            <li>Your preferred format (large print, audio, plain text, etc.)</li>
            <li>Your contact information</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We will respond to your request as quickly as possible, typically within 3-5 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            7. Reporting Accessibility Issues
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you encounter an accessibility barrier on our website, please let us know. Your feedback helps us identify issues and improve our site for everyone.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            When reporting an issue, please include:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>The web page or feature where you encountered the problem</li>
            <li>A description of the issue and how it affects your ability to access the content</li>
            <li>The assistive technology or browser you were using (if applicable)</li>
            <li>Any error messages you received</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Contact us at <strong>seedandspoonnj@gmail.com</strong> with the subject line "Accessibility Issue" to report a problem.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            8. Ongoing Efforts and Improvement
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Accessibility is an ongoing commitment, not a one-time project. We are continuously working to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Conduct regular accessibility audits of our website</li>
            <li>Test with real users who rely on assistive technology</li>
            <li>Update our content and design to meet evolving accessibility standards</li>
            <li>Train staff and volunteers on accessible content creation</li>
            <li>Incorporate accessibility into all new features and content</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We view accessibility not just as compliance, but as a fundamental part of serving our community with dignity and respect.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            9. Physical Accessibility
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            In addition to digital accessibility, we are committed to ensuring physical access to our programs and services:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Distribution sites with accessible parking and entrances</li>
            <li>Alternative service delivery options (home delivery, curbside pickup)</li>
            <li>Assistance with carrying food boxes or navigating facilities</li>
            <li>Communication support for people with hearing or speech disabilities</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you need accommodations to access our in-person services, please contact us in advance so we can make appropriate arrangements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            10. External Resources
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            For more information about web accessibility and assistive technology, we recommend these resources:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Web Content Accessibility Guidelines (WCAG):</strong> W3C's international standard for web accessibility</li>
            <li><strong>WebAIM:</strong> Resources and training on web accessibility</li>
            <li><strong>Accessible Technology Coalition:</strong> Advocacy and resources for digital accessibility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            11. Contact Us
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We welcome feedback and questions about the accessibility of our website and services.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ</strong><br />
            Email: <strong>seedandspoonnj@gmail.com</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We take accessibility seriously and are committed to ensuring that everyone can access the information and resources they need. Thank you for helping us create a more inclusive digital experience.
          </p>
        </section>
      </div>
    </div>
  );
}
