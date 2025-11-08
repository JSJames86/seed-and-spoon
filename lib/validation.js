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
