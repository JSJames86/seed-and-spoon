/**
 * Rooted Commitments — the founder's public commitments to the community.
 *
 * Approved wording (Janelle, Nov 20, 2026). Used by the About page section and
 * mirrored in public/documents/seed-and-spoon-rooted-commitments.pdf. If you
 * change the copy here, regenerate the PDF so the two stay identical.
 */

export const ROOTED_COMMITMENTS_PDF_PATH = '/documents/seed-and-spoon-rooted-commitments.pdf';

export const rootedCommitments = {
  title: 'Rooted Commitments',
  commitments: [
    {
      title: 'Dignity',
      lead: "A child's access to quality nutrition should never depend on proving anything.",
      body: 'We never ask children to prove anything, and we never ask families to prove their income. A simple referral is all it takes.',
    },
    {
      title: 'Privacy',
      lead: "Your family's story belongs to you.",
      body: "We never ask for income, banking, or Social Security information, because information we don't have can never be breached. Donor payments are processed securely by Stripe, so we never see or store your card or bank details. Families who want to share their experience can choose to be featured with their consent in advance, or post their own honest story. If they do, we'll ask permission before we share it.",
    },
    {
      title: 'Transparency',
      lead: "We'll share the whole journey, not just the highlights.",
      body: "We commit to being transparent about where every dollar is allocated, our up-to-date impact, and what's working, what isn't, and what we're changing. Along the way, we'll have milestones we'll openly celebrate, and hiccups, maybe even setbacks, that we'll document and share too. Honesty in both is what builds your trust and keeps us strong as an organization.",
    },
    {
      title: 'Listening',
      lead: 'The families we serve help shape what we do.',
      body: "Your voice guides our work. Through regular check-ins and honest feedback, families help decide what's on the menu, what's working, and what needs to change. We don't just serve our community. We build alongside it.",
    },
  ],
  founder: {
    label: 'From Our Founder',
    body: 'I may not always get it right, but I commit to staying true to my intention: building a system where no child is food insecure. I humbly ask our community for patience as I learn, and for honesty when I fall short. I am listening.',
    signature: 'Janelle Glanville, Founder & Executive Director',
  },
  closing:
    'Solving childhood food insecurity is what we strive for. Our Rooted Commitments are how we get there.',
};
