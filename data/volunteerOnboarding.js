export const volunteerOnboarding = {
  sections: [
    {
      key: 'contact',
      title: 'Your details',
      fields: [
        { id: 'first_name', label: 'First name', type: 'text', required: true },
        { id: 'last_name', label: 'Last name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'phone', label: 'Phone', type: 'tel', required: true },
        { id: 'date_of_birth', label: 'Date of birth', type: 'date', required: true,
          note: 'Drives consent requirements for under-18 volunteers.' },
        { id: 'tshirt_size', label: 'T-shirt size', type: 'select',
          options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      ],
    },
    {
      key: 'motivation',
      title: "Why you're here",
      fields: [
        { id: 'why_volunteering', label: 'Why Seed & Spoon?', type: 'textarea', required: true,
          prompt: 'In a sentence or two, why did you choose to volunteer with Seed & Spoon?' },
      ],
    },
    {
      key: 'hours',
      title: 'Volunteer hours',
      fields: [
        { id: 'purpose', label: 'Hours purpose', type: 'select', required: true,
          options: [
            { value: 'personal', label: 'Just personal' },
            { value: 'school_service', label: 'School service hours' },
            { value: 'college_app', label: 'College applications' },
            { value: 'court_ordered', label: 'Court-ordered / community service' },
            { value: 'corporate_social', label: 'Work or social program' },
            { value: 'none', label: 'No documentation needed' },
          ] },
        { id: 'target_hours', label: 'Target hours', type: 'number',
          showIf: 'purpose_needs_docs',
          prompt: 'Do you have a set number of hours to reach?' },
        { id: 'institution_name', label: 'Institution / organization', type: 'text',
          showIf: 'purpose_needs_institution',
          prompt: 'Which school, program, or organization are these hours for?' },
        { id: 'documentation_required', label: 'Need a verification letter?', type: 'boolean',
          prompt: 'Will you need us to sign off / send a letter verifying your hours?' },
      ],
    },
    {
      key: 'roles',
      title: "How you'd like to help",
      note: 'Select one or more roles. Some roles require additional verification.',
    },
    {
      key: 'driver',
      title: 'Driving verification',
      showIf: 'has_driving_role',
      fields: [
        { id: 'nj_licensed', label: 'NJ license holder', type: 'boolean', required: true,
          prompt: 'Do you hold a valid New Jersey driver\'s license?',
          note: 'Driving roles require a NJ license. Answering "No" routes you to non-driving options.' },
        { id: 'has_valid_insurance', label: 'Valid insurance', type: 'boolean', required: true,
          prompt: 'Do you have valid auto insurance?' },
      ],
      info: 'All drivers must have a notarized DO-21A on file. Seed & Spoon pulls your certified NJ MVC abstract — no self-upload.',
    },
    {
      key: 'availability',
      title: 'When you can help',
      fields: [
        { id: 'weekdays', label: 'Available days', type: 'multiselect',
          options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { id: 'preferred_times', label: 'Preferred times', type: 'multiselect',
          options: ['Morning', 'Afternoon', 'Evening'] },
        { id: 'max_hours_per_month', label: 'Max hours/month', type: 'number',
          prompt: 'Roughly how many hours a month can you give?' },
        { id: 'transportation', label: 'Transportation', type: 'select',
          options: [
            { value: 'can_drive', label: 'I can drive' },
            { value: 'bus_only', label: 'Bus / transit only' },
            { value: 'rideshare', label: 'Rideshare' },
            { value: 'walk', label: 'I walk' },
          ] },
      ],
    },
    {
      key: 'languages',
      title: 'Languages you speak',
      note: 'Helps us match family-facing and outreach roles.',
      suggestions: ['English', 'Spanish', 'Portuguese', 'Haitian Creole', 'Arabic'],
      proficiencies: ['basic', 'conversational', 'fluent', 'native'],
    },
    {
      key: 'accommodations',
      title: 'Keeping you safe (optional & confidential)',
      fields: [
        { id: 'food_allergies', label: 'Food allergies', type: 'textarea',
          prompt: 'Any food allergies we should know about? (We handle food, including common allergens.)' },
        { id: 'accommodations_needed', label: 'Accommodations', type: 'textarea',
          prompt: "Any accommodations that would help you volunteer, or any tasks we should steer you away from? You don't need to share a diagnosis." },
      ],
    },
    {
      key: 'emergency',
      title: 'Emergency contact',
      fields: [
        { id: 'ec_name', label: 'Contact name', type: 'text', required: true },
        { id: 'ec_relationship', label: 'Relationship', type: 'text' },
        { id: 'ec_phone', label: 'Contact phone', type: 'tel', required: true },
      ],
    },
    {
      key: 'guardian',
      title: 'Parent / guardian',
      showIf: 'is_minor',
      fields: [
        { id: 'guardian_name', label: 'Guardian name', type: 'text', required: true },
        { id: 'guardian_relationship', label: 'Relationship', type: 'text', required: true },
        { id: 'guardian_email', label: 'Guardian email', type: 'email', required: true },
        { id: 'guardian_phone', label: 'Guardian phone', type: 'tel', required: true },
      ],
      info: "We'll email your parent/guardian a separate link to confirm consent. You can't be approved until they do.",
    },
    {
      key: 'agreements',
      title: 'Agreements',
      consents: [
        { id: 'liability_waiver', label: 'I accept the volunteer liability waiver.', required: true },
        { id: 'code_of_conduct', label: 'I agree to the volunteer code of conduct.', required: true },
        { id: 'food_safety_ack', label: 'I understand basic food-safety rules, including not volunteering in food areas while sick.', required: true },
        { id: 'background_check_consent', label: 'I consent to a background check, including criminal history, sex-offender registry, and child-abuse record (CARI) checks, as required for roles involving access to children.',
          showIf: 'has_bg_check_role' },
        { id: 'media_consent', label: '(Optional) I consent to photos/video for Seed & Spoon\'s outreach.', required: false },
      ],
    },
  ],

  statusFlow: {
    invited: { label: 'Invited', color: 'gray' },
    in_progress: { label: 'In Progress', color: 'yellow' },
    submitted: { label: 'Submitted', color: 'blue' },
    active: { label: 'Active', color: 'green' },
    needs_info: { label: 'Needs Info', color: 'orange' },
  },

  eligibilityStatuses: {
    pending: { label: 'Pending', color: 'yellow' },
    eligible: { label: 'Eligible', color: 'green' },
    restricted: { label: 'Restricted', color: 'orange' },
    denied: { label: 'Denied', color: 'red' },
  },

  hoursPurposes: [
    { value: 'personal', label: 'Just personal' },
    { value: 'school_service', label: 'School service hours' },
    { value: 'college_app', label: 'College applications' },
    { value: 'court_ordered', label: 'Court-ordered / community service' },
    { value: 'corporate_social', label: 'Work or social program' },
    { value: 'none', label: 'No documentation needed' },
  ],

  languageProficiencies: [
    { value: 'basic', label: 'Basic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'native', label: 'Native' },
  ],

  guardianRelationships: [
    'Parent', 'Legal Guardian', 'Grandparent', 'Aunt/Uncle', 'Sibling (18+)', 'Other',
  ],

  tshirtSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
};
