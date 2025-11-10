/**
 * Food Resource Import Script
 *
 * Import food resources from CSV file
 *
 * CSV Format (with header row):
 * name,type,county,street,city,zip,phone,email,website,monday_open,monday_close,tuesday_open,tuesday_close,...
 *
 * Usage:
 *   node scripts/import-resources.js path/to/resources.csv
 *   node scripts/import-resources.js path/to/resources.csv --dry-run (to test without importing)
 */

import fs from 'fs';
import { createFoodResource } from '../lib/models.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const VALID_TYPES = ['food_pantry', 'hot_meal', 'mobile_pantry', 'community_fridge', 'other'];

const NJ_COUNTIES = [
  'Atlantic', 'Bergen', 'Burlington', 'Camden', 'Cape May', 'Cumberland',
  'Essex', 'Gloucester', 'Hudson', 'Hunterdon', 'Mercer', 'Middlesex',
  'Monmouth', 'Morris', 'Ocean', 'Passaic', 'Salem', 'Somerset',
  'Sussex', 'Union', 'Warren'
];

/**
 * Parse CSV file (simple implementation)
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parse hours from CSV row
 */
function parseHours(row) {
  const hours = [];

  for (const day of DAYS) {
    const openKey = `${day}_open`;
    const closeKey = `${day}_close`;

    if (row[openKey] && row[closeKey]) {
      hours.push({
        day: DAY_NAMES[day],
        open: row[openKey],
        close: row[closeKey],
      });
    }
  }

  return hours;
}

/**
 * Parse services from comma-separated string
 */
function parseServices(servicesStr) {
  if (!servicesStr) return [];
  return servicesStr
    .split(';')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Parse languages from comma-separated string
 */
function parseLanguages(languagesStr) {
  if (!languagesStr) return ['English'];
  return languagesStr
    .split(';')
    .map(l => l.trim())
    .filter(Boolean);
}

/**
 * Validate and transform row to resource object
 */
function rowToResource(row, rowNumber) {
  const errors = [];

  // Required fields
  if (!row.name) errors.push('name is required');
  if (!row.type) errors.push('type is required');
  if (!row.county) errors.push('county is required');
  if (!row.zip) errors.push('zip is required');

  // Validate type
  if (row.type && !VALID_TYPES.includes(row.type)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Validate county
  if (row.county && !NJ_COUNTIES.includes(row.county)) {
    errors.push(`county must be a valid NJ county`);
  }

  // Validate ZIP
  if (row.zip && !/^\d{5}$/.test(row.zip)) {
    errors.push('zip must be 5 digits');
  }

  if (errors.length > 0) {
    throw new Error(`Row ${rowNumber} validation errors: ${errors.join(', ')}`);
  }

  // Build resource object
  const resource = {
    name: row.name,
    type: row.type,
    county: row.county,
    address: {
      street: row.street || '',
      city: row.city || '',
      state: 'NJ',
      zip: row.zip,
    },
    hours: parseHours(row),
    services: parseServices(row.services),
    languages: parseLanguages(row.languages),
    contact: {
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || '',
    },
    eligibility: row.eligibility || '',
    notes: row.notes || '',
    isActive: true,
  };

  // Add location if lat/lng provided
  if (row.latitude && row.longitude) {
    resource.location = {
      type: 'Point',
      coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
    };
  }

  return resource;
}

async function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find(arg => !arg.startsWith('--'));
  const isDryRun = args.includes('--dry-run');

  if (!csvPath) {
    console.error('❌ Error: CSV file path is required\n');
    console.log('Usage: node scripts/import-resources.js path/to/resources.csv [--dry-run]\n');
    console.log('CSV Format (header row required):');
    console.log('  name,type,county,street,city,zip,phone,email,website,services,languages,eligibility,notes');
    console.log('  monday_open,monday_close,tuesday_open,tuesday_close,... (for each day)\n');
    console.log('Example row:');
    console.log('  "Newark Pantry",food_pantry,Essex,"123 Main St",Newark,07102,(973)555-1234,info@pantry.org,https://pantry.org,"produce;formula","English;Spanish","Essex residents","Bring ID",09:00,17:00,,,09:00,17:00...\n');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log('📂 Reading CSV file...');
  console.log(`   Path: ${csvPath}`);
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no data will be imported)' : 'LIVE IMPORT'}\n`);

  try {
    const rows = parseCSV(csvPath);
    console.log(`✅ Parsed ${rows.length} rows from CSV\n`);

    const resources = [];
    const errors = [];

    // Transform rows to resources
    for (let i = 0; i < rows.length; i++) {
      try {
        const resource = rowToResource(rows[i], i + 2); // +2 for header and 0-index
        resources.push(resource);
        console.log(`   ✓ Row ${i + 2}: ${resource.name} (${resource.county} County)`);
      } catch (error) {
        errors.push({ row: i + 2, error: error.message });
        console.error(`   ✗ Row ${i + 2}: ${error.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Valid: ${resources.length}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors found. Please fix the CSV and try again.\n');
      process.exit(1);
    }

    if (isDryRun) {
      console.log('\n✅ Dry run complete. No data imported.');
      console.log('   Remove --dry-run flag to import data.\n');
      process.exit(0);
    }

    // Import resources
    console.log('\n💾 Importing resources to database...\n');

    let successCount = 0;
    let failCount = 0;

    for (const resource of resources) {
      try {
        await createFoodResource(resource);
        successCount++;
        console.log(`   ✓ Imported: ${resource.name}`);
      } catch (error) {
        failCount++;
        console.error(`   ✗ Failed: ${resource.name} - ${error.message}`);
      }
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}\n`);

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
