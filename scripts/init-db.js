/**
 * Database Initialization Script
 *
 * Run this script to:
 * 1. Create all necessary indexes
 * 2. Optionally seed sample data
 *
 * Usage:
 *   node scripts/init-db.js
 *   node scripts/init-db.js --seed (to also add sample data)
 */

import { initializeIndexes, getDb } from '../lib/mongodb.js';
import { createFoodResource } from '../lib/models.js';

// Sample food resources across NJ counties
const sampleResources = [
  // Essex County
  {
    name: 'Newark Community Food Pantry',
    type: 'food_pantry',
    county: 'Essex',
    location: { type: 'Point', coordinates: [-74.1724, 40.7357] },
    address: { street: '123 Main St', city: 'Newark', state: 'NJ', zip: '07102' },
    hours: [
      { day: 'Monday', open: '09:00', close: '17:00' },
      { day: 'Wednesday', open: '09:00', close: '17:00' },
      { day: 'Friday', open: '09:00', close: '17:00' }
    ],
    services: ['produce', 'prepared_meals', 'formula', 'baby_food', 'halal'],
    languages: ['English', 'Spanish', 'Arabic'],
    contact: { phone: '(973) 555-0100', email: 'info@newarkpantry.org', website: 'https://example.org' },
    eligibility: 'Must be Essex County resident',
    notes: 'Please bring ID and proof of address',
    isActive: true,
  },
  {
    name: 'East Orange Hot Meal Program',
    type: 'hot_meal',
    county: 'Essex',
    location: { type: 'Point', coordinates: [-74.2049, 40.7673] },
    address: { street: '456 Central Ave', city: 'East Orange', state: 'NJ', zip: '07018' },
    hours: [
      { day: 'Monday', open: '11:00', close: '14:00' },
      { day: 'Tuesday', open: '11:00', close: '14:00' },
      { day: 'Wednesday', open: '11:00', close: '14:00' },
      { day: 'Thursday', open: '11:00', close: '14:00' },
      { day: 'Friday', open: '11:00', close: '14:00' }
    ],
    services: ['prepared_meals', 'vegetarian', 'vegan'],
    languages: ['English', 'Spanish'],
    contact: { phone: '(973) 555-0200', email: 'meals@eohotmeals.org' },
    eligibility: 'Open to all',
    notes: 'No registration required. Hot meals served daily.',
    isActive: true,
  },

  // Bergen County
  {
    name: 'Hackensack Food Bank',
    type: 'food_pantry',
    county: 'Bergen',
    location: { type: 'Point', coordinates: [-74.0431, 40.8859] },
    address: { street: '789 Main St', city: 'Hackensack', state: 'NJ', zip: '07601' },
    hours: [
      { day: 'Tuesday', open: '10:00', close: '16:00' },
      { day: 'Thursday', open: '10:00', close: '16:00' },
      { day: 'Saturday', open: '09:00', close: '13:00' }
    ],
    services: ['produce', 'diapers', 'formula', 'baby_food', 'kosher'],
    languages: ['English', 'Spanish', 'Korean'],
    contact: { phone: '(201) 555-0300', website: 'https://hackensackfoodbank.org' },
    eligibility: 'Bergen County residents',
    notes: 'Please bring reusable bags',
    isActive: true,
  },

  // Hudson County
  {
    name: 'Jersey City Community Fridge',
    type: 'community_fridge',
    county: 'Hudson',
    location: { type: 'Point', coordinates: [-74.0776, 40.7178] },
    address: { street: '321 Grove St', city: 'Jersey City', state: 'NJ', zip: '07302' },
    hours: [
      { day: 'Monday', open: '00:00', close: '23:59' },
      { day: 'Tuesday', open: '00:00', close: '23:59' },
      { day: 'Wednesday', open: '00:00', close: '23:59' },
      { day: 'Thursday', open: '00:00', close: '23:59' },
      { day: 'Friday', open: '00:00', close: '23:59' },
      { day: 'Saturday', open: '00:00', close: '23:59' },
      { day: 'Sunday', open: '00:00', close: '23:59' }
    ],
    services: ['prepared_meals', 'produce', 'vegetarian', 'vegan'],
    languages: ['English'],
    contact: { email: 'jccommunityfridge@gmail.com', website: 'https://jcfridge.org' },
    eligibility: 'Open to all, no questions asked',
    notes: '24/7 access. Take what you need, leave what you can.',
    isActive: true,
  },

  // Camden County
  {
    name: 'Camden Food Pantry Network',
    type: 'food_pantry',
    county: 'Camden',
    location: { type: 'Point', coordinates: [-75.1196, 39.9259] },
    address: { street: '555 Broadway', city: 'Camden', state: 'NJ', zip: '08103' },
    hours: [
      { day: 'Monday', open: '09:00', close: '15:00' },
      { day: 'Wednesday', open: '09:00', close: '15:00' },
      { day: 'Friday', open: '09:00', close: '15:00' }
    ],
    services: ['produce', 'prepared_meals', 'diapers', 'formula', 'baby_food'],
    languages: ['English', 'Spanish'],
    contact: { phone: '(856) 555-0400', email: 'info@camdenfoodnetwork.org' },
    eligibility: 'Camden County residents with proof of address',
    notes: 'Distribution on first-come, first-served basis',
    isActive: true,
  },

  // Middlesex County
  {
    name: 'New Brunswick Mobile Pantry',
    type: 'mobile_pantry',
    county: 'Middlesex',
    location: { type: 'Point', coordinates: [-74.4519, 40.4862] },
    address: { street: '100 Church St', city: 'New Brunswick', state: 'NJ', zip: '08901' },
    hours: [
      { day: 'Thursday', open: '14:00', close: '17:00' }
    ],
    services: ['produce', 'prepared_meals', 'halal'],
    languages: ['English', 'Spanish', 'Portuguese'],
    contact: { phone: '(732) 555-0500', website: 'https://nbmobilepantry.org' },
    eligibility: 'Open to all Middlesex County residents',
    notes: 'Mobile pantry visits different locations weekly. Check website for schedule.',
    isActive: true,
  },

  // Monmouth County
  {
    name: 'Asbury Park Food Distribution Center',
    type: 'food_pantry',
    county: 'Monmouth',
    location: { type: 'Point', coordinates: [-74.0121, 40.2204] },
    address: { street: '678 Cookman Ave', city: 'Asbury Park', state: 'NJ', zip: '07712' },
    hours: [
      { day: 'Tuesday', open: '10:00', close: '14:00' },
      { day: 'Thursday', open: '10:00', close: '14:00' },
      { day: 'Saturday', open: '09:00', close: '12:00' }
    ],
    services: ['produce', 'diapers', 'kosher', 'vegetarian'],
    languages: ['English', 'Spanish'],
    contact: { phone: '(732) 555-0600', email: 'help@apfooddist.org' },
    eligibility: 'Monmouth County residents',
    notes: 'Kosher options available upon request',
    isActive: true,
  },

  // Mercer County
  {
    name: 'Trenton Area Soup Kitchen',
    type: 'hot_meal',
    county: 'Mercer',
    location: { type: 'Point', coordinates: [-74.7429, 40.2171] },
    address: { street: '123 Perry St', city: 'Trenton', state: 'NJ', zip: '08618' },
    hours: [
      { day: 'Monday', open: '11:30', close: '13:30' },
      { day: 'Tuesday', open: '11:30', close: '13:30' },
      { day: 'Wednesday', open: '11:30', close: '13:30' },
      { day: 'Thursday', open: '11:30', close: '13:30' },
      { day: 'Friday', open: '11:30', close: '13:30' },
      { day: 'Saturday', open: '12:00', close: '14:00' },
      { day: 'Sunday', open: '12:00', close: '14:00' }
    ],
    services: ['prepared_meals', 'vegetarian', 'halal'],
    languages: ['English', 'Spanish', 'Arabic'],
    contact: { phone: '(609) 555-0700', website: 'https://trentonsoupkitchen.org' },
    eligibility: 'Open to all',
    notes: 'Meals served daily. No registration required.',
    isActive: true,
  },

  // Ocean County
  {
    name: 'Toms River Community Pantry',
    type: 'food_pantry',
    county: 'Ocean',
    location: { type: 'Point', coordinates: [-74.1979, 39.9537] },
    address: { street: '456 Washington St', city: 'Toms River', state: 'NJ', zip: '08753' },
    hours: [
      { day: 'Monday', open: '10:00', close: '16:00' },
      { day: 'Wednesday', open: '10:00', close: '16:00' },
      { day: 'Friday', open: '10:00', close: '16:00' }
    ],
    services: ['produce', 'formula', 'baby_food', 'diapers'],
    languages: ['English', 'Spanish'],
    contact: { phone: '(732) 555-0800', email: 'info@trpantry.org' },
    eligibility: 'Ocean County residents',
    notes: 'Infant supplies available while supplies last',
    isActive: true,
  },

  // Atlantic County
  {
    name: 'Atlantic City Food Coalition',
    type: 'food_pantry',
    county: 'Atlantic',
    location: { type: 'Point', coordinates: [-74.4229, 39.3643] },
    address: { street: '789 Atlantic Ave', city: 'Atlantic City', state: 'NJ', zip: '08401' },
    hours: [
      { day: 'Tuesday', open: '09:00', close: '15:00' },
      { day: 'Thursday', open: '09:00', close: '15:00' }
    ],
    services: ['produce', 'prepared_meals', 'halal', 'kosher'],
    languages: ['English', 'Spanish', 'Chinese'],
    contact: { phone: '(609) 555-0900', website: 'https://acfoodcoalition.org' },
    eligibility: 'Atlantic County residents',
    notes: 'Multilingual staff available',
    isActive: true,
  },
];

