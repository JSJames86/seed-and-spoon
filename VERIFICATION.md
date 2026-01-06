# Seed & Spoon - Verification & Testing Guide

Complete guide for testing the Supabase migration and authentication system.

---

## 📋 PRE-FLIGHT CHECKLIST

Before testing, ensure you have:

- [x] Created all Supabase tables (see `SUPABASE_API_MIGRATION.md`)
- [x] Added environment variables to `.env.local`
- [x] Run `bun install` to install dependencies
- [x] Generated `bun.lockb` (should exist after install)

---

## 🚀 LOCAL DEVELOPMENT SETUP

### 1. Start the Development Server

```bash
bun run dev
```

**Expected output:**
```
$ bun --bun next dev
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in xxxms
```

### 2. Verify Environment Variables

Create `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional
PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🧪 API ENDPOINT TESTING

### Test 1: Food Banks API

**Endpoint:** `GET /api/foodbanks`

**cURL command:**
```bash
curl http://localhost:3000/api/foodbanks
```

**Expected response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Community Food Bank of New Jersey",
    "county": "Essex",
    "street": "31 Evans Terminal",
    "city": "Hillside",
    "state": "NJ",
    "zip": "07205",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "type": "food_bank",
    "hours": [],
    "services": ["produce", "prepared_meals"],
    "phone": "908-355-3663",
    "email": "info@cfbnj.org",
    "website": "https://cfbnj.org",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Supabase Query (for verification):**
```sql
SELECT * FROM foodbanks ORDER BY name ASC;
```

---

### Test 2: Client Intake Submission

**Endpoint:** `POST /api/intakes`

**cURL command:**
```bash
curl -X POST http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -d '{
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
    "hasSeniorsOrDisability": false,
    "allergies": ["peanuts", "shellfish"],
    "dietaryRestrictions": ["vegetarian"],
    "kitchenAccess": "full",
    "onSNAP": "yes",
    "onWIC": "no",
    "transportation": "public",
    "notes": "Prefer morning pickup times",
    "consent": true
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Your application has been submitted successfully. Our team will review your information and contact you within 2-3 business days.",
  "id": "uuid-here"
}
```

**Supabase Query (for verification):**
```sql
SELECT * FROM intakes
WHERE applicant_phone = '555-1234'
ORDER BY submitted_at DESC
LIMIT 1;
```

**Minimal payload (required fields only):**
```bash
curl -X POST http://localhost:3000/api/intakes \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "client",
    "applicant": {
      "name": "Test User",
      "phone": "555-0000"
    },
    "address": {
      "zip": "07102"
    },
    "consent": true
  }'
```

---

### Test 3: Provider Submission

**Endpoint:** `POST /api/providers`

**cURL command:**
```bash
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
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
    "hours": [
      {
        "day": "Monday",
        "open": "09:00",
        "close": "17:00"
      },
      {
        "day": "Wednesday",
        "open": "09:00",
        "close": "17:00"
      }
    ],
    "services": ["produce", "prepared_meals", "diapers"],
    "languages": ["English", "Spanish"],
    "contact": {
      "phone": "555-5678",
      "email": "info@foodpantry.org",
      "website": "https://foodpantry.org"
    },
    "eligibility": "Open to all Essex County residents",
    "notes": "Please call ahead to schedule pickup",
    "consent": true
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Thank you! Your submission has been received and is pending review. We will contact you at the provided email or phone number within 3-5 business days.",
  "id": "uuid-here"
}
```

**Supabase Query (for verification):**
```sql
SELECT * FROM providers
WHERE org_name = 'Community Food Pantry'
ORDER BY submitted_at DESC
LIMIT 1;
```

**Minimal payload (required fields only):**
```bash
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "orgName": "Test Food Bank",
    "county": "Essex",
    "address": {
      "zip": "07102"
    },
    "contact": {
      "phone": "555-9999"
    },
    "consent": true
  }'
