'use client';

import { useState } from 'react';

const RESEARCH_AREAS = [
  'Youth Food Insecurity',
  'Urban Agriculture & Access',
  'Nutrition & Child Development',
  'Community Health Outcomes',
  'Food Policy & Advocacy',
  'Economic Mobility & Food Security',
  'Other',
];

const TIMELINES = [
  'Immediate (within 3 months)',
  'Short-term (3–6 months)',
  'Mid-term (6–12 months)',
  'Long-term (1+ year)',
  'Flexible / exploratory',
];

function RadioPills({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              value === opt
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
            }`}
          >
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

function SuccessCard() {
  return (
    <div className="max-w-xl mx-auto text-center py-20 px-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you for reaching out</h2>
      <p className="text-gray-600 leading-relaxed">
        We have received your research partnership inquiry and will review it carefully. If your work
        aligns with our mission, someone from our team will be in touch within 5–7 business days.
      </p>
    </div>
  );
}

const EMPTY = {
  name: '',
  email: '',
  organization: '',
  role: '',
  researchArea: '',
  timeline: '',
  message: '',
};

export default function ContactClient() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // Fire team notification email — non-blocking
      fetch('/api/email/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          subject: form.researchArea ? `Research Partnership: ${form.researchArea}` : 'Research Partnership Inquiry',
        }),
      }).catch(() => {});

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
      <section className="bg-green-800 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-3">
            Research &amp; Data
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Research Partnership Inquiry
          </h1>
          <p className="text-green-100 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Seed &amp; Spoon NJ is building toward formal research partnerships with universities,
            public health institutions, and policy organizations focused on youth food insecurity in
            Newark and across New Jersey.
          </p>
        </div>
      </section>

      {/* Context strip */}
      <section className="bg-white border-b border-gray-200 py-10 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Focus Area', value: 'Youth food insecurity in urban New Jersey' },
            { label: 'Primary Geography', value: 'Newark, NJ and surrounding Essex County' },
            { label: 'Partnership Types', value: 'Academic, public health, policy, and advocacy' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-gray-800 text-sm leading-snug">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your work</h2>
          <p className="text-gray-600 mb-10">
            All fields marked with * are required. We review every submission and respond to those
            that align with our current research priorities.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                placeholder="Dr. Jane Smith"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                placeholder="jane.smith@university.edu"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Organization / Institution *
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => set('organization', e.target.value)}
                required
                placeholder="Rutgers University School of Public Health"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Your Title / Role *
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                required
                placeholder="Associate Professor, Research Director, Policy Analyst…"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Research Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Primary Research Area *
              </label>
              <RadioPills
                name="researchArea"
                options={RESEARCH_AREAS}
                value={form.researchArea}
                onChange={(v) => set('researchArea', v)}
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Anticipated Timeline <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <RadioPills
                name="timeline"
                options={TIMELINES}
                value={form.timeline}
                onChange={(v) => set('timeline', v)}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                How would you like to collaborate? *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Describe your research focus, what you are studying or trying to learn, and how a
                partnership with Seed &amp; Spoon NJ might support that work.
              </p>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                required
                rows={6}
                placeholder="We are studying the relationship between food access and chronic absenteeism among middle school students in Newark…"
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
              {status === 'submitting' ? 'Sending…' : 'Submit Partnership Inquiry'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              We do not share your information with third parties. This form is exclusively for
              research partnership inquiries.
            </p>
          </form>
        </div>
      </section>

      {/* Footer note */}
      <section className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Not a researcher?</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            This page is specifically for academic and institutional research partnership inquiries.
            If you are interested in volunteering, donating, hosting a food drive, or becoming an
            affiliate, please visit our{' '}
            <a href="/get-involved/food-drive" className="text-green-700 hover:underline font-medium">
              Get Involved
            </a>{' '}
            page.
          </p>
        </div>
      </section>
    </main>
  );
}