async function main() {
  const shouldSeed = process.argv.includes('--seed');

  console.log('🚀 Initializing database...\n');

  try {
    // Step 1: Create indexes
    console.log('📑 Creating indexes...');
    await initializeIndexes();
    console.log('✅ Indexes created successfully\n');

    // Step 2: Check existing data
    const db = await getDb();
    const resourcesCollection = db.collection('resources');
    const existingCount = await resourcesCollection.countDocuments();

    console.log(`📊 Current resources in database: ${existingCount}`);

    // Step 3: Seed data if requested
    if (shouldSeed) {
      if (existingCount > 0) {
        console.log('⚠️  Database already contains resources. Skipping seed data.');
        console.log('   Use --force-seed to override (not implemented for safety)');
      } else {
        console.log('\n🌱 Seeding sample data...');

        let successCount = 0;
        for (const resource of sampleResources) {
          try {
            await createFoodResource(resource);
            successCount++;
            console.log(`   ✓ Added: ${resource.name} (${resource.county} County)`);
          } catch (error) {
            console.error(`   ✗ Failed to add ${resource.name}:`, error.message);
          }
        }

        console.log(`\n✅ Successfully added ${successCount}/${sampleResources.length} sample resources`);
      }
    } else {
      console.log('\n💡 Tip: Run with --seed flag to add sample data');
      console.log('   Example: node scripts/init-db.js --seed\n');
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('\nNext steps:');
    console.log('  1. Visit http://localhost:3000/get-help to test the page');
    console.log('  2. Try submitting a client application');
    console.log('  3. Search for resources on the map');
    console.log('  4. Filter by county or resource type\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();