```

---

### Test 4: Donation Checkout

**Endpoint:** `POST /api/donations/checkout`

**One-time donation:**
```bash
curl -X POST http://localhost:3000/api/donations/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "usd",
    "interval": "one_time",
    "source": "donate_page"
  }'
```

**Monthly donation:**
```bash
curl -X POST http://localhost:3000/api/donations/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "usd",
    "interval": "monthly",
    "source": "donate_page"
  }'
```

**Expected response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6...",
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6..."
  }
}
```

**Supabase Query (for verification):**
```sql
SELECT * FROM donation_sessions
ORDER BY created_at DESC
LIMIT 10;
```

---

### Test 5: Donation Session Retrieval

**Endpoint:** `GET /api/donations/session/[sessionId]`

**cURL command:**
```bash
curl http://localhost:3000/api/donations/session/cs_test_a1b2c3d4e5f6...
```

**Expected response:**
```json
{
  "success": true,
  "session": {
    "id": "cs_test_a1b2c3d4e5f6...",
    "amount": 5000,
    "amountFormatted": "$50.00",
    "currency": "usd",
    "paymentStatus": "paid",
    "customerEmail": "donor@example.com",
    "metadata": {
      "source": "donate_page"
    }
  }
}
```

---

## 🔐 AUTHENTICATION TESTING

### Test 6: User Registration

**Frontend:** Visit `http://localhost:3000/register` (or use Auth form)

**Manual test via browser console:**
```javascript
// On any page with AuthProvider
const { register } = useAuth();

const result = await register({
  email: 'test@example.com',
  password: 'SecurePass123!',
  username: 'testuser',
  full_name: 'Test User'
});

console.log(result);
// Expected: { success: true, message: 'Registration successful! Please check your email...' }
```

**Supabase queries (for verification):**
```sql
-- Check auth.users table
SELECT id, email, created_at
FROM auth.users
WHERE email = 'test@example.com';

-- Check profiles table
SELECT * FROM profiles
WHERE email = 'test@example.com';
```

**Expected behavior:**
1. User record created in `auth.users`
2. Profile record created in `profiles` table
3. Confirmation email sent to user (if email configured)
4. User is NOT automatically logged in (must verify email first)

---

### Test 7: User Login

**Frontend:** Visit `http://localhost:3000/login`

**Manual test via browser console:**
```javascript
const { login } = useAuth();

const result = await login('test@example.com', 'SecurePass123!');

console.log(result);
// Expected: { success: true }

// Check if user is set
const { user, profile, isAuthenticated } = useAuth();
console.log({ user, profile, isAuthenticated });
// Expected: user object, profile object, isAuthenticated: true
```

**Supabase query (for verification):**
```sql
SELECT * FROM auth.sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

---

### Test 8: Session Persistence

**Test steps:**
1. Log in to the application
2. Refresh the page (F5)
3. Check if user remains logged in

**Expected behavior:**
- User should remain authenticated after refresh
- `user` and `profile` state should be restored from Supabase session
- No redirect to login page

**Manual verification:**
```javascript
// After page refresh
const { user, loading, isAuthenticated } = useAuth();

console.log({
  loading,           // Should be false after load
  isAuthenticated,   // Should be true
  user: user?.email  // Should show user email
});
```

---

### Test 9: User Logout

**Manual test:**
```javascript
const { logout } = useAuth();

await logout();

// Should redirect to '/' and clear user state
const { user, profile, isAuthenticated } = useAuth();
console.log({ user, profile, isAuthenticated });
// Expected: user: null, profile: null, isAuthenticated: false
```

**Supabase verification:**
```sql
-- Session should be deleted
SELECT * FROM auth.sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
-- Expected: No rows
```

---

### Test 10: Update Profile

**Manual test:**
```javascript
const { updateProfile } = useAuth();

const result = await updateProfile({
  full_name: 'Updated Name',
  phone: '555-1111'
});

console.log(result);
// Expected: { success: true }

// Verify profile was updated
const { profile } = useAuth();
console.log(profile);
// Expected: { full_name: 'Updated Name', phone: '555-1111', ... }
```

**Supabase query:**
```sql
SELECT * FROM profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

