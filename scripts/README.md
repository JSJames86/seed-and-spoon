# Scripts Directory

Utility scripts for managing the Get Help feature and database.

## Available Scripts

### 1. Database Initialization

**`init-db.js`** - Initialize database indexes and optionally seed sample data

```bash
# Create indexes only
node scripts/init-db.js

# Create indexes AND seed 10 sample resources
node scripts/init-db.js --seed
```

**What it does:**
- Creates all required MongoDB indexes
- Optionally adds 10 sample food resources across NJ counties
- Verifies existing data before seeding

**When to use:**
- First-time setup
- After database reset
- When indexes are missing

---

### 2. CSV Import

**`import-resources.js`** - Import food resources from CSV file

```bash
# Dry run (test without importing)
node scripts/import-resources.js data.csv --dry-run

# Import for real
node scripts/import-resources.js data.csv
```

**CSV Template:** `resources-template.csv`

**Required columns:**
- name, type, county, zip

**Optional columns:**
- street, city, phone, email, website
- services (semicolon-separated)
- languages (semicolon-separated)
- eligibility, notes
- latitude, longitude
- monday_open, monday_close, ... (for each day)

**Example CSV row:**
```csv
"Newark Pantry",food_pantry,Essex,"123 Main St",Newark,07102,(973)555-1234,info@pantry.org,https://pantry.org,"produce;formula","English;Spanish","Essex residents","Bring ID",40.7357,-74.1724,09:00,17:00,,,09:00,17:00,,,,,,,
```

**What it does:**
- Validates CSV data
- Shows preview with dry-run
- Bulk imports resources to database
- Reports success/failure for each row

**When to use:**
- Initial data population
- Bulk updates
- Importing from external sources

---

### 3. Admin Utilities

**`admin-utils.js`** - Manage resources, intakes, and provider submissions

```bash
# Show database statistics
node scripts/admin-utils.js stats

# List intake applications (default: new)
node scripts/admin-utils.js list-intakes [status]

# Update intake status
node scripts/admin-utils.js update-intake <id> <status>
# Status: new | in_review | contacted | fulfilled | closed

# List provider submissions (default: pending)
node scripts/admin-utils.js list-providers [status]

# Approve provider and create resource
node scripts/admin-utils.js approve-provider <id>

# Reject provider submission
node scripts/admin-utils.js reject-provider <id>

# Deactivate a resource (hide from map/directory)
node scripts/admin-utils.js deactivate-resource <id>

# Mark resource as verified (updates timestamp)
node scripts/admin-utils.js verify-resource <id>

# Search resources by name
node scripts/admin-utils.js search-resources "keyword"
```

**What it does:**
- Provides CLI interface for common admin tasks
- Shows detailed information about records
- Approves/rejects provider submissions
- Manages resource lifecycle

**When to use:**
- Daily intake management
- Provider approval workflow
- Resource verification
- Quick database queries

---

## Quick Start Guide

### Initial Setup (First Time)

```bash
# 1. Create indexes and add sample data
node scripts/init-db.js --seed

# 2. Verify data was added
node scripts/admin-utils.js stats

# 3. View sample resources
node scripts/admin-utils.js search-resources "pantry"
```

### Production Setup (Your Data)

```bash
# 1. Create indexes only
node scripts/init-db.js

# 2. Prepare your CSV (use template as guide)
cp scripts/resources-template.csv my-data.csv
# Edit my-data.csv with your resources

# 3. Test import (dry run)
node scripts/import-resources.js my-data.csv --dry-run

# 4. Import for real
node scripts/import-resources.js my-data.csv

# 5. Verify import
node scripts/admin-utils.js stats
```

### Daily Workflow

```bash
# Check for new intakes
node scripts/admin-utils.js list-intakes new

# Process an intake
node scripts/admin-utils.js update-intake <id> in_review

# Check pending provider submissions
node scripts/admin-utils.js list-providers pending

# Approve a provider
node scripts/admin-utils.js approve-provider <id>
```

---

## Environment Requirements

All scripts require:
- Node.js 18+
- MongoDB connection (`.env.local` configured)
- Project dependencies installed (`npm install`)

**Required Environment Variables:**
```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=seedandspoon
```

---

## Troubleshooting

### "Cannot find module"
```bash
# Make sure you're in the project root
cd /path/to/seed-and-spoon

# Re-install dependencies
npm install
```

### "MongoDB connection failed"
```bash
# Check your .env.local file
cat .env.local | grep MONGODB

# Test connection
mongosh "$MONGODB_URI"
```

### "Indexes already exist"
This is normal on subsequent runs. The script will skip creating existing indexes.

### Import fails with validation errors
Check the CSV format matches the template. Common issues:
- Missing required columns (name, type, county, zip)
- Invalid county name (must be exact NJ county name)
- Invalid type (must be: food_pantry, hot_meal, mobile_pantry, community_fridge, other)
- Invalid ZIP (must be 5 digits)

---

## Script Details

### File Structure
```
scripts/
├── README.md                    # This file
├── init-db.js                   # Database initialization
├── import-resources.js          # CSV import utility
├── admin-utils.js               # Admin CLI tools
└── resources-template.csv       # CSV template
```

### Dependencies
Scripts use existing project utilities:
- `lib/mongodb.js` - Database connection
- `lib/models.js` - Data models and CRUD operations
- `lib/validation.js` - Validation schemas and constants

---

## Future Enhancements

Potential additions:
- [ ] Export resources to CSV
- [ ] Bulk update script
- [ ] Geocoding service integration
- [ ] Email notification scripts
- [ ] Scheduled verification reminders
- [ ] Analytics/reporting scripts
- [ ] Backup/restore utilities

---

## Need Help?

- Full documentation: `/docs/GET_HELP_FEATURE.md`
- API reference: See documentation
- Code: All scripts are well-commented

---

**Last Updated:** 2025-11-10
