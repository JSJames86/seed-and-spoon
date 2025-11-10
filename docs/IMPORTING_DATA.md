# Importing Data to MongoDB

This guide shows you how to import data from Excel spreadsheets or CSV files into your MongoDB database.

## Quick Start

### Import Any Excel/CSV File

```bash
# Test first (dry run)
npm run import your-file.xlsx collection-name -- --dry-run

# Actually import
npm run import your-file.xlsx collection-name
```

### Import Food Resources (Specific Format)

```bash
# Test first (dry run)
npm run import:resources resources.csv -- --dry-run

# Actually import
npm run import:resources resources.csv
```

## Method 1: General Excel/CSV Import

Use this method for any spreadsheet data you want to import into MongoDB.

### Step 1: Prepare Your File

**Option A: Excel (.xlsx)**
- Keep your data in Excel format
- Make sure the first row contains column headers
- Column headers will become field names in MongoDB

**Option B: CSV**
- Save your Excel file as CSV (File → Save As → CSV)
- First row should be headers

### Step 2: Run Import Command

```bash
# Basic import
npm run import path/to/file.xlsx collection-name

# Test first (recommended)
npm run import path/to/file.xlsx collection-name -- --dry-run

# Import specific Excel sheet
npm run import path/to/file.xlsx collection-name -- --sheet "Sheet2"

# Skip header rows
npm run import path/to/file.csv collection-name -- --skip 1

# Upsert mode (update existing records)
npm run import path/to/file.xlsx collection-name -- --upsert --key email
```

### Import Options

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Test without importing data | `--dry-run` |
| `--sheet <name>` | Choose specific Excel sheet | `--sheet "Donations"` |
| `--skip <n>` | Skip first N rows | `--skip 2` |
| `--upsert` | Update existing records | `--upsert --key email` |
| `--key <field>` | Field to match for upsert | `--key email` |

### Examples

**Import donations from Excel:**
```bash
npm run import donations.xlsx donations -- --dry-run
npm run import donations.xlsx donations
```

**Import volunteers and update existing:**
```bash
npm run import volunteers.csv volunteers -- --upsert --key email
```

**Import from specific sheet:**
```bash
npm run import data.xlsx resources -- --sheet "Food Banks"
```

## Method 2: Food Resources Import

Use this for importing food assistance resources with the specific format required for the Get Help page.

### Step 1: Download Template

The template is located at: `scripts/resources-template.csv`

### Step 2: Fill in Your Data

Required columns:
- **name** - Resource name (e.g., "Newark Food Pantry")
- **type** - One of: `food_pantry`, `hot_meal`, `mobile_pantry`, `community_fridge`, `other`
- **county** - NJ county name (e.g., "Essex", "Morris")
- **zip** - 5-digit ZIP code

Optional columns:
- **street**, **city** - Address details
- **phone**, **email**, **website** - Contact information
- **services** - Semicolon-separated (e.g., "produce;formula;baby_food")
- **languages** - Semicolon-separated (e.g., "English;Spanish")
- **eligibility** - Who can use this resource
- **notes** - Additional information
- **latitude**, **longitude** - GPS coordinates for mapping
- **monday_open**, **monday_close**, etc. - Hours for each day

### Step 3: Import Resources

```bash
# Test first
npm run import:resources path/to/resources.csv -- --dry-run

# Import
npm run import:resources path/to/resources.csv
```

### Resource Import Example

CSV file:
```csv
name,type,county,street,city,zip,phone,email,website,services,languages,monday_open,monday_close
"Newark Food Pantry",food_pantry,Essex,"123 Main St",Newark,07102,(973)555-1234,info@pantry.org,,"produce;formula","English;Spanish",09:00,17:00
```

## Data Type Conversion

The import script automatically converts data types:

| Excel Value | Converted To | Example |
|-------------|--------------|---------|
| `123` or `"123"` | Number | `123` |
| `123.45` | Number | `123.45` |
| `true`, `yes` | Boolean | `true` |
| `false`, `no` | Boolean | `false` |
| `2024-01-15` | Date | `ISODate("2024-01-15")` |
| Everything else | String | `"text"` |

## Collections You Can Import To

Common collections in your database:

| Collection | Purpose | Upsert Key |
|------------|---------|------------|
| `donations` | Donation records | `stripeSessionId` or `donorEmail` |
| `submissions` | Form submissions | `email` |
| `resources` | Food assistance resources | `name` |
| `intakes` | Client intake forms | `email` |
| `volunteers` | Volunteer information | `email` |
| `provider_submissions` | Provider submissions | `email` |

## Excel-Specific Features

### Installing Excel Support

For `.xlsx` files, you need the `xlsx` package:

```bash
npm install xlsx
```

If you don't have it installed, the script will tell you. You can also just use CSV files instead.

### Working with Multiple Sheets

List sheets in your Excel file:
```bash
node -e "const XLSX = require('xlsx'); const wb = XLSX.readFile('file.xlsx'); console.log(wb.SheetNames);"
```

Import specific sheet:
```bash
npm run import file.xlsx collection-name -- --sheet "Sheet2"
```

## Troubleshooting

### Issue: "xlsx package not installed"

**Solution:** Install it:
```bash
npm install xlsx
```

Or convert your Excel file to CSV in Excel (File → Save As → CSV).

### Issue: Import fails with validation errors

**Solution:** Run with `--dry-run` first to see all errors:
```bash
npm run import file.xlsx collection -- --dry-run
```

Fix the errors in your spreadsheet and try again.

### Issue: Duplicate records

**Solution:** Use upsert mode to update instead of insert:
```bash
npm run import file.xlsx collection -- --upsert --key email
```

### Issue: Column names have spaces

**Solution:** The script automatically converts spaces to underscores:
- `"First Name"` becomes `first_name`
- `"Email Address"` becomes `email_address`

### Issue: Some rows are skipped

**Solution:** Make sure:
- Rows aren't completely empty
- Required fields have values
- Data matches expected format

## Best Practices

1. **Always test first** - Use `--dry-run` to preview before importing
2. **Backup your data** - Export existing data before large imports
3. **Use upsert for updates** - Prevents duplicate records
4. **Validate your spreadsheet** - Check for missing required fields
5. **Clean your data** - Remove extra spaces, check formatting
6. **Use templates** - Start from `resources-template.csv` when applicable
7. **Check imported data** - Query MongoDB after import to verify

## Viewing Imported Data

### Using MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your `MONGODB_URI` from `.env.local`
3. Browse your collections and documents

### Using Command Line

```bash
# In your project
node -e "import('./lib/mongodb.js').then(async ({getCollection}) => {
  const col = await getCollection('your-collection');
  const docs = await col.find({}).limit(10).toArray();
  console.log(docs);
  process.exit(0);
});"
```

## Advanced: Custom Transformations

If you need custom data transformations, edit `scripts/import-excel.js` and modify the `transformRow()` function:

```javascript
function transformRow(row) {
  const transformed = {};

  // Your custom transformations here
  // Example: Combine first and last name
  if (row.first_name && row.last_name) {
    transformed.fullName = `${row.first_name} ${row.last_name}`;
  }

  // Add metadata
  transformed.importedAt = new Date();

  return transformed;
}
```

## Need Help?

- Check MongoDB connection: `npm run test:db`
- View script help: `node scripts/import-excel.js`
- See examples: `scripts/resources-template.csv`
- MongoDB docs: [MongoDB Manual](https://docs.mongodb.com/manual/)
