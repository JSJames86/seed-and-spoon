import Image from 'next/image';
import Link from 'next/link';
import { TEAM } from '@/data/team';

export const metadata = {
  title: 'Team & Board | Seed & Spoon NJ',
  description:
    'Meet the people behind Seed & Spoon: our founder and executive director and our board of directors.',
  alternates: { canonical: 'https://seedandspoon.org/about/team' },
  openGraph: {
    title: 'Team & Board | Seed & Spoon NJ',
    description: 'Meet the people behind Seed & Spoon.',
    url: 'https://seedandspoon.org/about/team',
    images: ['/og-image.jpg'],
    type: 'website',
  },
};

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function TeamPage() {
  return (
    <div className="bg-white pt-16 md:pt-20 lg:pt-24">
      <section className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Team &amp; Board</h1>
          <p className="text-lg md:text-xl text-green-50 leading-relaxed">
            The people building Seed &amp; Spoon, and the board that keeps us accountable to the
            families we serve.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {TEAM.map((person) => (
              <li
                key={person.email}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
              >
                <div className="relative aspect-[4/5] w-full bg-green-50">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={`Photo of ${person.name}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="flex h-32 w-32 items-center justify-center rounded-full bg-green-800 text-4xl font-bold text-white">
                        {initials(person.name)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold text-gray-900">{person.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-green-800">{person.title}</p>
                  <p className="mt-4 flex-1 text-base leading-relaxed text-gray-700">{person.bio}</p>
                  <a
                    href={`mailto:${person.email}`}
                    className="mt-6 inline-flex items-center gap-2 font-semibold text-green-800 underline-offset-4 hover:underline break-all"
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    {person.email}
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14 text-center">
            <Link
              href="/about"
              className="inline-block rounded-lg border border-green-800 px-5 py-3 font-semibold text-green-800 hover:bg-green-50"
            >
              Read our story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
