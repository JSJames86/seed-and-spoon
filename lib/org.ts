/**
 * Seed & Spoon — organization facts (single source of truth).
 *
 * Every page, component, and email template that mentions the legal name,
 * EIN, tax status, or registrations should import from here instead of
 * hard-coding the value. If a fact changes, change it once, here.
 *
 * Source of truth: IRS determination letter (Sept 24, 2026), NJ Division of
 * Consumer Affairs charity registration approval (Oct 5, 2026), SAM.gov.
 */

// ─── Identity ────────────────────────────────────────────────────────────────
export const ORG_NAME = 'Seed & Spoon';
export const ORG_LEGAL_NAME = 'Seed & Spoon, Inc.';
export const ORG_EIN = '41-4059078';
export const ORG_STATE_OF_INCORPORATION = 'New Jersey';
export const ORG_INCORPORATION_DATE = 'February 3, 2026';
export const ORG_FISCAL_YEAR_END = 'December 31';

// ─── Federal tax status ──────────────────────────────────────────────────────
export const ORG_TAX_STATUS = '501(c)(3) Public Charity';
export const ORG_PUBLIC_CHARITY_CLASSIFICATION = 'IRC §170(b)(1)(A)(vi)';
export const IRS_DETERMINATION_LETTER_DATE = 'September 24, 2026';
/** Exemption is retroactive to the incorporation date. */
export const IRS_EXEMPTION_EFFECTIVE_DATE = 'February 3, 2026';

// ─── New Jersey charity registration ─────────────────────────────────────────
export const NJ_CHARITY_REG_NO = 'CH4946600';
export const NJ_CHARITY_REG_APPROVED_DATE = 'October 5, 2026';

/**
 * ⚠️ PLACEHOLDER — NJ charitable solicitation disclosure.
 *
 * Janelle will paste the exact required wording from the NJ registration
 * approval notice here. Do NOT write or paraphrase this text yourself; it is
 * legally prescribed language. While this is empty, the donate page renders
 * nothing in production and a visible placeholder box on preview/dev builds.
 */
export const NJ_SOLICITATION_DISCLOSURE = '';

// ─── Federal contracting (SAM.gov) ───────────────────────────────────────────
export const SAM_UEI = 'JZQRPU1GRRM6';
export const SAM_CAGE = '207U1';
export const SAM_EXPIRES = 'April 30, 2027';

// ─── Standard copy ───────────────────────────────────────────────────────────
/** Standard tax-deductibility line. Use verbatim on donation surfaces. */
export const ORG_TAX_STATUS_LINE = `${ORG_LEGAL_NAME} is a 501(c)(3) public charity (EIN ${ORG_EIN}). Contributions are tax-deductible to the extent allowed by law.`;

/** IRS written-acknowledgment statement. Include on every receipt. */
export const NO_GOODS_OR_SERVICES_LINE =
  'No goods or services were provided in exchange for this contribution.';

/** Short one-liner for footers and badges, e.g. "501(c)(3) Public Charity · EIN 41-4059078". */
export const ORG_TAX_STATUS_SHORT = `${ORG_TAX_STATUS} · EIN ${ORG_EIN}`;

/** FAQ answer for "Are donations tax-deductible?" (About + Help pages). */
export const TAX_DEDUCTIBILITY_FAQ_ANSWER = `Yes. ${ORG_LEGAL_NAME} is a 501(c)(3) public charity (EIN ${ORG_EIN}). Our tax-exempt status is effective from our incorporation date of ${IRS_EXEMPTION_EFFECTIVE_DATE}, so all gifts made since then are tax-deductible to the extent allowed by law. We provide a receipt for every contribution. Please consult your tax advisor about your individual situation.`;

// ─── Links & documents ───────────────────────────────────────────────────────
export const AMAZON_WISHLIST_URL = 'https://www.amazon.com/hz/wishlist/ls/1ZC494TKCOAHJ?ref_=wl_share';
/** The one canonical capability statement. The old /documents/capability-statement.pdf redirects here. */
export const CAPABILITY_STATEMENT_PATH = '/documents/seed-and-spoon-capability-statement.pdf';
