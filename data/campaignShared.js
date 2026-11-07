export const CAMPAIGN_PRIVACY = {
  heading: 'Our privacy commitment',
  paragraphs: [
    'We protect the privacy of every family we serve. We never share names, photos, or personal details of the families or children in our programs, and we report only combined totals.',
    'This applies to everyone, including our largest donors. We share a family’s information only when that family has given us written permission, and only what they agreed to. A family’s decision to share or not never affects their place in the program.',
  ],
};

export const STANDARD_PRESET_DOLLARS = [25, 50, 100, 250];

export const FAMILY_INTEREST_LIST_HREF = null;

export const campaignDonateHref = (slug, amountDollars, { monthly = false, source } = {}) =>
  `/donate?campaign=${slug}&amount=${Math.round(amountDollars * 100)}${monthly ? '&interval=month' : ''}${source ? `&source=${source}` : ''}`;
