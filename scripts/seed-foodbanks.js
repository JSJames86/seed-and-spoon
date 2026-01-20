/**
 * Seed Pantries Script
 *
 * Populates the Supabase `pantries` table with NJ food bank data.
 * Uses Nominatim (OpenStreetMap) for free geocoding.
 *
 * Usage:
 *   node scripts/seed-foodbanks.js
 *   node scripts/seed-foodbanks.js --dry-run  (preview without inserting)
 *   node scripts/seed-foodbanks.js --skip-geocode  (faster, but no map markers)
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
  { name: "Franciscan Servants of Divine Mercy", address: "352 13th Ave., Newark, NJ", city: "Newark", county: "Essex", phone: "(908) 403-6252", hours: "Tues, Wed, Thurs & Sat 12 p.m.–1:30 p.m." },
  { name: "Revival Temple Holiness Church", address: "81–85 16th Ave., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 642-8588", hours: "Every Friday at 10 a.m." },
  { name: "New Community Corp Senior", address: "220 Bruce St., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 623-6114", hours: "Every 1st Day of the Month" },
  { name: "Celestial Church of Christ", address: "187–189 Camden St., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 565-1201", hours: null },
  { name: "UCC's Champion House Food Pantry", address: "409 S. 18th St., Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Every 3rd Wednesday 10 a.m.–2 p.m." },
  { name: "Allen AME Church", address: "56 19th Ave., Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Every 1st, 3rd, and 4th Saturday, 9 a.m.–1 p.m." },
  { name: "Better Life", address: "101 14th Ave., Newark, NJ", city: "Newark", county: "Essex", phone: "(862) 229-1400", hours: "Monday, Friday 10 a.m.–3 p.m." },
  { name: "Église De Dieu De L'Unité Chrétienne, Inc.", address: "31 Blum St., Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Pantry time varies" },
  { name: "Sardis Temple Baptist Church", address: "506–508 18th Ave., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 642-3565", hours: "Pantry time varies" },
  // Newark - West Ward
  { name: "Seventh-day Adventists", address: "828 Sanford Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 375-9206", hours: "Sundays" },
  { name: "Family Manor", address: "795 Sanford Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 388-0650", hours: "Every other Tuesday, 7:30 p.m.–8 p.m." },
  { name: "Vailsburg Assembly of God / Bishop McBean", address: "962 South Orange Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Wednesdays, 10 a.m." },
  { name: "Ambassador Church", address: "998 South Orange Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Fridays, 12 p.m.–2 p.m." },
  // Newark - North Ward
  { name: "Apostle's House", address: "24 Grant Street, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 482-0625", hours: "10 a.m. Wednesdays (call for closing times)" },
  { name: "NJCRI", address: "323 Central Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 483-3444", hours: "By appointment" },
  { name: "Willing Heart", address: "555 Dr. Martin Luther King, Jr. Blvd., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 622-2100", hours: null },
  // Newark - Arts & Education District
  { name: "New Direction Behavioral Health", address: "9 Lincoln Park, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 885-0153", hours: "Nov. 12th & 26th at 1 p.m. (call for closing times)" },
  { name: "St. James Social Service Corp.", address: "604 Dr. Martin Luther King, Jr. Blvd., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 624-4007", hours: "Mon–Fri, 1 p.m.–3 p.m. (Each family served once per month)" },
  { name: "Newark Emergency Services for Families", address: "982 Mayor Kenneth A. Gibson Blvd., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 639-2100", hours: "Nov. 20th, 9 a.m.–11 a.m." },
  { name: "Pierre Toussaint", address: "520 Dr. Martin Luther King, Jr. Blvd., Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 792-5790", hours: "Please call for the weekly schedule" },
  // Newark - East Ward
  { name: "Ironbound Community Center (Lafayette)", address: "432 Lafayette Street, Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Tuesday and Friday, 11 a.m. to 1 p.m." },
  { name: "Ironbound Community Center (Cortland)", address: "29 Cortland Street, Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Thursday, 9:30 a.m." },
  { name: "Ironbound Community Center (St. Charles)", address: "371 St. Charles Street, Newark, NJ", city: "Newark", county: "Essex", phone: null, hours: "Nov. 7th and 23rd, Turkey Giveaway, 3:30 p.m." },
  { name: "Mantena", address: "294 Ferry Street, Newark, NJ", city: "Newark", county: "Essex", phone: "(973) 344-1644", hours: "Call for service hours" },
  { name: "East Ward Community Center", address: "104 Oliver Street, Newark, NJ", city: "Newark", county: "Essex", phone: "973-522-4036", hours: "Call for service hours" },
  // Essex County (other cities)
  { name: "Grace Kingdom Church Food Pantry", address: "375–377 Chestnut St., Newark, NJ", city: "Newark", county: "Essex", phone: "201-449-5070", hours: "Saturday 10am–12pm" },
  { name: "Grace Pointe Seventh Day Adventist Church", address: "15 Elmwood Avenue, Montclair, NJ", city: "Montclair", county: "Essex", phone: "973-746-1911", hours: "Sunday 10am–2pm" },
  { name: "Greater Life Community Center – Lifeline Food Pantry", address: "272 Chancellor Ave, Newark, NJ", city: "Newark", county: "Essex", phone: "973-907-6111", hours: "Call for hours" },
  { name: "Holy Trinity Episcopal Church Food Pantry", address: "315 Main Street, West Orange, NJ", city: "West Orange", county: "Essex", phone: "973-325-0369", hours: "Tuesday 8:30am–11:30am" },
  { name: "Holy Trinity Lutheran Church Food Pantry", address: "153 Glenwood Avenue, East Orange, NJ", city: "East Orange", county: "Essex", phone: "973-676-5437", hours: "Last Tuesday of the Month 10am–12pm" },
  { name: "Mercy House – Newark Food Pantry", address: "620 Clinton Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: "973-497-4000", hours: "Tuesday & Friday 11am–4pm" },
  { name: "New Hope Baptist Church Food Pantry", address: "144 Norman Street, East Orange, NJ", city: "East Orange", county: "Essex", phone: "862-452-6887", hours: "Every 3rd Friday of the Month 10am–2pm" },
  { name: "Our Lady of Sorrows Food Pantry", address: "217 Prospect Street, South Orange, NJ", city: "South Orange", county: "Essex", phone: "973-370-0458", hours: "Every 2nd & 4th Saturday of the Month 8am–11am" },
  { name: "Roseville Church Food Pantry", address: "36 Roseville Avenue, Newark, NJ", city: "Newark", county: "Essex", phone: "973-483-3361", hours: "Every 2nd & 4th Monday of the Month 10am–12pm" },
  { name: "St. James R.C. Church Food Pantry", address: "142 Jefferson Street, Newark, NJ", city: "Newark", county: "Essex", phone: "973-344-8322", hours: "Monday 9am–3pm; Thursday 9am–2pm" },

  // ===== HUDSON COUNTY =====
  { name: "Blessed Miriam Teresa Food Pantry", address: "326 Avenue C, Bayonne, NJ", city: "Bayonne", county: "Hudson", phone: "201-437-4090", hours: "Every 3rd Saturday of the Month, 9:00am–10:30am" },
  { name: "Christ the King Food Pantry", address: "768 Ocean Avenue, Jersey City, NJ", city: "Jersey City", county: "Hudson", phone: "201-333-4862", hours: "Tuesday & Thursday 10:00am–12:00pm; Saturday 9:00am–12:00pm" },
  { name: "Mercy House Jersey City Food Pantry", address: "20 Greenville Avenue, Jersey City, NJ", city: "Jersey City", county: "Hudson", phone: "973-497-4350", hours: "Monday & Thursday 11:00am–4:00pm" },
  { name: "Our Lady of Fatima Food Pantry", address: "8101 Kennedy Blvd., North Bergen, NJ", city: "North Bergen", county: "Hudson", phone: "201-869-7244", hours: "Monday–Thursday 9:30am–12:00pm & 1:00pm–5:00pm" },
  { name: "Our Lady of Sorrows Food Pantry (Jersey City)", address: "93 Clerk Street, Jersey City, NJ", city: "Jersey City", county: "Hudson", phone: "201-433-0626", hours: "Monday, Wednesday & Friday 9:30am–1:00pm; Every 2nd Saturday of the Month 9:30am–1:00pm" },
  { name: "Salvation Army Food Pantry (Union City)", address: "515 43rd Street, Union City, NJ", city: "Union City", county: "Hudson", phone: "201-867-4093", hours: "Thursday 9:00am–10:00am" },
  { name: "Salvation Army Soup Kitchen (Union City)", address: "515 43rd Street, Union City, NJ", city: "Union City", county: "Hudson", phone: "201-867-4093", hours: "Tuesday–Friday 11:30am–12:15pm" },
  { name: "St. Peter's University Campus Kitchen", address: "39 Tuers Ave., Jersey City, NJ", city: "Jersey City", county: "Hudson", phone: "201-761-7395", hours: "Open September–May; Mon–Fri 2:30pm–5:00pm; Saturday 2:00pm–4:00pm" },
  { name: "St. Rocco's Church Food Pantry", address: "4206 Kennedy Blvd., Union City, NJ", city: "Union City", county: "Hudson", phone: "201-863-1427", hours: "Monday 9:00am–11:30am" },

  // ===== UNION COUNTY =====
  { name: "Church of the Assumption Food Pantry", address: "113 Coolidge Place, Roselle Park, NJ", city: "Roselle Park", county: "Union", phone: "908-245-1107", hours: "Tuesday 8:30am–10:00am" },
  { name: "Immaculate Heart of Mary Food Pantry", address: "1571 Martine Avenue, Scotch Plains, NJ", city: "Scotch Plains", county: "Union", phone: "908-889-2100", hours: "Wednesday 10:00am–11:30am; Every 2nd Sunday of the Month" },
  { name: "Mt. Teman AME Church Food Pantry", address: "160 Madison Avenue, Elizabeth, NJ", city: "Elizabeth", county: "Union", phone: "908-351-2625", hours: "Thursday 9:00am–1:00pm" },
  { name: "Salvation Army Food Pantry (Elizabeth)", address: "1005 East Jersey Street, Elizabeth, NJ", city: "Elizabeth", county: "Union", phone: "908-352-7057", hours: "By Appointment Only" },
  { name: "Salvation Army Soup Kitchen (Elizabeth)", address: "1005 East Jersey Street, Elizabeth, NJ", city: "Elizabeth", county: "Union", phone: "908-352-7057", hours: "Please call for schedule" },
  { name: "St. Theresa Social Concerns Food Pantry", address: "541 Washington Ave, Kenilworth, NJ", city: "Kenilworth", county: "Union", phone: "908-272-4444", hours: "Tuesday & Thursday 10:00am–12:00pm; Wednesday 6:00pm–7:00pm" },
  { name: "Westfield Food Pantry", address: "425 North Avenue East, Westfield, NJ", city: "Westfield", county: "Union", phone: "908-232-2311", hours: "Monday–Friday 9:30am–11:00am (By Appointment Only)" },

  // ===== BERGEN COUNTY =====
  { name: "Abundant Grace & Truth Church / Annie Clyde Holt Food Pantry", address: "100 Palisade Ave, Westwood, NJ", city: "Westwood", county: "Bergen", phone: "201-375-0163", hours: "Every 2nd Friday 4:30pm–8:30pm (By Appointment Only); Every 2nd Saturday 9am–2pm" },
  { name: "St. Cecilia's Church Office of Concern", address: "55 West Demarest Avenue, Englewood, NJ", city: "Englewood", county: "Bergen", phone: "201-568-1465", hours: "Monday–Wednesday 9am–12pm" },
  { name: "Ascension Church", address: "256 Azalea Drive, New Milford, NJ", city: "New Milford", county: "Bergen", phone: "201-923-8865", hours: "3rd Monday 4pm–6pm; After 3rd Sunday & emergency requests" },
  { name: "St. Francis of Assisi / St. Francis Food for Friends", address: "114 Mt. Vernon Street, Ridgefield Park, NJ", city: "Ridgefield Park", county: "Bergen", phone: "201-641-6464", hours: "Monday–Friday 9am–5pm" },
  { name: "Epiphany Community Food Pantry", address: "274 Knox Ave, Cliffside Park, NJ", city: "Cliffside Park", county: "Bergen", phone: "551-362-0221", hours: "Every Friday 10am–12pm" },
  { name: "St. John the Evangelist Food Pantry", address: "29 N. Washington Avenue, Bergenfield, NJ", city: "Bergenfield", county: "Bergen", phone: "201-655-1073", hours: "Last Monday of the month 8:30am–11am & 6pm–7pm" },
  { name: "Hillsdale Helping Hands Food Pantry", address: "349 Hillsdale Avenue, Hillsdale, NJ", city: "Hillsdale", county: "Bergen", phone: "201-664-0600", hours: "Every Monday 5:15pm–7:00pm; 1st Saturday 9:00am–10:30am" },
  { name: "St. Joseph Church Food Pantry (Lodi)", address: "40 Spring Street, Lodi, NJ", city: "Lodi", county: "Bergen", phone: "973-779-0643", hours: "Every Monday 10am–12pm" },
];

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Free, no API key required, but has rate limits (1 req/sec)
 */
