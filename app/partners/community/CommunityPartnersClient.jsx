'use client';

import { useState } from 'react';

// ─── Static content ───────────────────────────────────────────────────────────

const WHO_WE_PARTNER_WITH = [
  { icon: '⛪', label: 'Churches & faith communities' },
  { icon: '🏘️', label: 'Community centers' },
  { icon: '🧑‍🤝‍🧑', label: 'Youth groups' },
  { icon: '🤝', label: 'Social / civic groups' },
  { icon: '🎓', label: 'Educational institutions' },
];

const RIGHT_NOW = [
  'Host a pickup site for families in your community',
  'Refer families who need food access support',
];

const AS_WE_GROW = [
  'Share commercial kitchen space',
  'Provide volunteers for packing, kitchen, or delivery',
  'Funding and resource collaborations',
];

const ORGANIZATION_TYPE_OPTIONS = [
  'Church / Faith community',
  'Community center',
  'Youth group',
  'Social / Civic group',
  'Educational institution',
  'Other',
];

const PARTNERSHIP_INTEREST_OPTIONS = [
  'Host a pickup site',
  'Refer families',
  'Offer commercial kitchen space',
  'Provide volunteers',
  'Funding collaboration',
];

// ─── Small reusable components ────────────────────────────────────────────────

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessCard({ email, onReset }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-green-800 mb-3">You&apos;re on our community partner list</h3>
      <p className="text-gray-700 mb-6 max-w-md mx-auto">
        Thank you — we&apos;ll be in touch at <span className="font-semibold">{email}</span> soon to talk
        through how we can work together.
      </p>
      <button
        onClick={onReset}
        className="inline-block bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
      >
        Submit Another Partner Inquiry
      </button>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  organizationName: '',
  organizationType: '',
  organizationTypeOther: '',
  contactName: '',
  email: '',
  phone: '',
  city: '',
  zip: '',
  partnershipInterests: [],
  notes: '',
  website: '',
  consent: false,
};

