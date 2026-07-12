'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

// ─── FAQ Data ────────────────────────────────────────────────────────────────
// Edit content here without touching any UI code.
// Each question supports:
//   q      – question text (required)
//   a      – answer paragraph (required)
//   items  – optional bullet list of strings
//   footer – optional paragraph after the list
//   link   – optional { text, href } inline link appended after the answer

export const FAQ_DATA = [
  {
    id: 'about',
    title: 'About Seed & Spoon',
    icon: '🌱',
    questions: [
      {
        id: 'about-1',
        q: 'What is Seed & Spoon?',
        a: 'Seed & Spoon is a nonprofit focused on providing meals to at-risk youth in Newark, New Jersey. We aim to ensure young people have consistent access to food without barriers.',
      },
      {
        id: 'about-2',
        q: 'Who do you serve?',
        a: 'We serve youth ages 16–25 who may be facing food insecurity, housing instability, or financial hardship.',
      },
      {
        id: 'about-3',
        q: 'Where do you operate?',
        a: 'We currently operate in Newark, NJ, with plans to expand as we grow.',
      },
    ],
  },
  {
    id: 'receiving',
    title: 'Receiving Meals',
    icon: '🍽️',
    questions: [
      {
        id: 'receiving-1',
        q: 'How can I receive meals?',
        a: "We're building simple and accessible ways for youth to receive meals. If you or someone you know needs support, reach out through our contact page.",
      },
      {
        id: 'receiving-2',
        q: 'How do I receive my meal box?',
        a: 'We offer two options:',
        items: [
          'Delivery – Meal boxes can be delivered when available in your area.',
          'Pickup – You can pick up your meal from one of our partner locations at scheduled times.',
        ],
        footer: "You'll be able to choose the option that works best for you.",
      },
      {
        id: 'receiving-3',
        q: 'How will I know where and when to pick up my meal?',
        a: 'Once scheduled, we will send you clear details including location, date, and time.',
      },
      {
        id: 'receiving-4',
        q: 'What do I need to bring for pickup?',
        a: 'Just yourself. We aim to keep the process simple and barrier-free.',
      },
      {
        id: 'receiving-5',
        q: 'Is there a cost?',
        a: 'No. Meals are provided completely free of charge.',
      },
      {
        id: 'receiving-6',
        q: 'How often are meals provided?',
        a: 'This depends on current capacity and donations, but we aim for consistent weekly distribution.',
      },
    ],
  },
  {
    id: 'donations',
    title: 'Donations',
    icon: '💚',
    questions: [
      {
        id: 'donations-1',
        q: 'How are donations used?',
        a: 'Donations go directly toward purchasing food, packaging meals, and supporting distribution. We keep overhead low so the majority of every dollar reaches youth in need.',
      },
      {
        id: 'donations-2',
        q: 'Can I make a recurring donation?',
        a: 'Yes. Recurring donations help us plan ahead and provide consistent support week over week.',
        link: { text: 'Donate now', href: '/donate' },
      },
      {
        id: 'donations-3',
        q: 'Is my donation tax-deductible?',
        a: 'We are currently completing our nonprofit registration. Tax-deductibility status will be updated here once finalized. Thank you for your patience and support.',
      },
    ],
  },
  {
    id: 'volunteering',
    title: 'Volunteering',
    icon: '🤝',
    questions: [
      {
        id: 'volunteering-1',
        q: 'How can I volunteer?',
        a: 'You can sign up through our website or contact us directly. We need help with meal prep, logistics, and community outreach.',
        link: { text: 'Sign up to volunteer', href: '/volunteer' },
      },
      {
        id: 'volunteering-2',
        q: 'Do I need experience?',
        a: "No experience is required. We provide training for every role — if you show up ready to help, we'll take care of the rest.",
      },
      {
        id: 'volunteering-3',
        q: 'Are there group volunteer opportunities?',
        a: "Yes. We welcome groups, schools, faith organizations, and companies. Reach out and we'll coordinate something that works for your team.",
      },
    ],
  },
  {
    id: 'transparency',
    title: 'Transparency & Trust',
    icon: '🔍',
    questions: [
      {
        id: 'transparency-1',
        q: 'How can I see your impact?',
        a: 'Visit our Impact Dashboard to see meals delivered, youth served, and how donations are put to work.',
        link: { text: 'View Impact Dashboard', href: '/impact' },
      },
      {
        id: 'transparency-2',
        q: 'How do you track impact?',
        a: 'We track meals distributed, volunteer hours, and donation usage through our internal system to ensure accuracy and accountability.',
      },
      {
        id: 'transparency-3',
        q: 'Do you partner with other organizations?',
        a: 'We are actively building partnerships with local nonprofits, schools, and community organizations to extend our reach.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: '📬',
    questions: [
      {
        id: 'contact-1',
        q: 'How can I get in touch?',
        a: 'Use the contact form on our website, or email us directly:',
        link: { text: 'seedandspoonnj@gmail.com', href: 'mailto:seedandspoonnj@gmail.com' },
      },
    ],
  },
];

// ─── AccordionItem ───────────────────────────────────────────────────────────

function AccordionItem({ question, isOpen, onToggle }) {
  const { id, q, a, items, footer, link } = question;

  return (
    <div className={`border-b border-gray-100 last:border-0 transition-colors duration-150 ${isOpen ? 'bg-green-50/50' : ''}`}>
      <button
        id={`faq-btn-${id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500"
      >
        <span className={`font-semibold text-base leading-snug transition-colors ${isOpen ? 'text-green-800' : 'text-gray-900'}`}>
          {q}
        </span>
        <span
          aria-hidden="true"
          className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center font-bold text-sm transition-all duration-200 ${
            isOpen
              ? 'bg-green-700 border-green-700 text-white rotate-45'
              : 'bg-white border-gray-200 text-gray-400'
          }`}
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${id}`}
            role="region"
            aria-labelledby={`faq-btn-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed space-y-2.5">
              {a && <p>{a}</p>}

              {items && items.length > 0 && (
                <ul className="space-y-2 mt-1" role="list">
                  {items.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {footer && <p>{footer}</p>}

              {link && (
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-green-700 font-semibold hover:text-green-600 transition-colors"
                >
                  {link.text}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SearchBar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center" aria-hidden="true">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search questions…"
        className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
        aria-label="Search frequently asked questions"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── NoResults ───────────────────────────────────────────────────────────────

function NoResults({ query }) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        No results for &ldquo;{query}&rdquo;
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Try a different term, or browse the sections below. You can also ask us directly.
      </p>
      <a
        href="mailto:seedandspoonnj@gmail.com"
        className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Ask us directly →
      </a>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function FAQClient() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const normalized = query.trim().toLowerCase();

  const visibleSections = normalized
    ? FAQ_DATA.map(section => ({
        ...section,
        questions: section.questions.filter(item => {
          const corpus = [
            item.q,
            item.a ?? '',
            ...(item.items ?? []),
            item.footer ?? '',
          ].join(' ').toLowerCase();
          return corpus.includes(normalized);
        }),
      })).filter(s => s.questions.length > 0)
    : FAQ_DATA;

  const totalResults = visibleSections.reduce((n, s) => n + s.questions.length, 0);
  const totalQuestions = FAQ_DATA.reduce((n, s) => n + s.questions.length, 0);

  function handleSearch(q) {
    setQuery(q);
    setOpenId(null);
  }

  function toggle(id) {
    setOpenId(prev => (prev === id ? null : id));
  }

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white py-16 md:py-24 overflow-hidden">
        {/* Sentinel observed by Header to detect when hero is in view */}
        <div id="hero-sentinel" className="absolute bottom-0 h-px w-full pointer-events-none" />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <span aria-hidden="true">❓</span>
            Help Center
          </div>

          <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Quick answers about meals, donations, volunteering, and how Seed&nbsp;&amp;&nbsp;Spoon works.
          </p>

          <div className="max-w-xl mx-auto">
            <SearchBar value={query} onChange={handleSearch} />
          </div>

          <p className="text-green-300/50 text-xs mt-3">
            {totalQuestions} questions across {FAQ_DATA.length} topics
          </p>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-10 md:py-14 min-h-[50vh]" aria-label="FAQ sections">
        <div className="container mx-auto px-4 max-w-3xl">

          {/* Section jump pills — hidden when searching */}
          {!normalized && (
            <nav aria-label="Jump to section" className="flex flex-wrap gap-2 mb-8">
              {FAQ_DATA.map(section => (
                <a
                  key={section.id}
                  href={`#section-${section.id}`}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-green-400 hover:text-green-800 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  <span aria-hidden="true">{section.icon}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          )}

          {/* Search result count */}
          {normalized && visibleSections.length > 0 && (
            <p className="text-sm text-gray-500 mb-6">
              <strong className="text-gray-800">{totalResults}</strong>{' '}
              {totalResults === 1 ? 'result' : 'results'} for{' '}
              <strong className="text-gray-800">&ldquo;{query}&rdquo;</strong>
            </p>
          )}

          {visibleSections.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <div className="space-y-4">
              {visibleSections.map(section => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-24"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <span className="text-xl" aria-hidden="true">{section.icon}</span>
                    <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                      {section.title}
                    </h2>
                    <span className="ml-auto text-xs text-gray-400 tabular-nums">
                      {section.questions.length}{' '}
                      {section.questions.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>

                  {/* Questions */}
                  {section.questions.map(question => (
                    <AccordionItem
                      key={question.id}
                      question={question}
                      isOpen={openId === question.id}
                      onToggle={() => toggle(question.id)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 py-14 md:py-16 text-white">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-display mb-3">
            Still have questions?
          </h2>
          <p className="text-green-100 mb-8 leading-relaxed">
            We&rsquo;re a small team and we read every message. Reach out and we&rsquo;ll get back to you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:seedandspoonnj@gmail.com"
              className="bg-white text-green-800 font-bold px-7 py-3.5 rounded-xl hover:bg-green-50 transition-colors shadow-md text-sm"
            >
              Email Us
            </a>
            <Link
              href="/get-help"
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-xl transition-colors border border-white/30 text-sm"
            >
              Get Help
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
