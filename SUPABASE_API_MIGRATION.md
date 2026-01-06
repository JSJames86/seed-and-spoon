# Supabase API Migration Guide

All API routes have been migrated from Django to Supabase.

---

## ✅ COMPLETED MIGRATIONS

### 1. **Food Banks API** → `/api/foodbanks`
**Method:** GET
**Supabase Table:** `foodbanks`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Food Bank Name",
    "county": "Essex",
    "latitude": 40.7128,
    "longitude": -74.0060,
    ...
  }
]
```

### 2. **Client Intake Form** → `/api/intakes`
**Method:** POST
**Supabase Table:** `intakes`

**Request Body:**
```json
{
  "kind": "client",
  "applicant": {
    "name": "John Doe",
    "phone": "555-1234",
    "email": "john@example.com",
    "preferredContact": "phone",
    "preferredLanguage": "English"
  },
  "address": {
    "street": "123 Main St",
    "city": "Newark",
    "state": "NJ",
    "zip": "07102"
  },
  "householdSize": 4,
  "hasChildrenUnder2": false,
  "allergies": [],
  "dietaryRestrictions": [],
  "consent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your application has been submitted successfully...",
  "id": "uuid"
}
```

### 3. **Provider Submission** → `/api/providers`
**Method:** POST
**Supabase Table:** `providers`

**Request Body:**
```json
{
  "orgName": "Community Food Pantry",
  "siteName": "Main Location",
  "county": "Essex",
  "address": {
    "street": "456 Oak Ave",
    "city": "Newark",
    "state": "NJ",
    "zip": "07102"
  },
  "type": "food_pantry",
  "services": ["produce", "prepared_meals"],
  "contact": {
    "phone": "555-5678",
    "email": "info@foodpantry.org",
    "website": "https://foodpantry.org"
  },
  "consent": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! Your submission has been received...",
  "id": "uuid"
}
```

### 4. **Donation Checkout** → `/api/donations/checkout`
**Method:** POST
**Stripe Integration:** ✅ Preserved
**Supabase Table:** `donation_sessions` (logs checkout sessions)

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "usd",
  "interval": "one_time",
  "source": "donate_page"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "cs_test_...",
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

### 5. **Donation Session Retrieval** → `/api/donations/session/[sessionId]`
**Method:** GET
**Stripe Integration:** ✅ Preserved

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "cs_test_...",
    "amount": 5000,
    "amountFormatted": "$50.00",
    "currency": "usd",
    "paymentStatus": "paid",
    "customerEmail": "donor@example.com"
  }
}
```

---

## 📊 REQUIRED SUPABASE TABLES

You need to create these tables in your Supabase project:

### 1. `foodbanks`
```sql
CREATE TABLE foodbanks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT DEFAULT 'NJ',
  zip TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type TEXT,
  hours JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_foodbanks_county ON foodbanks(county);
CREATE INDEX idx_foodbanks_zip ON foodbanks(zip);
```

### 2. `intakes`
```sql
CREATE TABLE intakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'client',
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  applicant_email TEXT,
  preferred_contact TEXT DEFAULT 'phone',
  preferred_language TEXT DEFAULT 'English',
  street TEXT,
  city TEXT,
  state TEXT DEFAULT 'NJ',
  zip TEXT NOT NULL,
  household_size INTEGER DEFAULT 1,
  has_children_under_2 BOOLEAN DEFAULT FALSE,
  infant_needs JSONB DEFAULT '[]'::jsonb,
  has_seniors_or_disability BOOLEAN DEFAULT FALSE,
  allergies JSONB DEFAULT '[]'::jsonb,
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  kitchen_access TEXT DEFAULT 'full',
  on_snap TEXT,
  on_wic TEXT,
  transportation TEXT,
  notes TEXT,
  consent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intakes_status ON intakes(status);
CREATE INDEX idx_intakes_zip ON intakes(zip);
```

### 3. `providers`
```sql
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name TEXT NOT NULL,
  site_name TEXT,
  county TEXT NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT DEFAULT 'NJ',
  zip TEXT NOT NULL,
  type TEXT,
  hours JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '["English"]'::jsonb,
  contact_phone TEXT,
  contact_email TEXT,
  contact_website TEXT,
  eligibility TEXT,
  notes TEXT,
  consent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_county ON providers(county);
```