function validate(fields) {
  const errors = {};
  if (!fields.organizationName.trim()) errors.organizationName = 'Organization name is required.';
  if (!fields.organizationType) errors.organizationType = 'Please select an organization type.';
  if (fields.organizationType === 'Other' && !fields.organizationTypeOther.trim()) {
    errors.organizationTypeOther = 'Please tell us what type of organization you are.';
  }
  if (!fields.contactName.trim()) errors.contactName = 'Contact name is required.';
  if (!fields.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (fields.partnershipInterests.length === 0) {
    errors.partnershipInterests = 'Select at least one way to partner.';
  }
  if (!fields.consent) errors.consent = 'Please agree to be contacted to submit the form.';
  return errors;
}

function CommunityPartnerForm() {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [serverError, setServerError] = useState('');

  const set = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (option) => {
    setFields((prev) => {
      const has = prev.partnershipInterests.includes(option);
      return {
        ...prev,
        partnershipInterests: has
          ? prev.partnershipInterests.filter((o) => o !== option)
          : [...prev.partnershipInterests, option],
      };
    });
  };

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
      const res = await fetch('/api/partners/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // Fire team notification email — non-blocking, mirrors the contact form flow
      fetch('/api/email/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.contactName,
          email: fields.email,
          phone: fields.phone || undefined,
          subject: `Community Partnership Inquiry: ${fields.organizationName}`,
          message: [
            `Organization: ${fields.organizationName}`,
            `Type: ${fields.organizationType === 'Other' ? fields.organizationTypeOther : fields.organizationType}`,
            fields.city || fields.zip ? `Location: ${[fields.city, fields.zip].filter(Boolean).join(', ')}` : null,
            `Interested in: ${fields.partnershipInterests.join(', ')}`,
            fields.website ? `Website / social: ${fields.website}` : null,
            fields.notes ? `Notes: ${fields.notes}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      }).catch(() => {});

      setStatus('success');
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <SuccessCard
        email={fields.email}
        onReset={() => {
          setFields(EMPTY_FORM);
          setStatus('idle');
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Organization Name" required error={errors.organizationName}>
          <input
            id="field-organizationName"
            type="text"
            value={fields.organizationName}
            onChange={(e) => set('organizationName', e.target.value)}
            placeholder="Mt. Zion Community Church"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.organizationName ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>

        <Field label="Organization Type" required error={errors.organizationType}>
          <select
            id="field-organizationType"
            value={fields.organizationType}
            onChange={(e) => set('organizationType', e.target.value)}
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.organizationType ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Select one...</option>
            {ORGANIZATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {fields.organizationType === 'Other' && (
        <Field label="Please describe your organization type" required error={errors.organizationTypeOther}>
          <input
            id="field-organizationTypeOther"
            type="text"
            value={fields.organizationTypeOther}
            onChange={(e) => set('organizationTypeOther', e.target.value)}
            placeholder="Tell us a bit more"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.organizationTypeOther ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Contact Name" required error={errors.contactName}>
          <input
            id="field-contactName"
            type="text"
            value={fields.contactName}
            onChange={(e) => set('contactName', e.target.value)}
            placeholder="Jane Smith"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.contactName ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <input
            id="field-email"
            type="email"
            value={fields.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="jane@example.org"
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.email ? 'border-red-400' : 'border-gray-300'
            }`}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <Field label="Phone (optional)">
          <input
            id="field-phone"
            type="tel"
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="(973) 555-0100"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>

        <Field label="City">
          <input
            id="field-city"
            type="text"
            value={fields.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Newark"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>

        <Field label="ZIP" hint="Helps us match pickup geography in Essex County.">
          <input
            id="field-zip"
            type="text"
            value={fields.zip}
            onChange={(e) => set('zip', e.target.value)}
            placeholder="07103"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </Field>
      </div>

      <Field label="How would you like to partner?" required error={errors.partnershipInterests}>
        <div id="field-partnershipInterests" className="grid sm:grid-cols-2 gap-2" role="group">
          {PARTNERSHIP_INTEREST_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-3 cursor-pointer select-none border border-gray-200 rounded-lg px-4 py-3 hover:border-green-400"
            >
              <input
                type="checkbox"
                checked={fields.partnershipInterests.includes(opt)}
                onChange={() => toggleInterest(opt)}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-gray-700 text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Capacity / Notes" hint="Available days, space, number of families served, etc. (optional)">
        <textarea
          id="field-notes"
          value={fields.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={4}
          placeholder="We can host a pickup every Saturday morning and have space for about 50 families..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </Field>

      <Field label="Website / Social (optional)">
        <input
          id="field-website"
          type="text"
          value={fields.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </Field>

      <Field error={errors.consent}>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            id="field-consent"
            type="checkbox"
            checked={fields.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-gray-700 text-sm">
            I agree to be contacted about partnering with Seed &amp; Spoon. <span className="text-red-500">*</span>
          </span>
        </label>
      </Field>

      {status === 'error' && serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto bg-[#2d5a27] hover:bg-[#1f3f1b] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-10 rounded-full transition text-lg"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Partner Inquiry'}
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
    <section className="bg-gradient-to-br from-[#2d5a27] to-[#1f3f1b] text-white py-20 md:py-28">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Become a Community Partner</h1>
        <p className="text-xl text-green-100 leading-relaxed max-w-2xl mx-auto">
          Help us reach Essex County families with the meals, resources, and dignity they deserve.
        </p>
        <a
          href="#intake-form"
          className="inline-block mt-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 px-8 rounded-full transition text-lg"
        >
          Start the Conversation
        </a>
      </div>
    </section>
  );
}

function WhoWePartnerWith() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Partner With</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We don&apos;t just feed people, we see them — and that starts with the community
            organizations already rooted in their neighborhoods.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
          {WHO_WE_PARTNER_WITH.map((item) => (
            <div
              key={item.label}
              className="border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3" aria-hidden="true">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeCanWorkTogether() {
  return (
    <section className="py-20 bg-[#f9f6f0]">
      <div className="container mx-auto px-6 max-w-5xl">
        <header className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Can Work Together</h2>
        </header>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-[#2d5a27] mb-4">Right Now</h3>
            <ul className="space-y-3">
              {RIGHT_NOW.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[#2d5a27] text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-[#2d5a27] mb-4">As We Grow</h3>
            <ul className="space-y-3">
              {AS_WE_GROW.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[#2d5a27] text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntakeFormSection() {
  return (
    <section id="intake-form" className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-2xl">
        <header className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Your Organization</h2>
          <p className="text-gray-500">
            Fill out the form below and our team will follow up to talk through next steps.
          </p>
        </header>
        <div className="bg-[#f9f6f0] rounded-2xl p-8 sm:p-10">
          <CommunityPartnerForm />
        </div>
      </div>
    </section>
  );
}

export default function CommunityPartnersClient() {
  return (
    <main className="bg-white pt-16 md:pt-20 lg:pt-24">
      <Hero />
      <WhoWePartnerWith />
      <HowWeCanWorkTogether />
      <IntakeFormSection />
    </main>
  );
}
