/**
 * MongoDB Connection Manager
 *
 * Singleton pattern for MongoDB client to prevent connection exhaustion
 * in serverless environments (Vercel).
 */

import { MongoClient } from 'mongodb';

let clientPromise;

/**
 * Get MongoDB client promise (lazy initialization)
 */
function getClientPromise() {
  if (clientPromise) {
    return clientPromise;
  }

  // Validate environment variables at runtime
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI to .env.local');
  }

  if (!process.env.MONGODB_DB) {
    throw new Error('Please add your MONGODB_DB to .env.local');
  }

  const uri = process.env.MONGODB_URI;
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let client;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the client
    // across module reloads caused by HMR (Hot Module Replacement)
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, create a new client
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Get the MongoDB database instance
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb() {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB;
  return client.db(dbName);
}

/**
 * Get a specific collection
 * @param {string} collectionName
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

/**
 * Initialize database indexes
 * Call this once on app startup or deployment
 */
export async function initializeIndexes() {
  const db = await getDb();

  try {
    // Donations collection indexes
    const donations = db.collection('donations');
    await donations.createIndexes([
      { key: { stripeSessionId: 1 }, unique: true, name: 'stripeSessionId_unique' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
      { key: { donorEmail: 1 }, sparse: true, name: 'donorEmail_sparse' },
    ]);

    // Submissions collection indexes
    const submissions = db.collection('submissions');
    await submissions.createIndexes([
      { key: { formType: 1 }, name: 'formType_index' },
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
    ]);

    // Resources collection indexes
    const resources = db.collection('resources');
    await resources.createIndexes([
      { key: { slug: 1 }, unique: true, name: 'slug_unique' },
      { key: { type: 1 }, name: 'type_index' },
      { key: { tags: 1 }, name: 'tags_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_desc' },
    ]);

    console.log('✅ Database indexes initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing indexes:', error);
    throw error;
  }
}

// Export lazy client promise for backward compatibility
export default {
  then: (resolve, reject) => getClientPromise().then(resolve, reject),
  catch: (reject) => getClientPromise().catch(reject),
};
