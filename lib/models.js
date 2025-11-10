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
 * Food Resources Collection (pantries, meal sites, etc.)
 */

/**
 * Create a new food resource
 * @param {object} resourceData
 * @returns {Promise<object>}
 */
export async function createFoodResource(resourceData) {
  const resources = await getCollection('resources');

  const resource = {
    name: resourceData.name,
    type: resourceData.type, // food_pantry | hot_meal | mobile_pantry | community_fridge | other
    county: resourceData.county,
    location: resourceData.location, // GeoJSON Point { type: 'Point', coordinates: [lng, lat] }
    address: resourceData.address, // { street, city, state, zip }
    hours: resourceData.hours || [], // [{ day, open, close }]
    services: resourceData.services || [], // array of service strings
    languages: resourceData.languages || ['English'],
    contact: resourceData.contact || {}, // { phone, email, website }
    eligibility: resourceData.eligibility || '',
    notes: resourceData.notes || '',
    isActive: resourceData.isActive !== false,
    lastVerifiedAt: resourceData.lastVerifiedAt || new Date(),
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
 * Find food resources with filters and geospatial search
 * @param {object} filters
 * @returns {Promise<array>}
 */
export async function findFoodResources(filters = {}) {
  const resources = await getCollection('resources');

  const query = { isActive: true };

  // County filter
  if (filters.county) {
    query.county = filters.county;
  }

  // Type filter
  if (filters.type) {
    query.type = filters.type;
  }

  // Service filter
  if (filters.service) {
    query.services = filters.service;
  }

  // ZIP code filter
  if (filters.zip) {
    query['address.zip'] = filters.zip;
  }

  let cursor;

  // Geospatial search if lat/lng provided
  if (filters.lat && filters.lng) {
    const radiusKm = filters.radiusKm || 25; // default 25km radius
    const radiusMeters = radiusKm * 1000;

    cursor = resources.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(filters.lng), parseFloat(filters.lat)]
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: query
        }
      },
      { $limit: filters.limit || 100 }
    ]);
  } else {
    // Regular query without geospatial
    cursor = resources
      .find(query)
      .limit(filters.limit || 100);
  }

  return await cursor.toArray();
}

/**
 * Update food resource
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateFoodResource(id, updates) {
  const resources = await getCollection('resources');
  const { ObjectId } = await import('mongodb');

  const result = await resources.findOneAndUpdate(
    { _id: new ObjectId(id) },
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
 * Intakes Collection (client applications & referrals)
 */

/**
 * Create a new intake (client or referral)
 * @param {object} intakeData
 * @returns {Promise<object>}
 */
export async function createIntake(intakeData) {
  const intakes = await getCollection('intakes');

  const intake = {
    kind: intakeData.kind, // 'client' | 'referral'
    status: intakeData.status || 'new',
    channel: intakeData.channel || 'web',
    applicant: intakeData.applicant, // { name, phone, email, preferredContact, preferredLanguage }
    address: intakeData.address, // { street, city, state, zip }
    householdSize: intakeData.householdSize,
    hasChildrenUnder2: intakeData.hasChildrenUnder2 || false,
    infantNeeds: intakeData.infantNeeds || [],
    hasSeniorsOrDisability: intakeData.hasSeniorsOrDisability || false,
    allergies: intakeData.allergies || [],
    dietaryRestrictions: intakeData.dietaryRestrictions || [],
    kitchenAccess: intakeData.kitchenAccess || 'full',
    onSNAP: intakeData.onSNAP,
    onWIC: intakeData.onWIC,
    transportation: intakeData.transportation,
    referrer: intakeData.referrer || null, // for kind=referral
    clientConsent: intakeData.clientConsent || false,
    notes: intakeData.notes || '',
    tags: intakeData.tags || [],
    suggestedResources: intakeData.suggestedResources || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await intakes.insertOne(intake);

  return {
    ...intake,
    _id: result.insertedId,
  };
}

/**
 * Find intakes by filters
 * @param {object} filters
 * @returns {Promise<array>}
 */
export async function findIntakes(filters = {}) {
  const intakes = await getCollection('intakes');

  const query = {};

  if (filters.kind) query.kind = filters.kind;
  if (filters.status) query.status = filters.status;
  if (filters.zip) query['address.zip'] = filters.zip;

  return await intakes
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .toArray();
}

/**
 * Update intake status
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateIntake(id, updates) {
  const intakes = await getCollection('intakes');
  const { ObjectId } = await import('mongodb');

  const result = await intakes.findOneAndUpdate(
    { _id: new ObjectId(id) },
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
 * Provider Submissions Collection
 */

/**
 * Create a new provider submission
 * @param {object} submissionData
 * @returns {Promise<object>}
 */
export async function createProviderSubmission(submissionData) {
  const submissions = await getCollection('provider_submissions');

  const submission = {
    orgName: submissionData.orgName,
    siteName: submissionData.siteName || null,
    county: submissionData.county,
    address: submissionData.address,
    location: submissionData.location || null,
    hours: submissionData.hours || [],
    services: submissionData.services || [],
    languages: submissionData.languages || ['English'],
    contact: submissionData.contact || {},
    eligibility: submissionData.eligibility || '',
    notes: submissionData.notes || '',
    status: 'pending',
    submittedAt: new Date(),
    reviewedAt: null,
    reviewedBy: null,
  };

  const result = await submissions.insertOne(submission);

  return {
    ...submission,
    _id: result.insertedId,
  };
}

/**
 * Find provider submissions by status
 * @param {string} status
 * @param {number} limit
 * @returns {Promise<array>}
 */
export async function findProviderSubmissions(status = 'pending', limit = 50) {
  const submissions = await getCollection('provider_submissions');

  const query = status ? { status } : {};

  return await submissions
    .find(query)
    .sort({ submittedAt: -1 })
    .limit(limit)
    .toArray();
}
