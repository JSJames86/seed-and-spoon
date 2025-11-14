export const metadata = {
  title: "Cookie Policy | Seed & Spoon NJ - Manage Your Preferences",
  description:
    "Learn how Seed & Spoon NJ uses cookies and similar technologies. Manage your cookie preferences and understand how we collect website usage data.",
  openGraph: {
    title: "Cookie Policy | Seed & Spoon NJ",
    description:
      "Manage your cookie preferences and learn about our cookie usage for website functionality and analytics.",
    url: "https://seedandspoon.org/legal/cookies",
    images: ["/og-default.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Seed & Spoon NJ",
    description:
      "Learn about cookie usage and manage your preferences on our website.",
    images: ["/og-default.jpg"],
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Cookie Policy
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          Last updated: {new Date().getFullYear()}
        </p>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          This Cookie Policy explains how Seed & Spoon NJ uses cookies and similar technologies on our website. By using our site, you consent to the use of cookies as described in this policy.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            1. What Are Cookies?
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Cookies help us:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our website</li>
            <li>Improve website performance and functionality</li>
            <li>Provide a more personalized experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            2. Types of Cookies We Use
          </h2>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Strictly Necessary Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            These cookies are essential for the website to function properly. They enable core functionality such as:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Secure login and authentication</li>
            <li>Form submissions and data processing</li>
            <li>Session management</li>
            <li>Security and fraud prevention</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Without these cookies, certain parts of our website would not work correctly. These cookies do not collect information about you for marketing purposes.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Performance and Analytics Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may use analytics cookies to collect information about how visitors use our website. This helps us:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Understand which pages are visited most often</li>
            <li>See how users navigate our site</li>
            <li>Identify technical issues or errors</li>
            <li>Improve website design and user experience</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Analytics cookies collect anonymous or aggregated data and do not personally identify individual users. Examples include cookies from services like Google Analytics or similar platforms.
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Functionality Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            These cookies allow our website to remember choices you make and provide enhanced features. They may be used to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Remember your language preference</li>
            <li>Recall form data you've previously entered</li>
            <li>Store accessibility settings (such as text size)</li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Third-Party Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our website may include embedded content or integrations from third-party services, such as:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Payment processors (Stripe):</strong> Used to process donations securely</li>
            <li><strong>Social media platforms:</strong> If we embed social media content or share buttons</li>
            <li><strong>Video platforms:</strong> If we embed videos from YouTube or similar services</li>
            <li><strong>Maps:</strong> If we embed interactive maps</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            These third-party services may set their own cookies on your device. We do not control these cookies, and they are subject to the third party's privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            3. How Long Do Cookies Last?
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Cookies can be either session cookies or persistent cookies:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Session cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain on your device for a set period (ranging from days to years) or until you manually delete them</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We use both types of cookies depending on their purpose. Most analytics and functionality cookies are persistent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            4. How to Manage and Control Cookies
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You have the right to decide whether to accept or reject cookies. You can control cookies in several ways:
          </p>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Browser Settings
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Most web browsers allow you to manage cookies through your settings. You can typically:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>View what cookies are stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block all cookies or only third-party cookies</li>
            <li>Set preferences for specific websites</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            To manage cookies in your browser, check the Help or Settings section:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Opt-Out of Analytics Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If we use analytics tools like Google Analytics, you can opt out by:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Installing the Google Analytics Opt-out Browser Add-on</li>
            <li>Using browser privacy extensions that block tracking</li>
            <li>Enabling Do Not Track (DNT) settings in your browser</li>
          </ul>

          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Impact of Blocking Cookies
          </h3>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Please note that blocking or deleting cookies may affect your experience on our website. If you disable cookies:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Some features may not work properly</li>
            <li>You may need to re-enter information on subsequent visits</li>
            <li>We may not be able to remember your preferences</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Strictly necessary cookies cannot be disabled without impacting core website functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            5. Cookie Consent and Banner
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If we implement a cookie consent banner or management tool in the future, you will be able to:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Accept or reject non-essential cookies</li>
            <li>Customize your preferences by cookie category</li>
            <li>Change your cookie settings at any time</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Any updates to our cookie consent process will be reflected in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            6. Other Tracking Technologies
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            In addition to cookies, we may use other tracking technologies, such as:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>Web beacons (pixels):</strong> Tiny graphics embedded in web pages or emails that track whether content has been viewed</li>
            <li><strong>Local storage:</strong> Browser-based storage for website data and preferences</li>
            <li><strong>Session replay tools:</strong> Technologies that record user interactions to improve website usability (if used, anonymized data only)</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            These technologies serve similar purposes to cookies and can typically be controlled through browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            7. Updates to This Cookie Policy
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. The "Last updated" date at the top indicates when this policy was last revised.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We encourage you to review this page periodically to stay informed about how we use cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            8. More Information About Privacy
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            For more information about how we collect and use your personal information, please see our <a href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have questions about our use of cookies, you can also refer to these external resources:
          </p>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li><strong>AllAboutCookies.org:</strong> Comprehensive information about cookies and how to manage them</li>
            <li><strong>Your browser's help documentation:</strong> Specific instructions for managing cookies in your browser</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">
            9. Contact Us
          </h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            If you have questions or concerns about our use of cookies, please contact us:
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            <strong>Seed & Spoon NJ</strong><br />
            Email: <strong>seedandspoonnj@gmail.com</strong>
          </p>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            We're happy to answer any questions you may have about how we use cookies and tracking technologies.
          </p>
        </section>
      </div>
    </div>
  );
}
