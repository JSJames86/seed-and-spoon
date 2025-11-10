/**
 * MongoDB Connection Test Script
 *
 * This script tests the MongoDB connection and verifies the database setup.
 * Run with: node scripts/test-mongodb.js
 */

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  // Validate environment variables
  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not set in .env.local');
    console.log('Please add your MongoDB connection string to .env.local');
    process.exit(1);
  }

  if (!process.env.MONGODB_DB) {
    console.error('❌ Error: MONGODB_DB is not set in .env.local');
    console.log('Please add your MongoDB database name to .env.local');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  // Check if password placeholder is still present
  if (uri.includes('<db_password>')) {
    console.error('❌ Error: Please replace <db_password> in MONGODB_URI with your actual database password');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  console.log(`📍 Database: ${dbName}`);

  // Create a MongoClient with ServerApiVersion options
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');

    // Send a ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful - database is responding');

    // Get database
    const db = client.db(dbName);

    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collection(s) in database "${dbName}":`);

    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections yet - they will be created when data is inserted)');
    }

    // Test write/read operation
    console.log('\n🧪 Testing write/read operations...');
    const testCollection = db.collection('_connection_test');

    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'MongoDB connection test successful'
    };

    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Write test successful');

    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Read test successful');

    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Cleanup successful');

    console.log('\n🎉 All tests passed! MongoDB is ready to use.');
    console.log('\n📚 Next steps:');
    console.log('   1. Your application can now use the MongoDB connection');
    console.log('   2. Collections will be created automatically when you insert data');
    console.log('   3. Run "node scripts/init-db.js" to initialize indexes (if needed)');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check that your database password is correct');
      console.log('   - Ensure the user "seedandspoonnj_db_user" exists in MongoDB Atlas');
      console.log('   - Verify the user has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your internet connection');
      console.log('   - Verify the cluster URL is correct');
      console.log('   - Ensure your IP address is whitelisted in MongoDB Atlas');
    }

    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

// Run the test
testConnection();
