/**
 * Seed Food Banks Script
 *
 * Populates the Supabase `foodbanks` table with NJ food bank data.
 * Uses Nominatim (OpenStreetMap) for free geocoding.
 *
 * Usage:
 *   node scripts/seed-foodbanks.js
 *   node scripts/seed-foodbanks.js --dry-run  (preview without inserting)
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL env var
 *   - SUPABASE_SERVICE_ROLE_KEY env var (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { createClient } from '@supabase/supabase-js';

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All food bank data from CSV (4 counties: Essex, Hudson, Union, Bergen)
const FOOD_BANKS = [
  // ===== ESSEX COUNTY =====
  // Newark - Central Ward
  { name: "Franciscan Servants of Divine Mercy", address: "352 13th Ave.", city: "Newark", county: "Essex", phone: "(908) 403-6252", service_type: "Food Pantry", hours: "Tues, Wed, Thurs & Sat 12 p.m.–1:30 p.m." },
  { name: "Revival Temple Holiness Church", address: "81–85 16th Ave.", city: "Newark", county: "Essex", phone: "(973) 642-8588", service_type: "Food Pantry", hours: "Every Friday at 10 a.m." },
  { name: "New Community Corp Senior", address: "220 Bruce St.", city: "Newark", county: "Essex", phone: "(973) 623-6114", service_type: "Food Pantry", hours: "Every 1st Day of the Month" },
  { name: "Celestial Church of Christ", address: "187–189 Camden St.", city: "Newark", county: "Essex", phone: "(973) 565-1201", service_type: "Food Pantry", hours: null },
  { name: "UCC's Champion House Food Pantry", address: "409 S. 18th St.", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Every 3rd Wednesday 10 a.m.–2 p.m." },
  { name: "Allen AME Church", address: "56 19th Ave.", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Every 1st, 3rd, and 4th Saturday, 9 a.m.–1 p.m." },
  { name: "Better Life", address: "101 14th Ave.", city: "Newark", county: "Essex", phone: "(862) 229-1400", service_type: "Food Pantry", hours: "Monday, Friday 10 a.m.–3 p.m." },
  { name: "Église De Dieu De L'Unité Chrétienne, Inc.", address: "31 Blum St.", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Pantry time varies" },
  { name: "Sardis Temple Baptist Church", address: "506–508 18th Ave.", city: "Newark", county: "Essex", phone: "(973) 642-3565", service_type: "Food Pantry", hours: "Pantry time varies" },
  // Newark - West Ward
  { name: "Seventh-day Adventists", address: "828 Sanford Avenue", city: "Newark", county: "Essex", phone: "(973) 375-9206", service_type: "Food Pantry", hours: "Sundays" },
  { name: "Family Manor", address: "795 Sanford Avenue", city: "Newark", county: "Essex", phone: "(973) 388-0650", service_type: "Food Pantry", hours: "Every other Tuesday, 7:30 p.m.–8 p.m." },
  { name: "Vailsburg Assembly of God / Bishop McBean", address: "962 South Orange Avenue", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Wednesdays, 10 a.m." },
  { name: "Ambassador Church", address: "998 South Orange Avenue", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Fridays, 12 p.m.–2 p.m." },
  // Newark - North Ward
  { name: "Apostle's House", address: "24 Grant Street", city: "Newark", county: "Essex", phone: "(973) 482-0625", service_type: "Food Pantry", hours: "10 a.m. Wednesdays (call for closing times)" },
  { name: "NJCRI", address: "323 Central Avenue", city: "Newark", county: "Essex", phone: "(973) 483-3444", service_type: "Food Pantry", hours: "By appointment" },
  { name: "Willing Heart", address: "555 Dr. Martin Luther King, Jr. Blvd.", city: "Newark", county: "Essex", phone: "(973) 622-2100", service_type: "Food Pantry", hours: null },
  // Newark - Arts & Education District
  { name: "New Direction Behavioral Health", address: "9 Lincoln Park", city: "Newark", county: "Essex", phone: "(973) 885-0153", service_type: "Food Pantry", hours: "Nov. 12th & 26th at 1 p.m. (call for closing times)" },
  { name: "St. James Social Service Corp.", address: "604 Dr. Martin Luther King, Jr. Blvd.", city: "Newark", county: "Essex", phone: "(973) 624-4007", service_type: "Food Pantry", hours: "Mon–Fri, 1 p.m.–3 p.m. (Each family served once per month)" },
  { name: "Newark Emergency Services for Families", address: "982 Mayor Kenneth A. Gibson Blvd.", city: "Newark", county: "Essex", phone: "(973) 639-2100", service_type: "Food Pantry", hours: "Nov. 20th, 9 a.m.–11 a.m." },
  { name: "Pierre Toussaint", address: "520 Dr. Martin Luther King, Jr. Blvd.", city: "Newark", county: "Essex", phone: "(973) 792-5790", service_type: "Food Pantry", hours: "Please call for the weekly schedule" },
  // Newark - East Ward
  { name: "Ironbound Community Center (Lafayette)", address: "432 Lafayette Street", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Tuesday and Friday, 11 a.m. to 1 p.m." },
  { name: "Ironbound Community Center (Cortland)", address: "29 Cortland Street", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Thursday, 9:30 a.m." },
  { name: "Ironbound Community Center (St. Charles)", address: "371 St. Charles Street", city: "Newark", county: "Essex", phone: null, service_type: "Food Pantry", hours: "Nov. 7th and 23rd, Turkey Giveaway, 3:30 p.m." },
  { name: "Mantena", address: "294 Ferry Street", city: "Newark", county: "Essex", phone: "(973) 344-1644", service_type: "Food Pantry", hours: "Call for service hours" },
  { name: "East Ward Community Center", address: "104 Oliver Street", city: "Newark", county: "Essex", phone: "973-522-4036", service_type: "Food Pantry", hours: "Call for service hours" },
  // Essex County (other cities)
  { name: "Grace Kingdom Church Food Pantry", address: "375–377 Chestnut St.", city: "Newark", county: "Essex", phone: "201-449-5070", service_type: "Food Pantry", hours: "Saturday 10am–12pm" },
  { name: "Grace Pointe Seventh Day Adventist Church", address: "15 Elmwood Avenue", city: "Montclair", county: "Essex", phone: "973-746-1911", service_type: "Food Pantry", hours: "Sunday 10am–2pm" },
  { name: "Greater Life Community Center – Lifeline Food Pantry", address: "272 Chancellor Ave", city: "Newark", county: "Essex", phone: "973-907-6111", service_type: "Food Pantry", hours: "Call for hours" },
  { name: "Holy Trinity Episcopal Church Food Pantry", address: "315 Main Street", city: "West Orange", county: "Essex", phone: "973-325-0369", service_type: "Food Pantry", hours: "Tuesday 8:30am–11:30am" },
  { name: "Holy Trinity Lutheran Church Food Pantry", address: "153 Glenwood Avenue", city: "East Orange", county: "Essex", phone: "973-676-5437", service_type: "Food Pantry", hours: "Last Tuesday of the Month 10am–12pm" },
  { name: "Mercy House – Newark Food Pantry", address: "620 Clinton Avenue", city: "Newark", county: "Essex", phone: "973-497-4000", service_type: "Food Pantry", hours: "Tuesday & Friday 11am–4pm" },
  { name: "New Hope Baptist Church Food Pantry", address: "144 Norman Street", city: "East Orange", county: "Essex", phone: "862-452-6887", service_type: "Food Pantry", hours: "Every 3rd Friday of the Month 10am–2pm" },
  { name: "Our Lady of Sorrows Food Pantry", address: "217 Prospect Street", city: "South Orange", county: "Essex", phone: "973-370-0458", service_type: "Food Pantry", hours: "Every 2nd & 4th Saturday of the Month 8am–11am" },
  { name: "Roseville Church Food Pantry", address: "36 Roseville Avenue", city: "Newark", county: "Essex", phone: "973-483-3361", service_type: "Food Pantry", hours: "Every 2nd & 4th Monday of the Month 10am–12pm" },
  { name: "St. James R.C. Church Food Pantry", address: "142 Jefferson Street", city: "Newark", county: "Essex", phone: "973-344-8322", service_type: "Food Pantry", hours: "Monday 9am–3pm; Thursday 9am–2pm" },

  // ===== HUDSON COUNTY =====
  { name: "Blessed Miriam Teresa Food Pantry", address: "326 Avenue C", city: "Bayonne", county: "Hudson", phone: "201-437-4090", service_type: "Food Pantry", hours: "Every 3rd Saturday of the Month, 9:00am–10:30am" },
  { name: "Christ the King Food Pantry", address: "768 Ocean Avenue", city: "Jersey City", county: "Hudson", phone: "201-333-4862", service_type: "Food Pantry", hours: "Tuesday & Thursday 10:00am–12:00pm; Saturday 9:00am–12:00pm" },
  { name: "Mercy House Jersey City Food Pantry", address: "20 Greenville Avenue", city: "Jersey City", county: "Hudson", phone: "973-497-4350", service_type: "Food Pantry", hours: "Monday & Thursday 11:00am–4:00pm" },
  { name: "Our Lady of Fatima Food Pantry", address: "8101 Kennedy Blvd.", city: "North Bergen", county: "Hudson", phone: "201-869-7244", service_type: "Food Pantry", hours: "Monday–Thursday 9:30am–12:00pm & 1:00pm–5:00pm" },
  { name: "Our Lady of Sorrows Food Pantry (Jersey City)", address: "93 Clerk Street", city: "Jersey City", county: "Hudson", phone: "201-433-0626", service_type: "Food Pantry", hours: "Monday, Wednesday & Friday 9:30am–1:00pm; Every 2nd Saturday of the Month 9:30am–1:00pm" },
  { name: "Salvation Army Food Pantry (Union City)", address: "515 43rd Street", city: "Union City", county: "Hudson", phone: "201-867-4093", service_type: "Food Pantry", hours: "Thursday 9:00am–10:00am" },
  { name: "Salvation Army Soup Kitchen (Union City)", address: "515 43rd Street", city: "Union City", county: "Hudson", phone: "201-867-4093", service_type: "Soup Kitchen", hours: "Tuesday–Friday 11:30am–12:15pm" },
  { name: "St. Peter's University Campus Kitchen", address: "39 Tuers Ave.", city: "Jersey City", county: "Hudson", phone: "201-761-7395", service_type: "Soup Kitchen", hours: "Open September–May; Mon–Fri 2:30pm–5:00pm; Saturday 2:00pm–4:00pm" },
  { name: "St. Rocco's Church Food Pantry", address: "4206 Kennedy Blvd.", city: "Union City", county: "Hudson", phone: "201-863-1427", service_type: "Food Pantry", hours: "Monday 9:00am–11:30am" },

  // ===== UNION COUNTY =====
  { name: "Church of the Assumption Food Pantry", address: "113 Coolidge Place", city: "Roselle Park", county: "Union", phone: "908-245-1107", service_type: "Food Pantry", hours: "Tuesday 8:30am–10:00am" },
  { name: "Immaculate Heart of Mary Food Pantry", address: "1571 Martine Avenue", city: "Scotch Plains", county: "Union", phone: "908-889-2100", service_type: "Food Pantry", hours: "Wednesday 10:00am–11:30am; Every 2nd Sunday of the Month" },
  { name: "Mt. Teman AME Church Food Pantry", address: "160 Madison Avenue", city: "Elizabeth", county: "Union", phone: "908-351-2625", service_type: "Food Pantry", hours: "Thursday 9:00am–1:00pm" },
  { name: "Salvation Army Food Pantry (Elizabeth)", address: "1005 East Jersey Street", city: "Elizabeth", county: "Union", phone: "908-352-7057", service_type: "Food Pantry", hours: "By Appointment Only" },
  { name: "Salvation Army Soup Kitchen (Elizabeth)", address: "1005 East Jersey Street", city: "Elizabeth", county: "Union", phone: "908-352-7057", service_type: "Soup Kitchen", hours: "Please call for schedule" },
  { name: "St. Theresa Social Concerns Food Pantry", address: "541 Washington Ave", city: "Kenilworth", county: "Union", phone: "908-272-4444", service_type: "Food Pantry", hours: "Tuesday & Thursday 10:00am–12:00pm; Wednesday 6:00pm–7:00pm" },
  { name: "Westfield Food Pantry", address: "425 North Avenue East", city: "Westfield", county: "Union", phone: "908-232-2311", service_type: "Food Pantry", hours: "Monday–Friday 9:30am–11:00am (By Appointment Only)" },

  // ===== BERGEN COUNTY =====
  { name: "Abundant Grace & Truth Church / Annie Clyde Holt Food Pantry", address: "100 Palisade Ave", city: "Westwood", county: "Bergen", phone: "201-375-0163", service_type: "Food Pantry", hours: "Every 2nd Friday 4:30pm–8:30pm (By Appointment Only); Every 2nd Saturday 9am–2pm" },
  { name: "St. Cecilia's Church Office of Concern", address: "55 West Demarest Avenue", city: "Englewood", county: "Bergen", phone: "201-568-1465", service_type: "Food Pantry", hours: "Monday–Wednesday 9am–12pm" },
  { name: "Ascension Church", address: "256 Azalea Drive", city: "New Milford", county: "Bergen", phone: "201-923-8865", service_type: "Food Pantry", hours: "3rd Monday 4pm–6pm; After 3rd Sunday & emergency requests" },
  { name: "St. Francis of Assisi / St. Francis Food for Friends", address: "114 Mt. Vernon Street", city: "Ridgefield Park", county: "Bergen", phone: "201-641-6464", service_type: "Food Pantry", hours: "Monday–Friday 9am–5pm" },
  { name: "Epiphany Community Food Pantry", address: "274 Knox Ave", city: "Cliffside Park", county: "Bergen", phone: "551-362-0221", service_type: "Food Pantry", hours: "Every Friday 10am–12pm" },
  { name: "St. John the Evangelist Food Pantry", address: "29 N. Washington Avenue", city: "Bergenfield", county: "Bergen", phone: "201-655-1073", service_type: "Food Pantry", hours: "Last Monday of the month 8:30am–11am & 6pm–7pm" },
  { name: "Hillsdale Helping Hands Food Pantry", address: "349 Hillsdale Avenue", city: "Hillsdale", county: "Bergen", phone: "201-664-0600", service_type: "Food Pantry", hours: "Every Monday 5:15pm–7:00pm; 1st Saturday 9:00am–10:30am" },
  { name: "St. Joseph Church Food Pantry (Lodi)", address: "40 Spring Street", city: "Lodi", county: "Bergen", phone: "973-779-0643", service_type: "Food Pantry", hours: "Every Monday 10am–12pm" },
];

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Free, no API key required, but has rate limits (1 req/sec)
 */
