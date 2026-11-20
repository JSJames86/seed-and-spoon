/**
 * Donor-Advised Fund (DAF) giving — config + copy for /daf-giving.
 *
 * DAF Direct (dafdirect.org) lets donors recommend a grant from Fidelity
 * Charitable, DAFgiving360 (formerly Schwab Charitable), or the BNY Mellon
 * Charitable Gift Fund straight from our site. Donors with any other sponsor
 * use the EIN fallback block on the page.
 *
 * Grants do NOT flow through our Stripe checkout and DAF Direct gives us no
 * grant tracking, so the "Let us know you gave" link is how we learn who to
 * thank. Fidelity grants arrive via Fidelity's Stripe EFT enrollment.
 */

export const DAF_DESIGNATION = 'Unrestricted: Planting seeds, filling spoons, feeding children';

/**
 * Link generated on dafdirect.org. The EIN (41-4059078) is encoded inside
 * `_dafdirect_settings`; the designation text is encoded in `designatedText`.
 * Generated Nov 20, 2026; decodes to EIN 414059078 and DAF_DESIGNATION.
 */
export const DAF_DIRECT_LINK =
  'https://www.dafdirect.org/DAFDirect/daflink?_dafdirect_settings=NDE0MDU5MDc4XzIxMTFfNjJkMDBhNjItYjUxOS00ZjEwLWExMzUtZGY4YzA4M2U2ZmEw&designatedText=VW5yZXN0cmljdGVkOiBQbGFudGluZyBzZWVkcywgZmlsbGluZyBzcG9vbnMsIGZlZWRpbmcgY2hpbGRyZW4=&amountValue=';

/**
 * DAF Direct widget embed. null until the embed code is generated on
 * dafdirect.org; while null, the page shows the DAF Direct link button.
 * Shape: { scriptSrc: string, containerId: string }
 */
export const DAF_DIRECT_WIDGET = null;

export const DAF_SPONSORS_SUPPORTED = ['Fidelity Charitable', 'DAFgiving360', 'BNY Mellon Charitable Gift Fund'];

export const DAF_NOTIFY_EMAIL = 'donors@seedandspoon.org';

export const dafCopy = {
  meta: {
    title: 'Give Through Your Donor-Advised Fund',
    description:
      'Recommend a grant to Seed & Spoon from your donor-advised fund at Fidelity Charitable, DAFgiving360, BNY Mellon, or any DAF sponsor. Support our work to end childhood food insecurity in New Jersey.',
  },
  hero: {
    title: 'Give Through Your Donor-Advised Fund',
    subtitle:
      'Already set aside money for charity? Put it to work ending childhood food insecurity in New Jersey.',
  },
  why: [
    {
      title: 'Already tax-deductible',
      body: 'You received your tax deduction when you funded your DAF. Recommending a grant puts that money to work right away.',
    },
    {
      title: 'No processing fees',
      body: 'DAF grants come to us with no card processing fees, so more of your gift goes to the mission.',
    },
    {
      title: 'Unrestricted and flexible',
      body: 'Unrestricted grants let us direct resources where kids and families need them most.',
    },
  ],
  faq: [
    {
      q: 'Will I get a tax receipt from Seed & Spoon?',
      a: 'Your tax deduction came from your DAF sponsor when you contributed to your fund, so your sponsor provides the tax documentation. We will send you a thank-you letter confirming your grant arrived.',
    },
    {
      q: 'Can I use my DAF for event tickets, memberships, or other benefits?',
      a: 'No. IRS rules do not allow DAF grants to pay for anything you receive in return, such as event tickets, meals, or memberships. Please use a personal gift for those.',
    },
    {
      q: 'My DAF sponsor is not listed in the tool. Can I still give?',
      a: 'Yes. Log in to your DAF account, search for Seed & Spoon by name or EIN, and recommend a grant. Use the organization details on this page.',
    },
    {
      q: 'Can I support a specific program?',
      a: `Our default designation is unrestricted, which gives us the most flexibility. If you would like to support a specific program, such as 5 Loaves, email ${DAF_NOTIFY_EMAIL} and we will talk it through with you.`,
    },
    {
      q: 'How will I know my grant arrived?',
      a: 'DAF sponsors usually send grants within a few business days to a few weeks. Once it arrives, we will send you a thank-you. Letting us know you gave helps us match your grant quickly.',
    },
  ],
};
