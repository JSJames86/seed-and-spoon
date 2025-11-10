/**
 * Zod Validation Schemas for API Endpoints
 */

import { z } from 'zod';

/**
 * Donation checkout request schema
 */
export const donationCheckoutSchema = z.object({
  amount: z
    .number()
    .int('Amount must be an integer')
    .min(100, 'Minimum donation is $1.00')
    .max(100000000, 'Maximum donation is $1,000,000'),
  currency: z.string().length(3).toLowerCase().default('usd'),
  interval: z.enum(['one_time', 'month'], {
    errorMap: () => ({ message: 'Interval must be "one_time" or "month"' }),
  }),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(1).max(100).optional(),
  source: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Source must contain only lowercase letters, numbers, and underscores')
    .optional()
    .default('direct'),
});

/**
 * Volunteer submission schema
 */
export const volunteerSubmissionSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number').optional(),
  preferredContact: z.enum(['email', 'text', 'phone']).default('email'),
  roles: z.array(z.string()).min(1, 'Please select at least one volunteer role'),
  availability: z.string().min(10, 'Please describe your availability').max(500),
  resume: z.string().url('Resume must be a valid URL').optional().nullable(),
  linkedin: z.string().url('LinkedIn must be a valid URL').optional().nullable(),
  accessibilityNotes: z.string().max(500).optional(),
  transportation: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  orientationAgreed: z.boolean().refine((val) => val === true, {
    message: 'You must agree to attend orientation',
  }),
  photoConsent: z.boolean().default(false),
});

/**
 * Contact form submission schema
 */
export const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number').optional(),
});

/**
 * Newsletter subscription schema
 */
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

/**
 * Generic submission schema (for any form type)
 */
export const genericSubmissionSchema = z.object({
  formType: z.enum(['volunteer', 'contact', 'newsletter', 'help_request']),
  payload: z.record(z.any()),
});

/**
 * New Jersey counties enum
 */
export const NJ_COUNTIES = [
  'Atlantic', 'Bergen', 'Burlington', 'Camden', 'Cape May', 'Cumberland',
  'Essex', 'Gloucester', 'Hudson', 'Hunterdon', 'Mercer', 'Middlesex',
  'Monmouth', 'Morris', 'Ocean', 'Passaic', 'Salem', 'Somerset',
  'Sussex', 'Union', 'Warren'
];

const njCounties = NJ_COUNTIES;

/**
 * Client intake form schema
 */
export const clientIntakeSchema = z.object({
  kind: z.literal('client'),
  applicant: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address').optional().nullable(),
    preferredContact: z.enum(['phone', 'text', 'email']).default('phone'),
    preferredLanguage: z.string().default('English'),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().default('NJ'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  }),
  householdSize: z.number().int().min(1, 'Household size must be at least 1'),
  hasChildrenUnder2: z.boolean().default(false),
  infantNeeds: z.array(z.enum(['formula', 'baby_food', 'diapers'])).default([]),
  hasSeniorsOrDisability: z.boolean().default(false),
  allergies: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(
    z.enum(['vegetarian', 'vegan', 'kosher', 'halal', 'low_sodium', 'diabetic_friendly', 'other'])
  ).default([]),
  kitchenAccess: z.enum(['full', 'limited', 'none']).default('full'),
  onSNAP: z.enum(['yes', 'no', 'unsure']).optional(),
  onWIC: z.enum(['yes', 'no']).optional(),
  transportation: z.enum(['yes', 'no', 'sometimes']).optional(),
  notes: z.string().max(1000).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to share your information',
  }),
});

/**
 * Referral intake form schema
 */
export const referralIntakeSchema = z.object({
  kind: z.literal('referral'),
  referrer: z.object({
    orgName: z.string().min(2, 'Organization name is required').max(200),
    contactName: z.string().min(2, 'Contact name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number'),
    servicesProvided: z.array(z.string()).default([]),
  }),
  applicant: z.object({
    name: z.string().min(2, 'Client name must be at least 2 characters').max(100),
    phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address').optional().nullable(),
    preferredContact: z.enum(['phone', 'text', 'email']).default('phone'),
    preferredLanguage: z.string().default('English'),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().default('NJ'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  }),
  householdSize: z.number().int().min(1, 'Household size must be at least 1'),
  hasChildrenUnder2: z.boolean().default(false),
  infantNeeds: z.array(z.enum(['formula', 'baby_food', 'diapers'])).default([]),
  hasSeniorsOrDisability: z.boolean().default(false),
  allergies: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(
    z.enum(['vegetarian', 'vegan', 'kosher', 'halal', 'low_sodium', 'diabetic_friendly', 'other'])
  ).default([]),
  kitchenAccess: z.enum(['full', 'limited', 'none']).default('full'),
  onSNAP: z.enum(['yes', 'no', 'unsure']).optional(),
  onWIC: z.enum(['yes', 'no']).optional(),
  transportation: z.enum(['yes', 'no', 'sometimes']).optional(),
  clientConsent: z.boolean().refine((val) => val === true, {
    message: 'Client must consent to share their information',
  }),
  notes: z.string().max(1000).optional(),
});

/**
 * Provider submission schema (for requesting to be listed)
 */
export const providerSubmissionSchema = z.object({
  orgName: z.string().min(2, 'Organization name is required').max(200),
  siteName: z.string().max(200).optional().nullable(),
  county: z.enum(njCounties, {
    errorMap: () => ({ message: 'Please select a valid NJ county' }),
  }),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().default('NJ'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  }),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }).optional().nullable(),
  hours: z.array(z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    open: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
    close: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  })).optional().default([]),
  type: z.enum(['food_pantry', 'hot_meal', 'mobile_pantry', 'community_fridge', 'other']),
  services: z.array(
    z.enum([
      'produce', 'prepared_meals', 'diapers', 'formula', 'baby_food',
      'halal', 'kosher', 'vegetarian', 'vegan'
    ])
  ).default([]),
  languages: z.array(z.string()).min(1, 'At least one language is required').default(['English']),
  contact: z.object({
    phone: z.string().regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email address').optional(),
    website: z.string().url('Invalid website URL').optional(),
  }),
  eligibility: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the information is accurate',
  }),
});

/**
 * Resource query filters schema (for GET /api/resources)
 */
export const resourceQuerySchema = z.object({
  county: z.enum(njCounties).optional(),
  type: z.enum(['food_pantry', 'hot_meal', 'mobile_pantry', 'community_fridge', 'other']).optional(),
  service: z.string().optional(),
  openNow: z.enum(['true', 'false']).optional(),
  zip: z.string().regex(/^\d{5}$/).optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  radiusKm: z.string().optional(),
  limit: z.string().optional(),
});

/**
 * Validate request body against a Zod schema
 * @param {object} body - Request body to validate
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {object} - { success: boolean, data?: object, errors?: object }
 */
export function validateRequest(body, schema) {
  const result = schema.safeParse(body);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format Zod errors for API response
  const errors = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return {
    success: false,
    errors,
  };
}

/**
 * Middleware wrapper for validation
 * @param {z.ZodSchema} schema
 * @returns {Function}
 */
export function withValidation(schema) {
  return async (body) => {
    return validateRequest(body, schema);
  };
}
