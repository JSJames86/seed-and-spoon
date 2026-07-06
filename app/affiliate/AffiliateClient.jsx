'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Static content ───────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Apply',
    body: 'Fill out the form below. Tell us who you are, your audience or community, and how you plan to spread the word.',
  },
  {
    number: '02',
    title: 'Get Your Kit',
    body: "We'll send you a branded digital kit: flyers, social media assets, and talking points — everything you need to tell our story well.",
  },
  {
    number: '03',
    title: 'Share & Track',
    body: "Use your personal affiliate link to drive donations and volunteers. We'll send you monthly impact reports showing exactly what your referrals funded.",
  },
];

const BENEFITS = [
  {
    icon: '🔗',
    title: 'Personal Affiliate Link',
    body: 'A unique link that tracks every donation and volunteer signup you drive. Your impact, measured.',
  },
  {
    icon: '🎨',
    title: 'Branded Digital Kit',
    body: 'Ready-to-share flyers, social graphics, and talking points. No design work needed on your end.',
  },
  {
    icon: '📊',
    title: 'Monthly Impact Reports',
    body: "See how many meals your referrals funded, how many people you helped reach, and what it all added up to.",
  },
  {
    icon: '🌟',
    title: 'Affiliate Spotlight',
    body: "Top affiliates get featured on our site and in our newsletter. Your community sees the difference you're making.",
  },
  {
    icon: '📞',
    title: 'Direct Team Access',
    body: "A real person on our team to answer questions, support your events, and help you make the biggest possible impact.",
  },
];

const WHO = [
  {
    type: 'Individual',
    icon: '👤',
    description:
      'Community advocates, content creators, students, faith leaders, or anyone with a network and a passion for ending youth hunger in Newark.',
    examples: ['Social media creators', 'Student leaders', 'Community organizers', 'Local influencers'],
  },
  {
    type: 'Organization',
    icon: '🏢',
    description:
      'Businesses, schools, faith communities, civic groups, and nonprofits looking to align their mission with a trusted local cause.',
    examples: ['Small businesses', 'Corporate teams', 'Faith communities', 'Schools & colleges'],
  },
];

const AFFILIATE_TYPES = ['Individual', 'Organization'];

// ─── Small components ─────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}

