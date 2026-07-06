'use client';

import { useState } from 'react';

const ROLE_GROUPS = [
  {
    category: 'Program & Direct Service',
    icon: '🥗',
    roles: [
      {
        title: 'Case Manager',
        desc: 'Connect families and youth to food resources, social services, and support programs.',
      },
      {
        title: 'Cook',
        desc: 'Prepare nutritious meals for distribution events and community programming.',
      },
      {
        title: 'Driver',
        desc: 'Transport food donations, supplies, and prepared meals to partner locations.',
      },
      {
        title: 'Sanitation & Kitchen Manager',
        desc: 'Maintain safe, clean, and compliant kitchen and food handling operations.',
      },
    ],
  },
  {
    category: 'Communications & Creative',
    icon: '📸',
    roles: [
      {
        title: 'Social Media Moderator',
        desc: 'Manage community engagement across Instagram, TikTok, Threads, and Facebook.',
      },
      {
        title: 'Photographer',
        desc: 'Document events, distribution days, and community stories through photography.',
      },
      {
        title: 'Videographer',
        desc: 'Capture and edit video content for social media, donor outreach, and campaigns.',
      },
    ],
  },
  {
    category: 'Development & Research',
    icon: '📊',
    roles: [
      {
        title: 'Grant Writer',
        desc: 'Research funding opportunities and write compelling grant applications.',
      },
      {
        title: 'Fundraiser',
        desc: 'Cultivate donor relationships and lead individual and corporate giving campaigns.',
      },
      {
        title: 'Researcher',
        desc: 'Gather and analyze data on youth food insecurity to support advocacy and programming.',
      },
    ],
  },
];

const ALL_POSITIONS = ROLE_GROUPS.flatMap((g) => g.roles.map((r) => r.title)).concat([
  'Open to Any Role',
]);

function SuccessCard() {
  return (
    <div className="max-w-xl mx-auto text-center py-20 px-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">We received your submission</h2>
      <p className="text-gray-600 leading-relaxed">
        Thank you for your interest in joining Seed &amp; Spoon NJ. We keep all submissions on file
        and will reach out when a matching role opens up.
      </p>
    </div>
  );
}

const EMPTY = { name: '', email: '', phone: '', position: '', portfolioUrl: '', message: '' };

export default function CareersClient() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  if (status === 'success') return <SuccessCard />;

  return (
    <main className="bg-[#faf9f6] min-h-screen">
      {/* Hero */}
      <section className="relative bg-[var(--green-primary,#2d6a4f)] text-white py-20 px-6">
        {/* Sentinel observed by Header to detect when hero is in view */}
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-3">
            Join Our Team
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            No Openings Right Now — But We Are Always Growing
          </h1>
          <p className="text-green-100 text-lg leading-relaxed max-w-2xl mx-auto">
            Seed &amp; Spoon NJ is building something meaningful in Newark. If you believe in what
            we do and want to be part of it when the time is right, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Roles grid */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Roles We Hire For</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              These are the types of positions we bring on as we grow. Submit your interest and we
              will keep your information on file.
            </p>
          </div>

          <div className="space-y-12">
            {ROLE_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{group.icon}</span>
                  <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                    {group.category}
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.roles.map((role) => (
                    <div
                      key={role.title}
                      className="bg-[#faf9f6] border border-gray-200 rounded-xl p-5"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{role.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{role.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="bg-green-800 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { heading: 'Mission First', body: 'Every role here exists to fight hunger. We do this work because it matters.' },
            { heading: 'Community Rooted', body: 'We hire people who are connected to — or deeply care about — Newark and its families.' },
            { heading: 'Room to Grow', body: 'As Seed & Spoon grows, so do the people who help build it.' },
          ].map(({ heading, body }) => (
            <div key={heading}>
              <h3 className="font-bold text-lg mb-2">{heading}</h3>
              <p className="text-green-200 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Interest</h2>
          <p className="text-gray-600 mb-10">
            Fill out the form below and we will keep your information on file. When a role that
            matches your interest opens up, we will be in touch.
          </p>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Phone Number{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Role of Interest *
              </label>
              <select
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Select a role…</option>
                {ROLE_GROUPS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.roles.map((role) => (
                      <option key={role.title} value={role.title}>
                        {role.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Open to Any Role">Open to Any Role</option>
              </select>
            </div>

            {/* Portfolio / LinkedIn */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                LinkedIn or Portfolio URL{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => set('portfolioUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Tell us about yourself *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Share your background, why you want to work with Seed &amp; Spoon NJ, and anything
                else you think we should know.
              </p>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                required
                rows={6}
                placeholder="I have five years of experience in community nutrition programs and have been following Seed & Spoon's work since…"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-vertical"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-600 text-sm">{errorMsg || 'Something went wrong. Please try again.'}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit My Interest'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              We do not share your information with third parties. Submissions are kept on file for
              up to 12 months.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
