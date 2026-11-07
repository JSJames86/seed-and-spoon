import { campaignDonateHref } from '@/data/campaignShared';

export const FORMULA_SLUG = 'formula-supplement-pilot';

export const FORMULA_DEFAULT_CONFIG = {
  goal_basis: 'cans',
  cans_per_baby_per_weekend: 2,
  weekends: 15,
  babies_min: 5,
  babies_max: 10,
  price_per_can_cents: 3264,
  shipping_cents: null,
  tax_cents: null,
};

export const FORMULA_PRESET_UNITS = [
  { cans: 1, label: 'One can of formula' },
  { cans: 2, label: 'One baby’s formula for a weekend' },
  { cans: 10, label: 'One baby for five weekends' },
  { cans: 30, label: 'One baby for the whole pilot' },
];

export const formulaDonateHref = (amountDollars) =>
  campaignDonateHref(FORMULA_SLUG, amountDollars, { source: 'formula_pilot' });

export const formula = {
  title: 'Formula Supplement Pilot',
  metaDescription:
    'Help Seed & Spoon provide supplemental weekend infant formula for 5 to 10 Newark babies over 15 weekends, alongside our 5 Loaves weekend meals.',
  hero: {
    headline: 'Weekend formula support for Newark babies',
    paragraphs: [
      'When families reached out to Seed & Spoon for food support, some of the children were infants. Our 5 Loaves weekend meals are for children who eat solid food, so we’re adding a small pilot to help families with babies too.',
      'The Formula Supplement Pilot provides supplemental weekend formula for 5 to 10 babies over the same 15 weekends as 5 Loaves. We’re budgeting two cans per baby each weekend, 150 to 300 cans in all.',
    ],
  },
  howItWorks: {
    heading: 'How it works',
    items: [
      'Families tell us the exact formula their baby uses and the can size when they apply. We provide that formula, so no baby has to switch.',
      'This support adds to what families already receive, such as WIC. It does not replace it.',
      'Final quantities are set after we review applications and supplier quotes.',
    ],
  },
  safety: {
    heading: 'Safety',
    items: [
      'We provide only new, sealed, unexpired cans bought from suppliers.',
      'We do not accept donated cans, opened containers, or homemade formula.',
      'We check every product against current recall notices before it goes out.',
    ],
  },
  gift: {
    heading: 'How your gift works',
    leadTemplate:
      'We budget about {perCan} per can, based on current Similac case pricing. {perWeekend} covers one baby’s formula for a weekend.',
    pendingLead: 'We’re confirming prices now.',
    progressLabel: 'cans funded',
    extrasNote:
      'Goal covers formula at our current budgeting price. Shipping and tax will be added once supplier quotes are final.',
    giftUse:
      'Gifts to this campaign support the Formula Supplement Pilot. Funds raised beyond the pilot’s needs will support future infant and youth food programs at Seed & Spoon.',
  },
  families: {
    text: 'Looking for formula support for your baby?',
    linkLabel: 'Join the interest list',
  },
  causesCard: {
    title: 'Formula Supplement Pilot',
    body: 'Some of the children referred to us are babies. Help us provide weekend formula for up to 10 infants over 15 weeks.',
    pending: 'Goal coming soon',
    cta: 'Give now',
  },
};