async function geocodeAddress(address, city, state = 'NJ') {
  const query = encodeURIComponent(`${address}, ${city}, ${state}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SeedAndSpoon-FoodBankImport/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.warn(`   ⚠ Geocoding error for "${address}, ${city}": ${error.message}`);
    return null;
  }
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main import function
 */
async function seedFoodBanks() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipGeocode = args.includes('--skip-geocode');

  console.log('🌱 Seed & Spoon - Food Bank Seeder\n');
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no data will be inserted)' : 'LIVE IMPORT'}`);
  console.log(`   Geocoding: ${skipGeocode ? 'SKIPPED' : 'ENABLED'}`);
  console.log(`   Total records: ${FOOD_BANKS.length}\n`);

  // Check existing data
  const { count, error: countError } = await supabase
    .from('foodbanks')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error checking existing data:', countError.message);
    console.error('   Make sure the `foodbanks` table exists in Supabase.');
    process.exit(1);
  }

  console.log(`📊 Existing records in foodbanks table: ${count || 0}\n`);

  if (count > 0) {
    console.log('⚠️  Table already has data. Options:');
    console.log('   1. Clear the table manually in Supabase Dashboard');
    console.log('   2. Or continue to add more records (may create duplicates)\n');

    // Continue anyway for now
  }

  const results = {
    success: 0,
    failed: 0,
    geocoded: 0,
    notGeocoded: 0
  };

  console.log('🔄 Processing food banks...\n');

  for (let i = 0; i < FOOD_BANKS.length; i++) {
    const bank = FOOD_BANKS[i];
    let coords = null;

    // Geocode address (with rate limiting)
    if (!skipGeocode) {
      coords = await geocodeAddress(bank.address, bank.city);
      await sleep(1100); // Nominatim rate limit: 1 request per second
    }

    const record = {
      name: bank.name,
      address: bank.address,
      city: bank.city,
      county: bank.county,
      phone: bank.phone,
      service_type: bank.service_type,
      hours: bank.hours,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null
    };

    if (coords) {
      results.geocoded++;
      console.log(`   ✓ [${i + 1}/${FOOD_BANKS.length}] ${bank.name} (${bank.city}) - 📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } else {
      results.notGeocoded++;
      console.log(`   ○ [${i + 1}/${FOOD_BANKS.length}] ${bank.name} (${bank.city}) - ⚠ No coordinates`);
    }

    if (!isDryRun) {
      const { error } = await supabase
        .from('foodbanks')
        .insert([record]);

      if (error) {
        results.failed++;
        console.error(`      ❌ Insert failed: ${error.message}`);
      } else {
        results.success++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY\n');
  console.log(`   Total processed: ${FOOD_BANKS.length}`);

  if (!isDryRun) {
    console.log(`   Successfully inserted: ${results.success}`);
    console.log(`   Failed to insert: ${results.failed}`);
  }

  console.log(`   Geocoded: ${results.geocoded}`);
  console.log(`   Not geocoded: ${results.notGeocoded}`);

  if (isDryRun) {
    console.log('\n✅ Dry run complete. Run without --dry-run to insert data.');
  } else if (results.success > 0) {
    console.log('\n🎉 Import complete! Your food bank markers should now appear on the map.');
  }

  console.log('');
}

// Run the seeder
seedFoodBanks().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