function RadioPills({ name, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <label
            key={opt}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium border transition-colors select-none ${
              checked
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={checked}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function SuccessCard({ onReset }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-green-800 mb-3">
        Application received!
      </h3>
      <p className="text-gray-700 mb-6 max-w-md mx-auto">
        Thanks for wanting to be part of this. Our team reviews every application
        personally — you&apos;ll hear from us within a few days.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/donate"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Make a Donation Too
        </Link>
        <button
          onClick={onReset}
          className="inline-block bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
        >
          Submit Another Application
        </button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  affiliateType: '',
  organizationName: '',
  website: '',
  socialHandle: '',
  planToHelp: '',
};

function validate(f) {
  const errors = {};
  if (!f.name.trim()) errors.name = 'Your name is required.';
  if (!f.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!f.affiliateType) errors.affiliateType = 'Please select a type.';
  if (!f.planToHelp.trim()) errors.planToHelp = 'Please tell us how you plan to help.';
  return errors;
}

function AffiliateForm() {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  const set = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }
    setErrors({});
    setStatus('loading');
    setServerError('');

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setStatus('success');
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <SuccessCard onReset={() => { setFields(EMPTY); setStatus('idle'); }} />;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Your Name" required error={errors.name}>
          <input
            id="field-name"
            type="text"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Jane Smith"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <input
            id="field-email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="jane@example.com"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
          />
        </Field>
      </div>

      <Field label="Phone Number (optional)">
        <input
          id="field-phone"
          type="tel"
          value={fields.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="(973) 555-0100"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </Field>

      <Field label="I am applying as" required error={errors.affiliateType}>
        <div id="field-affiliateType" className="mt-1">
          <RadioPills
            name="affiliateType"
            options={AFFILIATE_TYPES}
            value={fields.affiliateType}
            onChange={(v) => set('affiliateType', v)}
          />
        </div>
      </Field>

      {fields.affiliateType === 'Organization' && (
        <Field label="Organization Name">
          <input
            id="field-organizationName"
            type="text"
            value={fields.organizationName}
            onChange={(e) => set('organizationName', e.target.value)}
            placeholder="Acme Community Church"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Website (optional)">
          <input
            id="field-website"
            type="url"
            value={fields.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://yoursite.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>

        <Field label="Social Media Handle (optional)">
          <input
            id="field-socialHandle"
            type="text"
            value={fields.socialHandle}
            onChange={(e) => set('socialHandle', e.target.value)}
            placeholder="@yourhandle"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>
      </div>

      <Field label="How do you plan to help?" required error={errors.planToHelp}>
        <textarea
          id="field-planToHelp"
          value={fields.planToHelp}
          onChange={(e) => set('planToHelp', e.target.value)}
          rows={5}
          placeholder="Tell us about your audience, platform, or community and how you'd spread the word about Seed & Spoon..."
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${errors.planToHelp ? 'border-red-400' : 'border-gray-300'}`}
        />
      </Field>

      {status === 'error' && serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-10 rounded-lg transition text-lg"
      >
        {status === 'loading' ? 'Sending...' : 'Apply Now'}
      </button>

      <p className="text-xs text-gray-500">
        * Required fields. We review every application personally and respond within a few days.
      </p>
    </form>
  );
}

// ─── Page sections ────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative bg-green-700 text-white py-20 px-4">
      {/* Sentinel observed by Header to detect when hero is in view */}
      <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-green-200 uppercase tracking-widest text-sm font-semibold mb-4">
          Get Involved
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
          Become an Affiliate
        </h1>
        <p className="text-lg sm:text-xl text-green-100 leading-relaxed mb-8 max-w-2xl mx-auto">
          You have a platform. We have a mission. Together, we can put meals on
          the table for at-risk youth in Newark. Join our affiliate program and
          turn your influence into real, measurable impact.
        </p>
        <a
          href="#apply"
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-lg transition text-lg"
        >
          Apply Today
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-start">
              <span className="text-4xl font-black text-green-200 leading-none mb-3">
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          What You Get
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
          We set you up for success from day one.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <span className="text-3xl mb-3 block" aria-hidden="true">{b.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="py-20 px-4 bg-green-700 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Who Can Apply?</h2>
        <p className="text-center text-green-100 mb-12 max-w-xl mx-auto">
          If you care about your community and have people who listen to you, you qualify.
        </p>
        <div className="grid sm:grid-cols-2 gap-8">
          {WHO.map((w) => (
            <div key={w.type} className="bg-green-800 rounded-xl p-8">
              <span className="text-4xl mb-3 block" aria-hidden="true">{w.icon}</span>
              <h3 className="text-xl font-bold mb-3">{w.type}</h3>
              <p className="text-green-100 text-sm leading-relaxed mb-4">{w.description}</p>
              <ul className="space-y-1">
                {w.examples.map((ex) => (
                  <li key={ex} className="flex items-center gap-2 text-green-200 text-sm">
                    <span className="text-yellow-400" aria-hidden="true">→</span>
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApplySection() {
  return (
    <section id="apply" className="py-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply to Be an Affiliate</h2>
          <p className="text-gray-600 text-lg">
            We review every application personally and follow up within a few days.
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-10">
          <AffiliateForm />
        </div>
      </div>
    </section>
  );
}

function CtaReinforcement() {
  return (
    <section className="py-20 px-4 bg-yellow-50 border-t border-yellow-100">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Not ready to affiliate? You can still make a difference.
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          A one-time donation, a shared post, or a food drive all move the needle.
          Every action counts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/donate"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Donate Now
          </Link>
          <Link
            href="/get-involved/food-drive"
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition"
          >
            Host a Food Drive
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function AffiliateClient() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <BenefitsSection />
      <WhoItsFor />
      <ApplySection />
      <CtaReinforcement />
    </main>
  );
}
