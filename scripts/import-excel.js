/**
 * Generic Excel/CSV Import Script for MongoDB
 *
 * Import data from Excel (.xlsx) or CSV files into any MongoDB collection
 *
 * Usage:
 *   node scripts/import-excel.js <file-path> <collection-name> [options]
 *
 * Options:
 *   --dry-run       Test without importing
 *   --sheet <name>  Specify Excel sheet name (default: first sheet)
 *   --skip <n>      Skip first N rows (default: 0)
 *   --upsert        Update existing documents instead of creating duplicates
 *   --key <field>   Field to use for upsert matching (e.g., email, name)
 *
 * Examples:
 *   node scripts/import-excel.js data.xlsx donations --dry-run
 *   node scripts/import-excel.js data.csv volunteers --upsert --key email
 *   node scripts/import-excel.js data.xlsx resources --sheet "Food Banks"
 */

import fs from 'fs';
import path from 'path';
import { getCollection } from '../lib/mongodb.js';

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 1) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v)) continue; // Skip empty rows

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse Excel file (requires xlsx package)
 */
async function parseExcel(filePath, sheetName = null) {
  try {
    // Dynamically import xlsx package
    const XLSX = await import('xlsx');

    const workbook = XLSX.readFile(filePath);
    const sheet = sheetName
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return rows;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'xlsx package not installed. Run: npm install xlsx\n' +
        'Or convert your Excel file to CSV and use that instead.'
      );
    }
    throw error;
  }
}

/**
 * Transform row data (convert strings to proper types)
 */
function transformRow(row) {
  const transformed = {};

  for (const [key, value] of Object.entries(row)) {
    // Skip empty values
    if (value === '' || value === null || value === undefined) {
      continue;
    }

    // Convert to lowercase key (MongoDB convention)
    const cleanKey = key.trim().replace(/\s+/g, '_').toLowerCase();

    // Try to parse numbers
    if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) {
      transformed[cleanKey] = parseFloat(value);
    }
    // Try to parse booleans
    else if (typeof value === 'string' && /^(true|false|yes|no)$/i.test(value.trim())) {
      transformed[cleanKey] = /^(true|yes)$/i.test(value.trim());
    }
    // Try to parse dates (basic ISO format)
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value.trim())) {
      transformed[cleanKey] = new Date(value.trim());
    }
    // Keep as string
    else {
      transformed[cleanKey] = typeof value === 'string' ? value.trim() : value;
    }
  }

  // Add metadata
  transformed.importedAt = new Date();

  return transformed;
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const filePath = args.find(arg => !arg.startsWith('--'));
  const collectionName = args.find((arg, i) => i > 0 && !arg.startsWith('--') && !args[i - 1].startsWith('--'));

  const isDryRun = args.includes('--dry-run');
  const isUpsert = args.includes('--upsert');
  const sheetIndex = args.indexOf('--sheet');
  const sheetName = sheetIndex !== -1 ? args[sheetIndex + 1] : null;
  const skipIndex = args.indexOf('--skip');
  const skipRows = skipIndex !== -1 ? parseInt(args[skipIndex + 1]) : 0;
  const keyIndex = args.indexOf('--key');
  const upsertKey = keyIndex !== -1 ? args[keyIndex + 1] : '_id';

  // Validate arguments
  if (!filePath || !collectionName) {
    console.error('❌ Error: Missing required arguments\n');
    console.log('Usage: node scripts/import-excel.js <file-path> <collection-name> [options]\n');
    console.log('Options:');
    console.log('  --dry-run       Test without importing');
    console.log('  --sheet <name>  Specify Excel sheet name (default: first sheet)');
    console.log('  --skip <n>      Skip first N rows (default: 0)');
    console.log('  --upsert        Update existing documents instead of creating duplicates');
    console.log('  --key <field>   Field to use for upsert matching (default: _id)\n');
    console.log('Examples:');
    console.log('  node scripts/import-excel.js data.xlsx donations --dry-run');
    console.log('  node scripts/import-excel.js data.csv volunteers --upsert --key email');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const isExcel = ext === '.xlsx' || ext === '.xls';
  const isCSV = ext === '.csv';

  if (!isExcel && !isCSV) {
    console.error('❌ Error: File must be .xlsx, .xls, or .csv');
    process.exit(1);
  }

  console.log('📂 Import Configuration');
  console.log(`   File: ${filePath}`);
  console.log(`   Collection: ${collectionName}`);
  console.log(`   Mode: ${isDryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  if (isExcel && sheetName) console.log(`   Sheet: ${sheetName}`);
  if (skipRows > 0) console.log(`   Skipping: ${skipRows} rows`);
  if (isUpsert) console.log(`   Upsert: enabled (key: ${upsertKey})`);
  console.log('');

  try {
    // Parse file
    console.log(`📖 Reading ${isExcel ? 'Excel' : 'CSV'} file...`);
    let rows = isExcel
      ? await parseExcel(filePath, sheetName)
      : parseCSV(filePath);

    // Skip rows if specified
    if (skipRows > 0) {
      rows = rows.slice(skipRows);
    }

    console.log(`✅ Parsed ${rows.length} rows\n`);

    if (rows.length === 0) {
      console.log('⚠️  No data to import');
      process.exit(0);
    }

    // Transform rows
    console.log('🔄 Transforming data...');
    const documents = rows.map((row, i) => {
      try {
        return transformRow(row);
      } catch (error) {
        console.error(`   ✗ Row ${i + 1}: ${error.message}`);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ Transformed ${documents.length} documents\n`);

    // Show sample
    console.log('📋 Sample document (first row):');
    console.log(JSON.stringify(documents[0], null, 2));
    console.log('');

    if (isDryRun) {
      console.log('✅ Dry run complete. No data imported.');
      console.log('   Remove --dry-run flag to import data.\n');
      process.exit(0);
    }

    // Import to MongoDB
    console.log(`💾 Importing to MongoDB collection "${collectionName}"...\n`);

    const collection = await getCollection(collectionName);

    let successCount = 0;
    let failCount = 0;
    let updateCount = 0;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];

      try {
        if (isUpsert && doc[upsertKey]) {
          // Upsert mode - update if exists, insert if not
          const result = await collection.updateOne(
            { [upsertKey]: doc[upsertKey] },
            { $set: doc },
            { upsert: true }
          );

          if (result.upsertedCount > 0) {
            successCount++;
            console.log(`   ✓ Inserted: ${doc[upsertKey] || `row ${i + 1}`}`);
          } else {
            updateCount++;
            console.log(`   ↻ Updated: ${doc[upsertKey] || `row ${i + 1}`}`);
          }
        } else {
          // Insert mode
          await collection.insertOne(doc);
          successCount++;
          console.log(`   ✓ Inserted: ${doc.name || doc.email || `row ${i + 1}`}`);
        }
      } catch (error) {
        failCount++;
        console.error(`   ✗ Failed: ${error.message}`);
      }
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`   Inserted: ${successCount}`);
    if (updateCount > 0) console.log(`   Updated: ${updateCount}`);
    console.log(`   Failed: ${failCount}\n`);

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
