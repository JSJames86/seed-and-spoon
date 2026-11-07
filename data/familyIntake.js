/**
 * Family intake (Get Help page) — options and wording.
 *
 * Read by components/get-help/FamilyIntakeForm.jsx, components/get-help/ReferralIntakeForm.jsx,
 * app/api/applications/route.ts and app/api/referrals/route.ts. The APIs validate against these
 * lists, so change options here.
 */

export const ALLERGENS = [
  { key: 'milk_dairy', label: 'Milk / Dairy' },
  { key: 'egg', label: 'Egg' },
  { key: 'peanut', label: 'Peanut' },
  { key: 'tree_nuts', label: 'Tree Nuts' },
  { key: 'fish', label: 'Fish' },
  { key: 'shellfish', label: 'Shellfish' },
  { key: 'wheat_gluten', label: 'Wheat / Gluten' },
  { key: 'soy', label: 'Soy' },
  { key: 'sesame', label: 'Sesame' },
  { key: 'other', label: 'Other' },
];

export const SEVERITIES = [
  { key: 'I', label: 'Sensitivity', help: 'Upset stomach or discomfort' },
  { key: 'A', label: 'Allergy', help: 'Must avoid completely' },
  { key: 'S', label: 'Severe', help: 'Life-threatening (EpiPen)' },
];

export const FORMULA_BRANDS = [
  { key: 'similac', label: 'Similac' },
  { key: 'enfamil', label: 'Enfamil' },
];

export const FORMULA_TYPES = [
  { key: 'regular', label: 'Regular' },
  { key: 'sensitive', label: 'Sensitive' },
];

export const DIETARY_OPTIONS = [
  { key: 'halal', label: 'Halal' },
  { key: 'kosher', label: 'Kosher' },
  { key: 'no_pork', label: 'No pork' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
];

export const CONTACT_METHODS = [
  { key: 'call', label: 'Phone call' },
  { key: 'text', label: 'Text message' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
];

export const LANGUAGES = [
  { key: 'english', label: 'English' },
  { key: 'spanish', label: 'Español' },
  { key: 'portuguese', label: 'Português' },
  { key: 'haitian_creole', label: 'Kreyòl Ayisyen' },
  { key: 'french', label: 'Français' },
  { key: 'other', label: 'Other' },
];

/** Where kits can be dropped off. We only deliver to these three kinds of places. */
export const DROPOFF_METHODS = [
  {
    key: 'home',
    label: 'At my home',
    help: 'The address below. Someone needs to be home, or tell us a safe spot.',
  },
  {
    key: 'school',
    label: 'At my child’s school',
    help: 'Only schools that partner with Seed & Spoon. If your child’s school isn’t a partner yet, we’ll offer a community location instead.',
  },
  {
    key: 'community',
    label: 'At a community location',
    help: 'A church, community center, or other partner site near you. We’ll tell you where.',
  },
];

export const REHEAT_OPTIONS = [
  { key: 'yes', label: 'Yes, a refrigerator and a microwave or stove' },
  { key: 'limited', label: 'Limited (for example, a mini fridge only)' },
  { key: 'no', label: 'No' },
];

/**
 * Referral types. `upload` means the family attaches the document;
 * `partner` means the referrer sends it to us through the Partner Referral form.
 */
export const REFERRAL_TYPES = [
  {
    key: 'snap_letter',
    label: 'SNAP award or benefit letter',
    how: 'upload',
    help: 'Your current SNAP (food stamps) letter.',
  },
  {
    key: 'wic_letter',
    label: 'WIC certification or benefit letter',
    how: 'upload',
    help: 'Your current WIC letter or certification.',
  },
  {
    key: 'school_letter',
    label: 'Letter from a school administrator or staff',
    how: 'upload',
    help: 'From a principal, counselor, social worker, or family liaison at your child’s school.',
  },
  {
    key: 'advocate_letter',
    label: 'Letter from a parent advocate',
    how: 'upload',
    help: 'From a parent advocate or case worker who knows your family.',
  },
  {
    key: 'faith_letter',
    label: 'Letter from a church or faith leader',
    how: 'upload',
    help: 'From a pastor, minister, imam, rabbi, or other official at your place of worship.',
  },
  {
    key: 'partner_sending',
    label: 'Someone is sending a referral for me',
    how: 'partner',
    help: 'A school, advocate, faith leader, or agency will send us the referral directly.',
  },
];

export const REFERRER_ROLES = [
  { key: 'school', label: 'School administrator or staff' },
  { key: 'advocate', label: 'Parent advocate or case worker' },
  { key: 'faith', label: 'Church or faith leader' },
  { key: 'wic_social_service', label: 'WIC or social service staff' },
  { key: 'other', label: 'Other community organization' },
];

export const REFERRAL_UPLOAD = {
  maxBytes: 4 * 1024 * 1024,
  accept: 'application/pdf,image/jpeg,image/png,image/webp',
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  retentionDays: 30,
};

export const INTAKE_COPY = {
  noIncome:
    'We never ask for your income, Social Security number, or immigration status. A referral is all we need.',
  coverInfo:
    'Before you upload, cover or cross out income amounts, case numbers, and any Social Security numbers. We only need to see your name, your children’s names, and the date.',
  matchRule:
    'We can only enroll the adults and children named on your SNAP or WIC letter, so list the same household here.',
  docRetention:
    'Only our intake team can see your document. We use it to confirm your referral and delete it automatically after 30 days.',
  privacyPromise:
    'I understand Seed & Spoon will never post or share my name, my children’s names, photos, or any of my information without my written permission.',
  socialReshare:
    'If I post about Seed & Spoon on social media, Seed & Spoon may reshare or quote my public post to promote the program. Seed & Spoon will not add any of my information beyond what I posted.',
  socialReshareNote: 'Optional. Your answer never affects your place in the program.',
  lottery:
    'Submitting this form does not guarantee a spot. When more families apply than we can serve, we choose by random lottery among eligible families, and everyone hears back.',
};
