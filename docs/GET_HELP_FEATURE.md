# Get Help Feature Documentation

## Overview

The Get Help page (`/get-help`) is a comprehensive food assistance platform that includes:
- Client intake application form
- Referral partner form for organizations
- Interactive map of food resources
- County-based directory
- Provider self-submission workflow

## Table of Contents
1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Data Import](#data-import)
4. [API Reference](#api-reference)
5. [Component Architecture](#component-architecture)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Environment Setup

Ensure your `.env.local` file contains:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=seedandspoon
```

### 2. Initialize Database

Run the initialization script to create indexes and optionally seed sample data:

```bash
# Just create indexes
node scripts/init-db.js

# Create indexes AND add sample data
node scripts/init-db.js --seed
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/get-help`

---

## Database Setup

### Collections

#### **1. resources**
Stores food pantries, meal sites, and other food resources.

**Schema:**
```javascript
{
  name: String,                     // "Newark Community Food Pantry"
  type: Enum,                       // food_pantry | hot_meal | mobile_pantry | community_fridge | other
  county: String,                   // NJ county name
  location: GeoJSON Point,          // { type: 'Point', coordinates: [lng, lat] }
  address: {
    street: String,
    city: String,
    state: String,                  // Always "NJ"
    zip: String                     // 5-digit ZIP
  },
  hours: [                          // Array of operating hours
    {
      day: String,                  // Monday-Sunday
      open: String,                 // "09:00" (24-hour format)
      close: String                 // "17:00"
    }
  ],
  services: [String],               // produce, prepared_meals, diapers, formula, baby_food, halal, kosher, vegetarian, vegan
  languages: [String],              // Languages spoken
  contact: {
    phone: String,
    email: String,
    website: String
  },
  eligibility: String,              // Eligibility requirements
  notes: String,                    // Additional information
  isActive: Boolean,                // Currently active?
  lastVerifiedAt: Date,             // Last verified date
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `location` - 2dsphere index for geospatial queries
- `county, type, isActive` - Compound index for filtering
- `name` - Text index for search

#### **2. intakes**
Stores client applications and partner referrals.

**Schema:**
```javascript
{
  kind: Enum,                       // 'client' | 'referral'
  status: Enum,                     // new | in_review | contacted | fulfilled | closed
  channel: String,                  // web | phone | in_person
  applicant: {
    name: String,
    phone: String,
    email: String,
    preferredContact: Enum,         // phone | text | email
    preferredLanguage: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  householdSize: Number,
  hasChildrenUnder2: Boolean,
  infantNeeds: [String],            // formula, baby_food, diapers
  hasSeniorsOrDisability: Boolean,
  allergies: [String],
  dietaryRestrictions: [String],
  kitchenAccess: Enum,              // full | limited | none
  onSNAP: String,                   // yes | no | unsure
  onWIC: String,                    // yes | no
  transportation: String,           // yes | no | sometimes
  referrer: {                       // Only for kind=referral
    orgName: String,
    contactName: String,
    phone: String,
    email: String,
    servicesProvided: [String]
  },
  clientConsent: Boolean,           // Required for referrals
  notes: String,
  tags: [String],
  suggestedResources: [ObjectId],   // Auto-matched resources
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdAt` - Descending (most recent first)
- `kind, status` - Compound index
- `address.zip` - For location matching

#### **3. provider_submissions**
Stores provider self-submission requests (pending approval).

**Schema:**
```javascript
{
  orgName: String,
  siteName: String,
  county: String,
  address: Object,
  location: GeoJSON Point,
  hours: Array,
  services: [String],
  languages: [String],
  contact: Object,
  eligibility: String,
  notes: String,
  status: Enum,                     // pending | approved | rejected
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: String
}
```

---

## Data Import

### Method 1: Using the Init Script (Recommended for Testing)

```bash
node scripts/init-db.js --seed
```

This adds 10 sample resources across NJ counties.

### Method 2: CSV Import (Recommended for Production)

1. **Prepare your CSV file** using the template:
   ```bash
   cp scripts/resources-template.csv my-resources.csv
   ```

2. **Edit the CSV** with your resource data. Required columns:
   - name, type, county, zip

3. **Test the import** (dry run):
   ```bash
   node scripts/import-resources.js my-resources.csv --dry-run
   ```

4. **Import for real**:
   ```bash
   node scripts/import-resources.js my-resources.csv
   ```

### CSV Format

```csv
name,type,county,street,city,zip,phone,email,website,services,languages,eligibility,notes,latitude,longitude,monday_open,monday_close,...
```

**Notes:**
- Use semicolons (`;`) to separate multiple values in services/languages
- Hours: Use 24-hour format (HH:mm), e.g., `09:00`, `17:00`
- Type must be one of: `food_pantry`, `hot_meal`, `mobile_pantry`, `community_fridge`, `other`
- County must be a valid NJ county name

### Geocoding Addresses

If you don't have latitude/longitude coordinates, you can:

1. **Use a geocoding service** (Mapbox, Google Maps, OpenCage):
   ```javascript
   // Example with OpenCage (free tier available)
   const response = await fetch(
     `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=YOUR_KEY`
   );
   const { lat, lng } = response.results[0].geometry;
   ```

2. **Batch geocode** your CSV before importing
3. **Leave blank** - Map will use county center as fallback

---

## API Reference

### POST /api/intakes

Submit a client application or partner referral.

**Request Body (Client):**
```json
{
  "kind": "client",
  "applicant": {
    "name": "John Doe",
    "phone": "(555) 123-4567",
    "email": "john@example.com",
    "preferredContact": "phone",
    "preferredLanguage": "English"
  },
  "address": {
    "zip": "07102"
  },
  "householdSize": 3,
  "hasChildrenUnder2": true,
  "infantNeeds": ["formula", "diapers"],
  "consent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application received successfully",
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "status": "new",
  "suggestedResourcesCount": 3
}
```

**Rate Limit:** 3 requests per hour per IP

---

### GET /api/resources

Query food resources with filters.

**Query Parameters:**
- `county` - Filter by NJ county (e.g., `Essex`)
- `type` - Filter by type (`food_pantry`, `hot_meal`, etc.)
- `service` - Filter by service (e.g., `formula`)
- `openNow` - Filter for currently open (true/false)
- `zip` - Filter by ZIP code
- `lat` & `lng` - Geospatial search (returns sorted by distance)
- `radiusKm` - Search radius in km (default: 25)
- `limit` - Max results (default: 100)

**Examples:**
```bash
# All pantries in Essex County
GET /api/resources?county=Essex&type=food_pantry

# Resources with formula near ZIP 07102
GET /api/resources?zip=07102&service=formula

# Open now in Hudson County
GET /api/resources?county=Hudson&openNow=true

# Within 10km of coordinates
GET /api/resources?lat=40.7357&lng=-74.1724&radiusKm=10
```

**Response:**
```json
{
  "success": true,
  "resources": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Newark Community Food Pantry",
      "type": "food_pantry",
      "county": "Essex",
      "address": {...},
      "hours": [...],
      "services": ["produce", "formula"],
      "contact": {...},
      "distanceMeters": 1234,
      "distanceMiles": "0.8"
    }
  ],
  "count": 1
}
```

**Rate Limit:** 30 requests per minute per IP

---

### POST /api/providers

Submit a request to be listed in the directory.

**Request Body:**
```json
{
  "orgName": "Community Food Bank",
  "county": "Middlesex",
  "address": {
    "street": "123 Main St",
    "city": "New Brunswick",
    "state": "NJ",
    "zip": "08901"
  },
  "type": "food_pantry",
  "services": ["produce", "formula"],
  "languages": ["English", "Spanish"],
  "contact": {
    "phone": "(732) 555-1234",
    "email": "info@foodbank.org"
  },
  "consent": true
}
```

**Response:**
```json
{
  "success": true,
  "status": "received",
  "message": "Thank you! Your submission has been received...",
  "submissionId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Rate Limit:** 1 request per hour per IP

---

## Component Architecture

### Page Structure
```
/app/get-help/page.jsx
  ├─ Hero Section
  ├─ Form Section
  │  ├─ ClientIntakeForm
  │  └─ ReferralIntakeForm
  ├─ Map & Directory Section
  │  ├─ ResourceMap (Leaflet)
  │  └─ CountyDirectory
  └─ Provider CTA + Modal
     └─ ProviderSubmissionModal
```

### Component Tree
```
GetHelpPage
├─ ClientIntakeForm
│  ├─ FormSection (multiple)
│  ├─ FormField (many)
│  └─ Alert
├─ ReferralIntakeForm
│  ├─ FormSection
│  ├─ FormField
│  └─ Alert
├─ ResourceMap
│  └─ Leaflet (dynamic import)
├─ CountyDirectory
└─ ProviderSubmissionModal
   ├─ FormField
   └─ Alert
```

### Key Components

#### **FormField** (`/components/get-help/FormField.jsx`)
Reusable form input with validation, accessibility, and multiple types.

**Props:**
- `label`, `name`, `type`, `value`, `onChange`, `error`, `required`
- `type`: text, email, tel, number, textarea, select, checkbox, checkbox-group, radio
- `options`: Array for select/radio/checkbox-group

#### **ResourceMap** (`/components/get-help/ResourceMap.jsx`)
Interactive Leaflet map with filtering.

**Props:**
- `filters`: Current filter state
- `onFilterChange`: Callback when filters change
- `selectedResource`: Currently selected resource
- `onResourceSelect`: Callback when resource clicked

**Features:**
- Geolocation
- Custom markers by type
- Popup cards
- Filter UI

#### **CountyDirectory** (`/components/get-help/CountyDirectory.jsx`)
Accordion list grouped by county.

**Props:**
- `filters`: Shares filters with map
- `onResourceClick`: Callback for resource selection

---

## Customization

### Add a New Service Type

1. **Update Validation** (`lib/validation.js`):
```javascript
const SERVICE_OPTIONS = [
  'produce',
  'prepared_meals',
  'your_new_service',  // Add here
  // ...
];
```

2. **Update Form Options** (in relevant form components):
```javascript
{ value: 'your_new_service', label: 'Your New Service' }
```

3. **Update Directory Badges** (`components/get-help/CountyDirectory.jsx`):
```javascript
const SERVICE_BADGES = {
  your_new_service: { label: 'New Service', color: 'bg-indigo-100 text-indigo-800' },
  // ...
};
```

### Add a New Resource Type

1. **Update validation enum** in `lib/validation.js`
2. **Add icon** to TYPE_ICONS in `ResourceMap.jsx`
3. **Add label** to TYPE_LABELS

### Change Map Tiles

In `ResourceMap.jsx`, replace the tile layer:
```javascript
// Current: OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {...})

// Alternative: Mapbox (requires API key)
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  accessToken: 'YOUR_MAPBOX_TOKEN'
})
```

### Internationalization

The i18n scaffolding is in place. To add translations:

1. **Add translations** to `lib/i18n/translations.js`:
```javascript
es: {
  'client.title': 'Solicitar Asistencia Alimentaria',
  // ...
}
```

2. **Use in components**:
```javascript
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('client.title')}</h1>;
}
```

3. **Wrap pages** with LanguageProvider:
```javascript
<LanguageProvider>
  <YourPage />
