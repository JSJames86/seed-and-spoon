/**
 * MongoDB Collection Models and Helper Functions
 */

import { getCollection } from './mongodb.js';

/**
 * Donations Collection
 */

/**
 * Create a new donation record
 * @param {object} donationData
 * @returns {Promise<object>}
 */
export async function createDonation({
  stripeSessionId,
  amount,
  currency,
  interval,
  status = 'created',
  donorEmail = null,
  name = null,
  metadata = {},
}) {
  const donations = await getCollection('donations');

  const donation = {
    stripeSessionId,
    stripePaymentIntentId: null,
    stripeSubscriptionId: null,
    amount,
    currency,
    interval,
    status,
    donorEmail,
    name,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await donations.insertOne(donation);

  return {
    ...donation,
    _id: result.insertedId,
  };
}

/**
 * Find donation by Stripe session ID
 * @param {string} stripeSessionId
 * @returns {Promise<object|null>}
 */
export async function findDonationBySessionId(stripeSessionId) {
  const donations = await getCollection('donations');
  return await donations.findOne({ stripeSessionId });
}

/**
 * Update donation status
 * @param {string} stripeSessionId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateDonation(stripeSessionId, updates) {
  const donations = await getCollection('donations');

  const result = await donations.findOneAndUpdate(
    { stripeSessionId },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return result.value;
}

/**
 * Mark donation as paid
 * @param {string} stripeSessionId
 * @param {object} paymentData
 * @returns {Promise<object>}
 */
export async function markDonationPaid(stripeSessionId, paymentData) {
  return await updateDonation(stripeSessionId, {
    status: 'paid',
    stripePaymentIntentId: paymentData.paymentIntentId || null,
    stripeSubscriptionId: paymentData.subscriptionId || null,
    donorEmail: paymentData.donorEmail || null,
    name: paymentData.name || null,
    amount: paymentData.amount || null,
    currency: paymentData.currency || null,
    stripeEvent: paymentData.stripeEvent || null,
  });
}

/**
 * Get safe donation data for public display
 * @param {object} donation
 * @returns {object}
 */
export function getSafeDonationData(donation) {
  if (!donation) return null;

  return {
    status: donation.status,
    amount: donation.amount,
    currency: donation.currency,
    interval: donation.interval,
    donorEmail: donation.donorEmail ? maskEmail(donation.donorEmail) : null,
    createdAt: donation.createdAt,
  };
}

/**
 * Mask email for safe display
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  if (!email) return '';

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal =
    localPart.length > 2
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
      : localPart[0] + '*';

  return `${maskedLocal}@${domain}`;
}

/**
 * Submissions Collection
 */

/**
 * Create a new form submission
 * @param {object} submissionData
 * @returns {Promise<object>}
 */
export async function createSubmission({ formType, payload }) {
  const submissions = await getCollection('submissions');

  const submission = {
    formType,
    payload,
    createdAt: new Date(),
  };

  const result = await submissions.insertOne(submission);

  return {
    ...submission,
    _id: result.insertedId,
  };
}

/**
 * Find submissions by form type
 * @param {string} formType
 * @param {number} limit
 * @returns {Promise<array>}
 */
export async function findSubmissionsByType(formType, limit = 50) {
  const submissions = await getCollection('submissions');

  return await submissions
    .find({ formType })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Resources Collection
 */

/**
 * Create a new resource
 * @param {object} resourceData
 * @returns {Promise<object>}
 */
export async function createResource({ title, slug, type, tags = [], summary, link }) {
  const resources = await getCollection('resources');

  const resource = {
    title,
    slug,
    type,
    tags,
    summary,
    link,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await resources.insertOne(resource);

  return {
    ...resource,
    _id: result.insertedId,
  };
}

/**
 * Find resource by slug
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function findResourceBySlug(slug) {
  const resources = await getCollection('resources');
  return await resources.findOne({ slug });
}

/**
 * Find resources by type
 * @param {string} type
 * @param {number} limit
 * @returns {Promise<array>}
 */
export async function findResourcesByType(type, limit = 50) {
  const resources = await getCollection('resources');

  return await resources
    .find({ type })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Find resources by tag
 * @param {string} tag
 * @param {number} limit
 * @returns {Promise<array>}
 */
export async function findResourcesByTag(tag, limit = 50) {
  const resources = await getCollection('resources');

  return await resources
    .find({ tags: tag })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Update resource
 * @param {string} slug
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateResource(slug, updates) {
  const resources = await getCollection('resources');

  const result = await resources.findOneAndUpdate(
    { slug },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return result.value;
}

/**
 * Delete resource
 * @param {string} slug
 * @returns {Promise<boolean>}
 */
export async function deleteResource(slug) {
  const resources = await getCollection('resources');
  const result = await resources.deleteOne({ slug });
  return result.deletedCount > 0;
}
