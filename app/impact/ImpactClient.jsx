'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

// ─── Static data ────────────────────────────────────────────────────────────

const DEFAULT_SUMMARY = {
  mealsDelivered: 1247,
  youthServed: 89,
  activeVolunteers: 14,
  citiesCovered: 3,
  donationsReceived: 8430,
  costPerMeal: 2.85,
  repeatRecipients: 62,
  lastUpdated: '2026-05-01T00:00:00Z',
  dataSource: 'static',
};

const DEFAULT_MONTHLY = [
  { month: "May '25", meals: 25 },
  { month: "Jun '25", meals: 38 },
  { month: "Jul '25", meals: 55 },
  { month: "Aug '25", meals: 72 },
  { month: "Sep '25", meals: 89 },
  { month: "Oct '25", meals: 108 },
  { month: "Nov '25", meals: 134 },
  { month: "Dec '25", meals: 156 },
  { month: "Jan '26", meals: 128 },
  { month: "Feb '26", meals: 112 },
  { month: "Mar '26", meals: 167 },
  { month: "Apr '26", meals: 120 },
];

const ACTIVITY = [
  { icon: '🍽️', text: '120 meals delivered in Newark', time: '4 days ago' },
  { icon: '🤝', text: '2 new volunteers joined the kitchen crew', time: '6 days ago' },
  { icon: '💚', text: '$150 donation received', time: '1 week ago' },
  { icon: '📍', text: 'East Orange Community Center added as partner', time: '2 weeks ago' },
  { icon: '🎉', text: '1,000 total meals milestone reached!', time: '3 weeks ago' },
];

const TRANSPARENCY = [
  { label: 'Kitchen Operations & Food Costs', pct: 62, desc: 'Ingredients, packaging, kitchen rental, food safety supplies' },
  { label: 'Transportation & Delivery', pct: 18, desc: 'Fuel, vehicle maintenance, refrigerated transport' },
  { label: 'Volunteer Training & Support', pct: 10, desc: 'ServSafe certifications, onboarding, volunteer appreciation' },
  { label: 'Administrative & Operations', pct: 7, desc: 'Staff, insurance, software, accounting' },
  { label: 'Community Outreach', pct: 3, desc: 'Partnership building, fundraising, communications' },
];

const STORIES = [
  {
    quote: 'We were struggling after a job loss. Seed & Spoon showed up every week without fail — fresh meals, no questions. It kept our family going.',
    attribution: 'Newark resident, family of 4',
    icon: '❤️',
  },
  {
    quote: "I started volunteering just to do something meaningful. Now I'm here three times a week. You see the numbers go up and you feel it.",
    attribution: 'Kitchen volunteer, Irvington',
    icon: '🤝',
  },
  {
    quote: 'Every $5 donation becomes two real meals for a real person. That traceability is what makes Seed & Spoon different from anything I\'ve supported.',
    attribution: 'Monthly donor',
    icon: '💚',
  },
];

// ─── Hooks ──────────────────────────────────────────────────────────────────

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ─── MetricCard ─────────────────────────────────────────────────────────────

const CARD_COLORS = {
  green:  'from-green-50  to-green-100  border-green-200',
  orange: 'from-orange-50 to-orange-100 border-orange-200',
  teal:   'from-teal-50   to-teal-100   border-teal-200',
  blue:   'from-blue-50   to-blue-100   border-blue-200',
  purple: 'from-purple-50 to-purple-100 border-purple-200',
};

const VALUE_COLORS = {
  green:  'text-green-700',
  orange: 'text-orange-600',
  teal:   'text-teal-700',
  blue:   'text-blue-700',
  purple: 'text-purple-700',
};

