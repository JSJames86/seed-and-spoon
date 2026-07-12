'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Static content ───────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Tell Us Your Idea',
    body: 'Fill out the form below with your name, location, and what kind of drive you have in mind. No experience required.',
  },
  {
    number: '02',
    title: 'We Reach Out',
    body: "Within 48 hours, our team will contact you to confirm details, answer questions, and get everything lined up.",
  },
  {
    number: '03',
    title: 'You Collect, We Support',
    body: 'Run your drive your way. We supply collection boxes, promotional materials, and a point of contact for the whole event.',
  },
  {
    number: '04',
    title: 'Deliver the Impact',
    body: 'We pick up your donations and get every item to a young person who needs it — and we share the final count with you.',
  },
];

const DRIVE_TYPES = [
  {
    icon: '🏫',
    label: 'School or Campus',
    description:
      'Student councils, clubs, and classrooms have run some of our biggest drives. Friendly competition between homerooms? Even better.',
  },
  {
    icon: '🏢',
    label: 'Workplace',
    description:
      'A two-week office drive can fill dozens of boxes. Great for team-building and corporate giving programs.',
  },
  {
    icon: '⛪',
    label: 'Faith Community',
    description:
      'Congregations of any size can make a real difference. We can align pickup with your service schedule.',
  },
  {
    icon: '🏘️',
    label: 'Neighborhood',
    description:
      'Block associations, HOAs, and neighbors banding together. Every front porch matters.',
  },
];

const PROVIDES = [
  'Branded collection boxes and signage',
  'Printable flyers and social media assets',
  'A dedicated coordinator for questions',
  'Pickup logistics — we come to you',
  'A final impact report with your donation count',
];

const DRIVE_TYPE_OPTIONS = [
  'School / Campus',
  'Workplace',
  'Faith Community',
  'Neighborhood',
  'Other',
];

const COLLECTION_TYPE_OPTIONS = [
  'Drop-off boxes on site',
  'Door-to-door neighborhood collection',
  'Both',
];

// ─── Small reusable components ────────────────────────────────────────────────

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

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessCard({ onReset }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-green-800 mb-3">
        You&apos;re on the list!
      </h3>
      <p className="text-gray-700 mb-6 max-w-md mx-auto">
        Thank you for stepping up. Our team will reach out within 48 hours to
        confirm your drive details and get you everything you need.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/donate"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Also Make a Donation
        </Link>
        <button
          onClick={onReset}
          className="inline-block bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
        >
          Submit Another Drive
        </button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  driveType: '',
  expectedDate: '',
  location: '',
  collectionType: '',
  needsSupport: false,
  notes: '',
};

function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) errors.name = 'Your name is required.';
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!fields.driveType) errors.driveType = 'Please select a drive type.';
  if (!fields.expectedDate) errors.expectedDate = 'A planned date is required.';
  if (!fields.location.trim()) errors.location = 'Location is required.';
  if (!fields.collectionType) errors.collectionType = 'Please select a collection method.';
  return errors;
}

function FoodDriveForm() {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [serverError, setServerError] = useState('');

  const set = (key, value) =>
    setFields((prev) => ({ ...prev, [key]: value }));

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
      const res = await fetch('/api/food-drives', {
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
    return <SuccessCard onReset={() => { setFields(EMPTY_FORM); setStatus('idle'); }} />;
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Contact info */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Your Name" required error={errors.name}>
          <input
            id="field-name"
            type="text"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Jane Smith"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <input
            id="field-email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="jane@example.com"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.email ? 'border-red-400' : 'border-gray-300'
            }`}
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

      {/* Drive details */}
      <Field label="Type of Drive" required error={errors.driveType}>
        <div id="field-driveType">
          <RadioPills
            name="driveType"
            options={DRIVE_TYPE_OPTIONS}
            value={fields.driveType}
            onChange={(v) => set('driveType', v)}
          />
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Planned Date" required error={errors.expectedDate}>
          <input
            id="field-expectedDate"
            type="date"
            min={today}
            value={fields.expectedDate}
            onChange={(e) => set('expectedDate', e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.expectedDate ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>

        <Field label="Location / Address" required error={errors.location}>
          <input
            id="field-location"
            type="text"
            value={fields.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="123 Main St, Newark, NJ"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.location ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>
      </div>

      <Field label="Collection Method" required error={errors.collectionType}>
        <div id="field-collectionType">
          <RadioPills
            name="collectionType"
            options={COLLECTION_TYPE_OPTIONS}
            value={fields.collectionType}
            onChange={(v) => set('collectionType', v)}
          />
        </div>
      </Field>

      <Field label="Do you need setup support from our team?">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fields.needsSupport}
            onChange={(e) => set('needsSupport', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-700 text-sm">
            Yes, I&apos;d like hands-on help setting up collection boxes and materials.
          </span>
        </label>
      </Field>

      <Field label="Anything else we should know? (optional)">
        <textarea
          id="field-notes"
          value={fields.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={4}
          placeholder="Number of expected participants, any timing constraints, special requests..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
        {status === 'loading' ? 'Sending...' : 'Register My Drive'}
      </button>

      <p className="text-xs text-gray-500">
        * Required fields. We&apos;ll never share your information with third parties.
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
          Host a Food Drive
        </h1>
        <p className="text-lg sm:text-xl text-green-100 leading-relaxed mb-8 max-w-2xl mx-auto">
          You don&apos;t need a warehouse or a budget. You just need a community. Whether
          you&apos;re a student group, a team at work, a congregation, or a block of neighbors
          — we&apos;ll give you everything you need to make it happen.
        </p>
        <a
          href="#register"
          className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-lg transition text-lg"
        >
          Start Your Drive
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

function DriveTypes() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Who Can Host?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
          Anyone. Here are some of the communities that have run drives with us before.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {DRIVE_TYPES.map((type) => (
            <div
              key={type.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4 items-start"
            >
              <span className="text-3xl flex-shrink-0" aria-hidden="true">
                {type.icon}
              </span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{type.label}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeProvide() {
  return (
    <section className="py-20 px-4 bg-green-700 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">What We Provide</h2>
        <p className="text-green-100 mb-10 text-lg">
          You bring the community. We handle the rest.
        </p>
        <ul className="inline-flex flex-col gap-4 text-left">
          {PROVIDES.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                ✓
              </span>
              <span className="text-green-100 text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RegisterSection() {
  return (
    <section id="register" className="py-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Register Your Drive</h2>
          <p className="text-gray-600 text-lg">
            Fill out the form below and our team will follow up within 48 hours.
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-10">
          <FoodDriveForm />
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
          Not ready to host? You can still help.
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          A monetary donation goes just as far. Every $2.85 puts a meal on someone&apos;s
          table today.
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
            Other Ways to Help
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function FoodDriveClient() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <DriveTypes />
      <WhatWeProvide />
      <RegisterSection />
      <CtaReinforcement />
    </div>
  );
}
