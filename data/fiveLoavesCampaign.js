/**
 * 5 Loaves Weekend Meals — pilot campaign page copy and configuration.
 *
 * Source of truth: docs/campaigns/five-loaves-pilot-page-copy.md (final copy, Janelle).
 * Copy changes go in that doc first; then update the strings here to match.
 * Rendered by app/campaigns/five-loaves/page.jsx and the card on app/causes/page.jsx.
 * Edit the copy here, not in the components.
 */

export const FIVE_LOAVES_SLUG = 'five-loaves';

/** $ of food per weekend kit (8 meals + 5 snacks, budgeted at $5 per meal equivalent). */
export const KIT_COST = 50;
export const TOTAL_KITS = 375; // 25 children x 15 weekends
export const PHASE_1_GOAL = KIT_COST * TOTAL_KITS; // $18,750
/** The pilot starts once this share of the goal is raised. */
export const START_THRESHOLD = 0.75;

/**
 * Launch gates. These track the "Before launch" checklist in the copy doc.
 *  - launched: false keeps the page out of search engines and hides the Causes card.
 *  - schoolNameApproved: set true only once Michelle Obama Elementary has given
 *    written OK to be named on a fundraising page. Until then, the page uses a
 *    generic description.
 */
export const LAUNCH = {
  launched: false,
  schoolNameApproved: false,
};

export const SCHOOL = {
  name: 'Michelle Obama Elementary School',
  genericName: 'a Newark elementary school',
};

const donate = (amountDollars, { monthly = false } = {}) =>
  `/donate?campaign=${FIVE_LOAVES_SLUG}&amount=${amountDollars * 100}${monthly ? '&interval=month' : ''}&source=five_loaves`;

export const fiveLoaves = {
  title: '5 Loaves Weekend Meals',
  metaDescription:
    'Help Seed & Spoon bring weekend meals to 25 Newark children. $50 covers the food in one child’s weekend kit: eight prepared meals and five snacks.',

  hero: {
    headline: 'Help us bring weekend meals to 25 Newark children.',
    body:
      'More than 100 families have reached out to Seed & Spoon for food support, representing more than 300 children and teens. The youngest was 3 months old. The oldest was 18. Those inquiries showed us how much families were looking for help and gave us a clearer picture of where to start.',
    stats: [
      {
        label: 'Who reached out',
        items: [
          { value: '100+', text: 'families' },
          { value: '300+', text: 'children and teens' },
        ],
      },
      {
        label: 'Who this pilot serves',
        items: [
          { value: 'Up to 25', text: 'children (about 15 families)' },
          { value: '3,000', text: 'meals and 1,875 snacks over 15 weekends' },
        ],
      },
    ],
    primaryCta: { label: 'Fund a weekend kit — $50', href: donate(50) },
  },

  pilot: {
    heading: 'The pilot',
    paragraphs: [
      'We started with a plan to serve five families over eight weeks. The redesigned 5 Loaves pilot is built to serve up to 25 children across about 15 Newark families over 15 weekends.',
      'Each enrolled child receives a kit with eight prepared meals and five snacks: seven meals covering Friday dinner through Sunday dinner, plus one extra meal for whenever the family needs it.',
    ],
    /** {school} is replaced with the school name, or the generic name until approved. */
    schoolParagraph:
      'Our first school partner, {school}, will help refer families and serve as a drop-off site. Seed & Spoon will prepare, pack, and deliver the kits.',
    selection: {
      heading: 'How families are selected',
      paragraphs: [
        'Because more families reached out than the pilot can serve, we’ll select participants by random lottery among eligible applicants. Enrollment closes when we reach 25 children or 15 families, whichever comes first.',
        'Every family who applies hears back. Families not selected join a waitlist and receive a list of other food resources in Essex County. If an enrolled family leaves the pilot, we offer their spot to the next family on the waitlist.',
      ],
      callout: 'Every 25 children funded is another cohort off the waitlist.',
    },
  },

  gift: {
    heading: 'How your gift works',
    lead: '$50 covers the food in one child’s weekend kit: eight prepared meals and five snacks.',
    body:
      'We budget each kit at $5 per meal equivalent. At full capacity, the pilot’s 375 kits come to an estimated $18,750 in food costs. Our full campaign goal will add kitchen time, packaging, and delivery once those estimates are final.',
    options: [
      { amount: 5, label: 'Feeds one child one meal' },
      { amount: 50, label: 'Covers the food in one child’s weekend kit' },
      { amount: 250, label: 'Covers food for one child for five weekends' },
      { amount: 750, label: 'Covers food for one child for the whole pilot' },
      { amount: 18750, label: 'Covers food for all 25 children' },
    ].map((o) => ({ ...o, href: donate(o.amount) })),
    monthly: {
      label: '$50 a month sponsors one child’s weekend, every month.',
      href: donate(50, { monthly: true }),
    },
    phasesHeading: 'Campaign goal, in phases',
    phases: [
      { name: 'Phase 1 – Food', goal: '$18,750', note: 'live now', live: true },
      {
        name: 'Phase 2 – Kitchen, packaging, and delivery',
        goal: null,
        note: 'goal added when the full pilot budget is final',
        live: false,
      },
    ],
    thresholdLead: 'We begin when we reach 75% of our goal.',
    thresholdBody:
      'We’ll keep raising the rest while kits go out. If we don’t reach the full goal, we’ll size the cohort so every enrolled child is covered for all 15 weekends.',
    thresholdMarkerLabel: 'Pilot starts here',
    giftUse:
      'Gifts to this campaign support 5 Loaves. Funds raised beyond the pilot’s needs will support future 5 Loaves cohorts and related Seed & Spoon youth hunger programs.',
  },

  privacy: {
    heading: 'Our privacy commitment',
    paragraphs: [
      'We protect the privacy of every family we serve. We never share names, photos, or personal details of the families or children in our programs, and we report only combined totals.',
      'This applies to everyone, including our largest donors. We share a family’s information only when that family has given us written permission, and only what they agreed to. A family’s decision to share or not never affects their place in the program.',
    ],
  },

  measure: {
    heading: 'What we’ll measure',
    intro:
      'During the pilot, we’ll track what it costs to prepare and deliver each kit, whether kits arrive on time, and how well the meals work for families.',
    rows: [
      { what: 'All-in cost per kit', how: 'Actual cost compared with the $50 food baseline' },
      { what: 'On-time delivery', how: 'Share of kits at the drop-off site by Friday dismissal' },
      { what: 'Pickup rate', how: 'Share of enrolled children picking up each week' },
      { what: 'Family feedback', how: 'Short check-ins at weeks 1, 8, and 15' },
      { what: 'Food security', how: 'USDA six-item screener at enrollment and at the end' },
      { what: 'Food waste', how: 'What families report going uneaten' },
    ],
    liveHeading: 'Live progress (updates weekly)',
    liveNote: 'All figures are combined totals. Nothing shown can identify a family.',
    closing: 'What we learn will help us plan how to reach more children.',
  },

  causesCard: {
    title: '5 Loaves Weekend Meals',
    body:
      '300+ Newark children were referred to us. Help us send the first 25 home each Friday with a weekend of meals, for 15 weeks.',
    cta: 'Give now',
  },
};

/**
 * Weekly pilot progress. Combined totals only, never per-family data.
 * Staff update these once a week. Leave weekendsCompleted at 0 until the first kits go out.
 */
export const LIVE_PROGRESS = {
  weekendsCompleted: 0,
  kitsDelivered: 0,
  childrenServed: 0,
  totalWeekends: 15,
};
