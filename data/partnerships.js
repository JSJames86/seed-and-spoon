/**
 * Partnership kit — shared copy and form options.
 *
 * Read by app/partners/page.jsx (hub), app/partners/community, app/partners/corporate,
 * components/partners/PartnerInterestForm.jsx and app/api/partners/community/route.ts.
 * The API validates submitted values against ORGANIZATION_TYPES and PARTNERSHIP_ROLES,
 * so change options here, not in the components.
 *
 * Roles marked `status: 'now'` are open during the 5 Loaves pilot. `'growing'` roles are
 * listed so partners can say they're interested, without promising an arrangement yet.
 */

export const ORGANIZATION_TYPES = [
  'K–12 school',
  'Social service agency',
  'College / University',
  'Municipality / Government',
  'Church / Faith community',
  'Community center',
  'Youth group',
  'Social / Civic group',
  'Small business',
  'Corporation',
  'Other',
];

export const BUSINESS_TYPES = ['Small business', 'Corporation'];

/** Each role has a stable form value (`value`) that is stored in community_partners.partnership_interests. */
export const PARTNERSHIP_ROLES = [
  {
    id: 'fund',
    value: 'Sponsor meals or fund the pilot',
    title: 'Fund the pilot',
    body: 'Sponsor weekend meal kits or a full weekend for every child in the pilot.',
    status: 'now',
  },
  {
    id: 'fundraise',
    value: 'Host a fundraiser or giving campaign',
    title: 'Rally your community',
    body: 'Run a giving campaign, special offering, give-back night, or drive with its own Seed & Spoon page.',
    status: 'now',
  },
  {
    id: 'in-kind',
    value: 'Donate goods or professional services',
    title: 'Give goods or services',
    body: 'Packaging, insulated bags, printing, equipment, or professional skills like accounting or design.',
    status: 'now',
  },
  {
    id: 'pickup',
    value: 'Host a pickup site',
    title: 'Host a pickup site',
    body: 'A dependable location, one contact person, and a set weekly handoff time for meal kits.',
    status: 'now',
  },
  {
    id: 'research',
    value: 'Research or student project',
    title: 'Research and learning',
    body: 'A faculty-supervised project with a clear deliverable, such as helping evaluate the pilot.',
    status: 'now',
  },
  {
    id: 'connect',
    value: 'Make introductions / community coordination',
    title: 'Open doors',
    body: 'Introductions to funders, local businesses, or other organizations working on food access.',
    status: 'now',
  },
  {
    id: 'refer',
    value: 'Refer families',
    title: 'Refer families',
    body: 'Share our application with families. Interest already exceeds pilot capacity, so we’ll build this out with future cohorts.',
    status: 'growing',
  },
  {
    id: 'kitchen',
    value: 'Offer licensed commercial kitchen space',
    title: 'Share kitchen space',
    body: 'Licensed commercial kitchen time as our meal production grows.',
    status: 'growing',
  },
  {
    id: 'volunteers',
    value: 'Provide volunteers (as roles open)',
    title: 'Volunteer as a group',
    body: 'Team volunteer days once our screening and safeguarding steps are in place for each role.',
    status: 'growing',
  },
];

/** Older option labels still accepted by the API so old links and saved drafts keep working. */
export const LEGACY_PARTNERSHIP_VALUES = {
  'Offer commercial kitchen space': 'Offer licensed commercial kitchen space',
  'Provide volunteers': 'Provide volunteers (as roles open)',
  'Funding collaboration': 'Sponsor meals or fund the pilot',
};

export const PARTNERSHIP_ROLE_VALUES = PARTNERSHIP_ROLES.map((r) => r.value);

/** Audience paths on the hub page. */
export const PARTNER_AUDIENCES = [
  {
    id: 'schools',
    title: 'Schools & social service agencies',
    firstStep: 'Name one liaison and talk with us about hosting a pickup site or connecting families to future cohorts.',
    href: '/partners/community',
    cta: 'Community partnerships',
  },
  {
    id: 'faith',
    title: 'Faith & community groups',
    firstStep: 'Choose one role, such as a giving campaign or a pickup site, and name a coordinator.',
    href: '/partners/community',
    cta: 'Community partnerships',
  },
  {
    id: 'universities',
    title: 'Colleges & universities',
    firstStep: 'Define one project with a faculty contact and a clear deliverable. Student groups can also adopt us as a philanthropy partner.',
    href: '/partners/community',
    cta: 'Community partnerships',
  },
  {
    id: 'municipal',
    title: 'Municipalities',
    firstStep: 'Name one department contact and one specific resource, introduction, or funding connection.',
    href: '/partners/community',
    cta: 'Community partnerships',
  },
  {
    id: 'business',
    title: 'Small businesses & corporations',
    firstStep: 'Sponsor kits, host a give-back event, match employee gifts, or donate goods and services.',
    href: '/partners/corporate',
    cta: 'Business partnerships',
  },
];

export const PARTNER_PROCESS = [
  { title: 'Tell us what you’d like to offer', body: 'The interest form takes about three minutes. Pick one role to start.' },
  { title: 'We talk about fit', body: 'We follow up to see whether the role fits what the pilot needs right now.' },
  { title: 'We agree on the details', body: 'One contact on each side, a defined contribution, a schedule, and clear responsibilities.' },
  { title: 'We check in', body: 'We review how it’s going at an agreed point, then decide together whether to continue or grow it.' },
];

export const PARTNER_PRIVACY_POINTS = [
  'We never share names, photos, or personal details of the families we serve, including with partners and sponsors.',
  'Pilot families are selected by random lottery among eligible applicants. A referral does not change a family’s chances.',
  'Partners and sponsors receive combined totals and impact reports, never information about individual families.',
];

/** Small business ways to help (business page). */
export const SMALL_BUSINESS_IDEAS = [
  { title: 'Give-back night', body: 'Donate a share of one evening’s sales. We help promote it.' },
  { title: 'Round-up or tabletop QR code', body: 'Customers add a gift at checkout or scan a code that goes straight to the campaign.' },
  { title: 'Sponsor a weekend', body: 'Cover a weekend of kits and be recognized on our sponsor list.' },
  { title: 'Goods and services', body: 'Printing, packaging, insulated bags, delivery, or your professional skills.' },
];

/** Corporate channels (business page). */
export const CORPORATE_CHANNELS = [
  { title: 'Sponsorship', body: 'Fund a defined piece of the pilot, such as a full weekend of meals for every child.' },
  { title: 'Employee giving & matching', body: 'Match employee gifts or run a workplace giving campaign with its own page.' },
  { title: 'Grants & community investment', body: 'We’re a 501(c)(3) public charity and a registered New Jersey charity, ready for grant review.' },
  { title: 'Skilled & in-kind support', body: 'Professional services, equipment, or materials matched to a defined need.' },
];

export const SPONSOR_RECOGNITION = [
  'Your name or logo on our sponsor list and campaign page',
  'Impact reports with combined totals at the end of the pilot',
  'A thank-you you can share with your customers and staff',
];
