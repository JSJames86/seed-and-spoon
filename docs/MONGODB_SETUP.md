# MongoDB Setup Guide

This guide will help you connect your Seed and Spoon application to MongoDB Atlas.

## Prerequisites

- MongoDB Atlas account with a cluster created
- Database user credentials (username and password)
- Your IP address whitelisted in MongoDB Atlas Network Access

## Setup Steps

### 1. Configure Environment Variables

A `.env.local` file has been created in the root directory with your MongoDB Atlas connection string. You need to replace the password placeholder with your actual database password:

```bash
# Open .env.local and replace <db_password> with your actual password
MONGODB_URI=mongodb+srv://seedandspoonnj_db_user:YOUR_ACTUAL_PASSWORD@seedandspoon.mu8p9gl.mongodb.net/?appName=SeedAndSpoon
MONGODB_DB=seedandspoon
```

**Important Security Notes:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Keep your database password secure
- Use different passwords for development and production environments

### 2. Test the Connection

After setting your password, test the MongoDB connection:

```bash
npm run test:db
```

This will:
- Verify your connection string is configured correctly
- Test connectivity to MongoDB Atlas
- Perform a test write/read operation
- List existing collections in your database

**Troubleshooting:**

If you see authentication errors:
- Verify your password is correct
- Ensure the user `seedandspoonnj_db_user` exists in MongoDB Atlas
- Check that the user has read/write permissions

If you see connection timeout errors:
- Check your internet connection
- Verify your IP address is whitelisted in MongoDB Atlas Network Access
- Confirm the cluster URL is correct

### 3. Initialize Database Indexes

Once the connection test passes, initialize your database indexes for optimal performance:

```bash
npm run init:db
```

This will create indexes for:
- **donations** - Donation tracking
- **submissions** - Form submissions
- **resources** - Food assistance resources
- **intakes** - Client/referral applications
- **provider_submissions** - Provider directory submissions

## Using MongoDB in Your Application

The MongoDB connection is managed through the singleton pattern in `lib/mongodb.js` to prevent connection exhaustion in serverless environments.

### Basic Usage Examples

#### Get the database instance:

```javascript
import { getDb } from '@/lib/mongodb';

export async function GET(request) {
  const db = await getDb();
  // Use the database
  const results = await db.collection('donations').find({}).toArray();
  return Response.json(results);
}
```

#### Get a specific collection:

```javascript
import { getCollection } from '@/lib/mongodb';

export async function POST(request) {
  const collection = await getCollection('submissions');
  const data = await request.json();

  const result = await collection.insertOne({
    ...data,
    createdAt: new Date()
  });

  return Response.json({ success: true, id: result.insertedId });
}
```

#### Use in API routes:

```javascript
import { getCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const donations = await getCollection('donations');

    // Find all completed donations
    const results = await donations
      .find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return Response.json({ donations: results });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
```

## Database Collections

Your application uses the following collections:

| Collection | Purpose |
|------------|---------|
| `donations` | Stripe donation transactions and metadata |
| `submissions` | General form submissions (contact, volunteer, etc.) |
| `resources` | Food assistance resources with geospatial data |
| `intakes` | Client intake and referral applications |
| `provider_submissions` | Provider directory submission forms |

## Connection Configuration

The MongoDB client is configured with the following options (see `lib/mongodb.js:30-40`):

```javascript
{
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,        // Maximum number of connections in the pool
  minPoolSize: 2,         // Minimum number of connections
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
}
```

## Environment-Specific Behavior

### Development
- Uses a global variable to preserve the connection across Hot Module Replacement (HMR)
- Connection is reused across Next.js development server reloads

### Production
- Creates a fresh connection for each serverless function invocation
- Automatically closes connections when functions complete

## Common Operations

### Insert a document:
```javascript
const collection = await getCollection('donations');
const result = await collection.insertOne({
  amount: 50.00,
  donorEmail: 'donor@example.com',
  createdAt: new Date()
});
```

### Find documents:
```javascript
const collection = await getCollection('resources');
const resources = await collection
  .find({ county: 'Morris', isActive: true })
  .toArray();
```

### Update a document:
```javascript
const collection = await getCollection('donations');
await collection.updateOne(
  { stripeSessionId: sessionId },
  { $set: { status: 'completed', completedAt: new Date() } }
);
```

### Delete a document:
```javascript
const collection = await getCollection('submissions');
await collection.deleteOne({ _id: submissionId });
```

## Best Practices

1. **Always use the connection utilities** - Don't create new MongoClient instances
2. **Handle errors gracefully** - Wrap database operations in try/catch blocks
3. **Close cursors** - Use `.toArray()` or properly iterate cursors
4. **Use indexes** - Ensure your queries leverage the created indexes
5. **Validate data** - Use schemas (Zod) before inserting into the database
6. **Avoid blocking operations** - Use async/await properly
7. **Monitor performance** - Use MongoDB Atlas performance monitoring

## Additional Resources

- [MongoDB Node.js Driver Documentation](https://docs.mongodb.com/drivers/node/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js with MongoDB](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review MongoDB Atlas logs in the Atlas dashboard
3. Verify your network access settings
4. Ensure your cluster is active and not paused