---

### Test 11: Change Password

**Manual test:**
```javascript
const { changePassword } = useAuth();

const result = await changePassword('SecurePass123!', 'NewSecurePass456!');

console.log(result);
// Expected: { success: true, message: 'Password changed successfully' }

// Now try logging in with new password
await logout();
const loginResult = await login('test@example.com', 'NewSecurePass456!');
console.log(loginResult);
// Expected: { success: true }
```

---

### Test 12: Password Reset Request

**Manual test:**
```javascript
const { requestPasswordReset } = useAuth();

const result = await requestPasswordReset('test@example.com');

console.log(result);
// Expected: { success: true, message: 'Password reset email sent...' }
```

**Expected behavior:**
1. Email sent to user with reset link
2. Link format: `http://localhost:3000/reset-password?token=...`
3. User must click link to access reset page

---

### Test 13: Password Reset (Complete Flow)

**Step 1:** Request password reset (see Test 12)

**Step 2:** Click link in email (or manually navigate with token)

**Step 3:** On reset page:
```javascript
const { resetPassword } = useAuth();

const result = await resetPassword('BrandNewPass789!');

console.log(result);
// Expected: { success: true, message: 'Password reset successfully...' }
```

**Step 4:** Try logging in with new password:
```javascript
await logout();
const loginResult = await login('test@example.com', 'BrandNewPass789!');
// Expected: { success: true }
```

---

## 🖥️ FRONTEND FORM TESTING

### Test 14: Food Bank Map

**Page:** `/get-help`

**Test steps:**
1. Navigate to `/get-help`
2. Verify map loads with markers
3. Click on a marker
4. Verify popup shows food bank details

**Expected behavior:**
- Map renders without errors
- Markers appear for each food bank
- Popups show: name, address, phone, hours, services

**Troubleshooting:**
If map doesn't load, check browser console for:
- API errors: `GET /api/foodbanks` should return 200
- Leaflet errors: Ensure leaflet CSS is loaded

---

### Test 15: Client Intake Form

**Page:** `/get-help` (Apply for Assistance section)

**Test steps:**
1. Fill out the form with valid data
2. Click "Submit Application"
3. Verify success message appears

**Sample form data:**
- Name: John Doe
- Phone: 555-1234
- Email: john@example.com
- ZIP Code: 07102
- Household Size: 4
- Consent: ✓

**Expected response:**
- Success message: "Your application has been submitted successfully..."
- Form resets
- Record created in `intakes` table

---

### Test 16: Provider Submission Form

**Page:** `/get-help` (List Your Organization section)

**Test steps:**
1. Click "List Your Organization"
2. Fill out provider form
3. Submit

**Sample form data:**
- Organization Name: Test Food Pantry
- County: Essex
- Address: 123 Main St, Newark, NJ 07102
- Phone: 555-5678
- Email: info@test.org
- Consent: ✓

**Expected response:**
- Success message: "Thank you! Your submission has been received..."
- Record created in `providers` table with status: 'pending'

---

### Test 17: Donation Flow

**Page:** `/donate`

**Test steps:**
1. Navigate to `/donate`
2. Select donation amount (or enter custom)
3. Choose one-time or monthly
4. Click "Donate Now"
5. Verify redirect to Stripe Checkout
6. Complete checkout (use Stripe test card: `4242 4242 4242 4242`)
7. Verify success page

**Stripe test card:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Expected behavior:**
1. Checkout session created in Stripe
2. Record created in `donation_sessions` table with status: 'pending'
3. After successful payment, status updates to 'completed'
4. Success page shows donation amount and confirmation

---

## 🔍 COMMON ISSUES & TROUBLESHOOTING

### Issue 1: "Error: Supabase client not initialized"

**Cause:** Missing environment variables

**Fix:**
```bash
# Check .env.local exists and contains:
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Restart dev server
bun run dev
```

---

### Issue 2: "Error: relation 'foodbanks' does not exist"

**Cause:** Supabase tables not created