</LanguageProvider>
```

---

## Troubleshooting

### Map Not Displaying

**Problem:** Map div shows but no tiles load.

**Solutions:**
1. Check browser console for errors
2. Verify Leaflet CSS is imported in ResourceMap.jsx
3. Check CSP headers allow tiles from openstreetmap.org
4. Clear browser cache

### No Resources Showing

**Problem:** Map and directory are empty.

**Solutions:**
1. Verify data was imported: `mongosh` → `use seedandspoon` → `db.resources.countDocuments()`
2. Check `isActive: true` on resources
3. Check API response in browser Network tab
4. Verify indexes were created: `db.resources.getIndexes()`

### Form Validation Not Working

**Problem:** Form submits with invalid data.

**Solutions:**
1. Check Zod schemas match frontend form structure
2. Verify validation errors are displayed
3. Check browser console for JS errors
4. Ensure `noValidate` is on form element

### Geospatial Queries Failing

**Problem:** Error: "unable to find index for $geoNear query"

**Solution:**
```bash
# Recreate indexes
node scripts/init-db.js
```

Or manually:
```javascript
db.resources.createIndex({ location: "2dsphere" })
```

### Rate Limiting Issues

**Problem:** Getting 429 errors during testing.

**Solution:**
Temporarily disable rate limiting in `/lib/api-helpers.js` (for development only):
```javascript
export function checkRateLimit(key, max, windowMs) {
  return { allowed: true }; // Skip rate limiting
}
```

---

## Production Checklist

Before deploying to production:

- [ ] Set up MongoDB Atlas with proper security
- [ ] Enable rate limiting on all API routes
- [ ] Add captcha to all public forms
- [ ] Set up email notifications for intakes
- [ ] Configure proper environment variables
- [ ] Test on mobile devices
- [ ] Run accessibility audit
- [ ] Set up monitoring and logging
- [ ] Create admin dashboard for intake management
- [ ] Verify all PII is properly protected
- [ ] Test all error states
- [ ] Set up backups for MongoDB
- [ ] Add analytics tracking (optional)

---

## Need Help?

- Check the [main README](/README.md)
- Review the [API helpers](/lib/api-helpers.js) for common utilities
- Examine the [validation schemas](/lib/validation.js) for data structures

---

**Last Updated:** 2025-11-10