### 4. `donation_sessions`
```sql
CREATE TABLE donation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  interval TEXT NOT NULL,
  source TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donation_sessions_stripe_id ON donation_sessions(stripe_session_id);
CREATE INDEX idx_donation_sessions_status ON donation_sessions(status);
```

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

Add these to your `.env.local` (and Vercel):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (already configured)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional
PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🧪 VERIFICATION TESTS

### Test 1: Food Banks API

```bash
curl http://localhost:3000/api/foodbanks
```

**Expected:** Array of food banks from Supabase

### Test 2: Client Intake Submission

```bash
curl -X POST http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "client",
    "applicant": {
      "name": "Test User",
      "phone": "555-1234",
      "email": "test@example.com"
    },
    "address": {
      "zip": "07102"
    },
    "householdSize": 1,
    "consent": true
  }'
```

**Expected:** Success response with ID

### Test 3: Provider Submission

```bash
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "Test Food Bank",
    "county": "Essex",
    "address": {
      "street": "123 Main St",
      "city": "Newark",
      "state": "NJ",
      "zip": "07102"
    },
    "type": "food_pantry",
    "contact": {
      "phone": "555-5678"
    },
    "consent": true
  }'
```

**Expected:** Success response with ID

### Test 4: Donation Checkout

```bash
curl -X POST http://localhost:3000/api/donations/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "interval": "one_time",
    "source": "test"
  }'
```

**Expected:** Stripe checkout URL

### Test 5: Test via Frontend

1. **Food Banks Map:**
   - Visit `/get-help`
   - Map should load with markers

2. **Client Intake Form:**
   - Visit `/get-help`
   - Fill out "Apply for Assistance" form
   - Submit should succeed

3. **Provider Submission:**
   - Visit `/get-help`
   - Click "List Your Organization"
   - Submit form

4. **Donation:**
   - Visit `/donate`
   - Select amount and click donate
   - Should redirect to Stripe Checkout

---

## 🔄 MIGRATION CHECKLIST

- [x] Create Supabase client utility (`lib/supabase.js`)
- [x] Migrate `/api/foodbanks` to Supabase JS client
- [x] Create `/api/intakes` endpoint
- [x] Create `/api/providers` endpoint
- [x] Create `/api/donations/checkout` with Stripe
- [x] Create `/api/donations/session/[id]` endpoint
- [x] Add `@supabase/supabase-js` to package.json
- [ ] **Run `bun install`** to install Supabase package
- [ ] **Create Supabase tables** (see SQL above)
- [ ] **Configure environment variables**
- [ ] **Test all endpoints**
- [ ] **Verify frontend forms work**

---

## 📁 FILES CREATED/MODIFIED

### New Files:
- `lib/supabase.js` - Supabase client utilities
- `app/api/intakes/route.js` - Client intake submissions
- `app/api/providers/route.js` - Provider submissions
- `app/api/donations/checkout/route.js` - Stripe checkout
- `app/api/donations/session/[sessionId]/route.js` - Session retrieval

### Modified Files:
- `app/api/foodbanks/route.js` - Updated to use Supabase JS client
- `package.json` - Added `@supabase/supabase-js` dependency

---

## 🚀 DEPLOYMENT NOTES

### Vercel Setup

1. **Add Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY` (if not already added)
   - `STRIPE_WEBHOOK_SECRET` (if not already added)

2. **Redeploy** to pick up new environment variables

3. **Verify** all forms work in production

### Supabase Setup

1. **Enable Row Level Security (RLS)** on all tables
2. **Create policies** for anonymous inserts on `intakes` and `providers`
3. **Create policy** for public read on `foodbanks`
4. **Keep `donation_sessions` restricted** to service role only

---

## ⚠️ IMPORTANT NOTES

1. **Stripe integration is PRESERVED** - All existing Stripe logic remains unchanged
2. **Frontend requires NO changes** - All APIs maintain the same request/response format
3. **Django-era endpoints are removed** - No more localhost:8000 or Render URLs
4. **Supabase tables must exist** - Run the SQL scripts above before testing

---

**Status:** ✅ API Migration Complete
**Next Steps:** Install dependencies, create tables, configure env vars, test