function MetricCard({ icon, value, label, prefix = '', suffix = '', color = 'green' }) {
  const [ref, inView] = useInView(0.4);
  const count = useAnimatedCounter(value, 2000, inView);
  const display = Math.round(count).toLocaleString('en-US');

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${CARD_COLORS[color] || CARD_COLORS.green} border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow`}
    >
      <span className="text-3xl mb-3" aria-hidden="true">{icon}</span>
      <div className={`text-4xl md:text-5xl font-bold font-display mb-2 tabular-nums ${VALUE_COLORS[color] || VALUE_COLORS.green}`}>
        {prefix}{display}{suffix}
      </div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Line Chart ─────────────────────────────────────────────────────────────

function MealsLineChart({ data }) {
  const W = 720, H = 240;
  const pad = { t: 16, r: 20, b: 52, l: 48 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const maxVal = Math.max(...data.map(d => d.meals), 1);
  const ceil = Math.ceil(maxVal / 50) * 50;

  const toX = i => pad.l + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2);
  const toY = v => pad.t + cH - (v / ceil) * cH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.meals), ...d }));

  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const pp = pts[i - 1];
      const mx = ((pp.x + p.x) / 2).toFixed(1);
      return `C ${mx} ${pp.y.toFixed(1)}, ${mx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(' ');

  const last = pts[pts.length - 1];
  const first = pts[0];
  const bottom = (pad.t + cH).toFixed(1);
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${bottom} L ${first.x.toFixed(1)} ${bottom} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    val: Math.round(ceil * t),
    y: toY(ceil * t),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Meals delivered per month over the past 12 months"
    >
      <defs>
        <linearGradient id="mealAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FAF3B" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4FAF3B" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(({ y }, i) => (
        <line
          key={i}
          x1={pad.l} y1={y.toFixed(1)}
          x2={W - pad.r} y2={y.toFixed(1)}
          stroke="#e5e7eb" strokeWidth="1"
          strokeDasharray={i > 0 ? '4 4' : '0'}
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map(({ val, y }, i) => (
        <text
          key={i}
          x={pad.l - 6} y={(y + 4).toFixed(1)}
          textAnchor="end" fontSize="10" fill="#9ca3af"
        >
          {val}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#mealAreaGrad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#4FAF3B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(1)} cy={p.y.toFixed(1)}
          r="4" fill="#4FAF3B" stroke="white" strokeWidth="2"
        />
      ))}

      {/* X-axis labels — every other to avoid crowding */}
      {pts.map((p, i) =>
        i % 2 === 0 ? (
          <text
            key={i}
            x={p.x.toFixed(1)} y={H - 10}
            textAnchor="middle" fontSize="10" fill="#9ca3af"
          >
            {p.month}
          </text>
        ) : null
      )}
    </svg>
  );
}

// ─── Transparency Bar ────────────────────────────────────────────────────────