**Fix:**
```sql
-- Run all SQL scripts from SUPABASE_API_MIGRATION.md in Supabase SQL Editor
-- Tables needed: foodbanks, intakes, providers, donation_sessions, profiles
```

---

### Issue 3: "Error: Invalid login credentials"

**Possible causes:**
1. Email not verified (check Supabase Auth settings)
2. Wrong password
3. User doesn't exist

**Fix:**
```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- Disable email verification (for testing only)
-- In Supabase Dashboard: Authentication > Settings > Email Auth
-- Disable "Confirm email"
```

---

### Issue 4: Registration creates user but not profile

**Cause:** RLS policy blocking insert

**Fix:**
```sql
-- Ensure RLS policy exists
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Or temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

---

### Issue 5: Map doesn't load markers

**Troubleshooting steps:**
1. Check `/api/foodbanks` returns data:
   ```bash
   curl http://localhost:3000/api/foodbanks
   ```
2. Check browser console for errors
3. Verify latitude/longitude values are valid decimals
4. Check Leaflet is loaded: `window.L` should be defined

---

### Issue 6: Stripe checkout fails

**Possible causes:**
1. Missing Stripe secret key
2. Invalid amount (must be integer in cents)
3. Network error

**Fix:**
```bash
# Verify Stripe keys
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Test Stripe connection
curl https://api.stripe.com/v1/charges \
  -u $STRIPE_SECRET_KEY: \
  -d amount=1000 \
  -d currency=usd \
  -d source=tok_visa
```

---

## 📊 DATABASE VERIFICATION QUERIES

### Check all tables exist:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: donation_sessions, foodbanks, intakes, profiles, providers
```

### Count records in each table:
```sql
SELECT 'foodbanks' as table_name, COUNT(*) as count FROM foodbanks
UNION ALL
SELECT 'intakes', COUNT(*) FROM intakes
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
UNION ALL
SELECT 'donation_sessions', COUNT(*) FROM donation_sessions
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
```

### Check recent submissions:
```sql
-- Recent intakes
SELECT applicant_name, applicant_phone, zip, submitted_at
FROM intakes
ORDER BY submitted_at DESC
LIMIT 10;

-- Recent providers
SELECT org_name, county, contact_phone, submitted_at
FROM providers
ORDER BY submitted_at DESC
LIMIT 10;

-- Recent donations
SELECT stripe_session_id, amount, status, created_at
FROM donation_sessions
ORDER BY created_at DESC
LIMIT 10;
```

### Check auth users and profiles:
```sql
-- Users with profiles
SELECT
  u.id,
  u.email,
  u.created_at as user_created,
  p.username,
  p.full_name,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Users without profiles (should be empty after successful registration)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

---

## ✅ FINAL VERIFICATION CHECKLIST

Before deployment, verify:

- [ ] `bun run dev` starts without errors
- [ ] All environment variables are set
- [ ] All 5 Supabase tables exist
- [ ] `/api/foodbanks` returns food bank data
- [ ] `/api/intakes` accepts POST requests
- [ ] `/api/providers` accepts POST requests
- [ ] `/api/donations/checkout` creates Stripe sessions
- [ ] User registration creates auth.users + profiles record
- [ ] User login works and sets session
- [ ] Session persists after page refresh
- [ ] User logout clears session
- [ ] Profile update works
- [ ] Password change works
- [ ] Password reset flow works
- [ ] Food bank map loads with markers
- [ ] Client intake form submits successfully
- [ ] Provider form submits successfully
- [ ] Donation flow redirects to Stripe and completes

---

## 🚀 PRODUCTION DEPLOYMENT

After local verification succeeds:

1. **Deploy to Vercel:**
   ```bash
   git push origin claude/migrate-django-nextjs-YOfpY
   ```

2. **Add environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Configure Stripe webhook endpoint:**
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

4. **Test production endpoints:**
   ```bash
   curl https://your-domain.vercel.app/api/foodbanks
   ```

5. **Run smoke tests** on production (see checklist above)

---

**Status:** ✅ Verification guide complete
**Next:** Run local tests, then deploy to production
