import Link from "next/link";

export const metadata = {
  title: "Drop-off Days & Times | 5 Loaves | Seed & Spoon NJ",
  description:
    "When and where 5 Loaves weekend meals are dropped off: Fridays at partner schools, homes, and community locations in Essex County.",
  alternates: { canonical: "https://seedandspoon.org/get-help/hours" },
  openGraph: {
    title: "Drop-off Days & Times | 5 Loaves",
    description:
      "5 Loaves weekend meals are dropped off on Fridays at partner schools, homes, and community locations.",
    url: "https://seedandspoon.org/get-help/hours",
    images: ["/og-image.jpg"],
    type: "website",
  },
};

// Update this page when the pilot starts: add the specific community
// locations and confirm the time windows. Never list families' addresses.
export default function DropoffHoursPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-6">
          Drop-off Days &amp; Times
        </h1>

        <p className="text-base text-black/70 leading-relaxed mb-4">
          5 Loaves is a weekend meal program. We don&rsquo;t run a walk-in pantry. Instead, enrolled
          families get a weekend of freshly prepared meals, sealed and dropped off every Friday.
        </p>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 mb-8">
          <p className="text-base text-black/80 leading-relaxed">
            <strong>We&rsquo;re preparing to launch.</strong> The schedule below is how drop-offs will
            work once the pilot begins. Enrolled families will get their exact time and location by
            email and text.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">Drop-off day: Fridays</h2>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>
              <strong>At partner schools:</strong> starting at 2 p.m., in time for dismissal.
            </li>
            <li>
              <strong>At home or a community location:</strong> between 2 p.m. and 6 p.m.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">Where meals can be dropped off</h2>
          <ul className="list-disc pl-6 text-base text-black/70 leading-relaxed mb-4 space-y-2">
            <li>Your home, at the address on your application</li>
            <li>Your child&rsquo;s school, if it partners with Seed &amp; Spoon</li>
            <li>A community location near you</li>
          </ul>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            You choose your drop-off spot on the application. Community locations will be listed here
            once the pilot begins.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mt-10 mb-4">Need food before then?</h2>
          <p className="text-base text-black/70 leading-relaxed mb-4">
            Our{" "}
            <Link href="/get-help#resources" className="text-green-800 underline">
              community pantry directory
            </Link>{" "}
            lists food pantries and meal sites across Essex County.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/get-help#client-form"
            className="inline-block rounded-lg bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900"
          >
            Apply for 5 Loaves
          </Link>
          <Link
            href="/contact"
            className="inline-block rounded-lg border border-green-800 px-5 py-3 font-semibold text-green-800 hover:bg-green-50"
          >
            Questions? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