function TransparencyBar({ label, pct, desc, index }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="text-sm font-bold text-orange-300">{pct}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 mb-1.5">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out"
          style={{
            width: inView ? `${pct}%` : '0%',
            transitionDelay: `${index * 120}ms`,
          }}
        />
      </div>
      <p className="text-xs text-green-200/60">{desc}</p>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ImpactClient() {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [monthly, setMonthly] = useState(DEFAULT_MONTHLY);

  useEffect(() => {
    Promise.all([
      fetch('/api/impact/summary').then(r => r.json()),
      fetch('/api/impact/meals-over-time').then(r => r.json()),
    ])
      .then(([s, m]) => {
        setSummary(s);
        if (Array.isArray(m?.data) && m.data.length) setMonthly(m.data);
      })
      .catch(() => {});
  }, []);

  const updatedDate = summary.lastUpdated
    ? new Date(summary.lastUpdated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'May 2026';

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-green-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            Impact Dashboard
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-display mb-5 leading-tight">
            Real Numbers.<br className="hidden md:block" /> Real People. Real Change.
          </h1>

          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            We believe transparency builds trust. Here&rsquo;s exactly what your support has made possible since we started serving Newark.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-green-200/70">
            <span>Updated: {updatedDate}</span>
            <span aria-hidden="true">·</span>
            {summary.dataSource === 'live' ? (
              <span className="inline-flex items-center gap-1.5 text-green-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                Live data
              </span>
            ) : (
              <span className="text-yellow-300/80">Sample data</span>
            )}
            <span aria-hidden="true">·</span>
            <span>Newark, NJ &amp; surrounding areas</span>
          </div>
        </div>
      </section>

      {/* ── Hero Metrics ──────────────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-16 md:py-20" aria-labelledby="metrics-heading">
        <div className="container mx-auto px-6">
          <h2 id="metrics-heading" className="sr-only">Impact metrics</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            <MetricCard icon="🍽️" value={summary.mealsDelivered} label="Meals Delivered" color="green" />
            <MetricCard icon="👥" value={summary.youthServed}    label="Youth Served"     color="orange" />
            <MetricCard icon="🤝" value={summary.activeVolunteers} label="Active Volunteers" color="teal" />
            <MetricCard icon="📍" value={summary.citiesCovered}  label="Areas Covered"    color="blue" />
            <MetricCard icon="💰" value={summary.donationsReceived} label="Donations Raised" prefix="$" color="purple" />
          </div>

          {/* Secondary row */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-10 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">${summary.costPerMeal.toFixed(2)}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Avg cost per meal</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200 self-center" aria-hidden="true" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{summary.repeatRecipients}%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Repeat recipients</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200 self-center" aria-hidden="true" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{summary.citiesCovered}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Distribution sites</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-gray-200 self-center" aria-hidden="true" />
            <div>
              <div className="text-2xl font-bold text-gray-800">Apr &lsquo;26</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Last distribution</div>
            </div>
          </div>

          {summary.dataSource === 'static' && (
            <p className="text-center text-xs text-gray-400 mt-8 max-w-md mx-auto">
              These are representative figures. Live tracking coming soon as operations scale.
            </p>
          )}
        </div>
      </section>

      {/* ── Meals Over Time ───────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="chart-heading">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-10">
            <h2 id="chart-heading" className="text-2xl md:text-4xl font-bold font-display text-gray-900 mb-3">
              Meals Delivered Over Time
            </h2>
            <p className="text-gray-400 text-sm">
              Consistent growth means consistent trust &mdash; 12-month view
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
            <MealsLineChart data={monthly} />
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Each data point represents completed meal distributions for that calendar month.
          </p>
        </div>
      </section>

      {/* ── Activity + Efficiency ─────────────────────────────── */}
      <section className="bg-[#F8F6F0] py-16 md:py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Activity feed */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>

              <ul className="space-y-0" role="list">
                {ACTIVITY.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-4 items-start py-4 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Efficiency metrics */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Efficiency Metrics</h2>

              <dl className="divide-y divide-gray-50">
                {[
                  {
                    label: 'Cost per Meal',
                    sub: 'Total donations ÷ meals served',
                    value: `$${summary.costPerMeal.toFixed(2)}`,
                    color: 'text-green-700',
                  },
                  {
                    label: 'Repeat Recipients',
                    sub: 'Return monthly for consistent meals',
                    value: `${summary.repeatRecipients}%`,
                    color: 'text-green-700',
                  },
                  {
                    label: 'Youth Under 18',
                    sub: 'Of all individuals served',
                    value: summary.youthServed,
                    color: 'text-orange-600',
                  },
                  {
                    label: 'Active Distribution Sites',
                    sub: 'Newark, Irvington, East Orange',
                    value: summary.citiesCovered,
                    color: 'text-green-700',
                  },
                ].map(({ label, sub, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-4">
                    <div>
                      <dt className="text-sm font-semibold text-gray-700">{label}</dt>
                      <dd className="text-xs text-gray-400 mt-0.5 font-normal">{sub}</dd>
                    </div>
                    <div className={`text-2xl font-bold ${color}`} aria-label={`${label}: ${value}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transparency ──────────────────────────────────────── */}
      <section
        className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-16 md:py-20"
        aria-labelledby="transparency-heading"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 id="transparency-heading" className="text-2xl md:text-4xl font-bold font-display text-white mb-3">
              Where Your Donation Goes
            </h2>
            <p className="text-green-200 text-sm">
              90 cents of every dollar goes directly to program delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              {TRANSPARENCY.map((item, i) => (
                <TransparencyBar key={item.label} {...item} index={i} />
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-6 md:p-8 border border-white/15">
              <h3 className="text-white font-bold text-lg mb-4">Our Commitment</h3>
              <p className="text-green-100 text-sm leading-relaxed mb-4">
                We keep administrative costs under 10% so the overwhelming majority of every contribution
                funds food, cooking, and delivery — not overhead.
              </p>
              <ul className="text-sm text-green-100 space-y-2 mb-6">
                <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">✓</span> <span><strong>$5</strong> feeds two people</span></li>
                <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">✓</span> <span><strong>$25</strong> covers a week of meals for one youth</span></li>
                <li className="flex gap-2"><span className="text-green-400 flex-shrink-0">✓</span> <span><strong>$100</strong> funds a full distribution day</span></li>
              </ul>
              <Link
                href="/donate"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg hover:shadow-xl"
              >
                Donate Now →
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="/reports/seed-spoon-impact-2024.pdf"
              className="inline-flex items-center gap-2 text-green-200/60 hover:text-green-100 text-sm transition-colors"
            >
              <span aria-hidden="true">↓</span>
              Download our 2024 Impact Report (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* ── Stories ───────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="stories-heading">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 id="stories-heading" className="text-2xl md:text-4xl font-bold font-display text-gray-900 mb-3">
              The Numbers Have Faces
            </h2>
            <p className="text-gray-400 text-sm">Behind every meal is a real person in our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STORIES.map((story, i) => (
              <article key={i} className="bg-[#F8F6F0] rounded-2xl p-6 border border-gray-100 flex flex-col">
                <span className="text-3xl mb-4" aria-hidden="true">{story.icon}</span>
                <blockquote className="text-gray-700 text-sm leading-relaxed italic mb-4 flex-1">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <footer className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  — {story.attribution}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 py-16 md:py-20 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-2xl md:text-4xl font-bold font-display mb-4">
            Be Part of This Story
          </h2>
          <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Every dollar, every volunteer hour, every shared post adds to these numbers. Join us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/donate"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="bg-white/15 hover:bg-white/25 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg border border-white/30"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
