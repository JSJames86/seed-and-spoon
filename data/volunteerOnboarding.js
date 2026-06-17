export const volunteerOnboarding = {
  roles: [
    { key: 'kitchen', label: 'Kitchen / Meal Prep', description: 'Help prepare meals in the community kitchen' },
    { key: 'delivery', label: 'Delivery Driver', description: 'Deliver meals and groceries to households (requires driver verification)' },
    { key: 'garden', label: 'Garden / Urban Farm', description: 'Work in community gardens and urban farming plots' },
    { key: 'events', label: 'Events & Outreach', description: 'Assist with community events, fundraisers, and outreach' },
    { key: 'admin', label: 'Administrative Support', description: 'Help with office work, data entry, and communications' },
    { key: 'mentorship', label: 'Mentorship / Tutoring', description: 'Mentor youth participants or provide tutoring support' },
  ],

  hoursPurposes: [
    { key: 'community_service', label: 'Community Service' },
    { key: 'school_credit', label: 'School Credit' },
    { key: 'court_ordered', label: 'Court-Ordered Service' },
    { key: 'professional_development', label: 'Professional Development' },
    { key: 'general', label: 'General Volunteering' },
  ],

  consentTypes: [
    { key: 'code_of_conduct', label: 'Code of Conduct', required: true, description: 'Agreement to follow Seed & Spoon\'s volunteer code of conduct.' },
    { key: 'liability_waiver', label: 'Liability Waiver', required: true, description: 'Acknowledgment of risks and waiver of liability for volunteer activities.' },
    { key: 'data_privacy', label: 'Data Privacy Agreement', required: true, description: 'Consent to collect and store your personal information as described in our privacy policy.' },
    { key: 'photo_release', label: 'Photo Release', required: false, description: 'Permission to use photos taken during volunteer activities for promotional purposes.' },
    { key: 'background_check_authorization', label: 'Background Check Authorization', required: false, description: 'Authorization to conduct a background check (required for roles involving minors).' },
    { key: 'minor_guardian_consent', label: 'Guardian Consent (Minors)', required: false, description: 'Parent/guardian consent for minor volunteers.' },
    { key: 'driver_do21a_consent', label: 'Driver Record Consent (DO-21A)', required: false, description: 'Consent for NJ driver abstract pull under notarized DO-21A form.' },
  ],

  backgroundCheckTypes: [
    { key: 'criminal', label: 'Criminal Background Check' },
    { key: 'cari', label: 'CARI (Child Abuse Record Information)' },
    { key: 'sex_offender', label: 'Sex Offender Registry' },
    { key: 'all', label: 'Comprehensive (All Checks)' },
  ],

  statusFlow: {
    invited: { label: 'Invited', next: 'pending_auth', color: 'gray' },
    pending_auth: { label: 'Pending Auth', next: 'onboarding', color: 'yellow' },
    onboarding: { label: 'Onboarding', next: 'pending_review', color: 'blue' },
    pending_review: { label: 'Pending Review', next: 'approved', color: 'orange' },
    approved: { label: 'Approved', next: 'active', color: 'green' },
    active: { label: 'Active', next: null, color: 'emerald' },
    inactive: { label: 'Inactive', next: null, color: 'red' },
  },

  guardianRelationships: [
    'Parent', 'Legal Guardian', 'Grandparent', 'Aunt/Uncle', 'Sibling (18+)', 'Other',
  ],
};