async function geocodeAddress(address) {
  const query = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=us`;

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
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.warn(`   ⚠ Geocoding error for "${address}": ${error.message}`);
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
async function seedPantries() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipGeocode = args.includes('--skip-geocode');

  console.log('🌱 Seed & Spoon - Pantry Seeder\n');
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no data will be inserted)' : 'LIVE IMPORT'}`);
  console.log(`   Geocoding: ${skipGeocode ? 'SKIPPED' : 'ENABLED (takes ~1 min)'}`);
  console.log(`   Total records: ${FOOD_BANKS.length}\n`);

  // Check existing data
  const { count, error: countError } = await supabase
    .from('pantries')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error checking existing data:', countError.message);
    console.error('   Make sure the `pantries` table exists in Supabase.');
    process.exit(1);
  }

  console.log(`📊 Existing records in pantries table: ${count || 0}\n`);

  if (count > 0) {
    console.log('⚠️  Table already has data. This will add more records (may create duplicates).');
    console.log('   To start fresh, clear the table in Supabase Dashboard first.\n');
  }

  const results = {
    success: 0,
    failed: 0,
    geocoded: 0,
    notGeocoded: 0
  };

  console.log('🔄 Processing pantries...\n');

  for (let i = 0; i < FOOD_BANKS.length; i++) {
    const bank = FOOD_BANKS[i];
    let location = null;

    // Geocode address (with rate limiting)
    if (!skipGeocode) {
      location = await geocodeAddress(bank.address);
      await sleep(1100); // Nominatim rate limit: 1 request per second
    }

    // Build record matching pantries table schema
    // Use JSON format for location: { lat, lng }
    const record = {
      name: bank.name,
      address: bank.address,
      location: location, // JSON: { lat: number, lng: number } or null
      phone: bank.phone || null,
      email: null, // Not in our data
      hours: bank.hours || 'Call for hours', // Default if null (required field)
      capacity_households_per_day: null, // Not in our data
      manager_id: null, // Not in our data
      is_active: true,
    };

    if (location) {
      results.geocoded++;
      console.log(`   ✓ [${i + 1}/${FOOD_BANKS.length}] ${bank.name} (${bank.city}) - 📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    } else {
      results.notGeocoded++;
      console.log(`   ○ [${i + 1}/${FOOD_BANKS.length}] ${bank.name} (${bank.city}) - ⚠ No coordinates`);
    }

    if (!isDryRun) {
      const { error } = await supabase
        .from('pantries')
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

  console.log(`   Geocoded (will show on map): ${results.geocoded}`);
  console.log(`   Not geocoded (won't show): ${results.notGeocoded}`);

  if (isDryRun) {
    console.log('\n✅ Dry run complete. Run without --dry-run to insert data.');
  } else if (results.success > 0) {
    console.log('\n🎉 Import complete! Your food bank markers should now appear on the map.');
    console.log('   Refresh your Get Help page to see them.');
  }

  console.log('');
}

// Run the seeder
seedPantries().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
