# Backend API Requirements for Seed & Spoon Frontend

This document outlines all the API endpoints that the frontend expects from the backend API.

## Base URL

All endpoints are relative to the base URL configured in `NEXT_PUBLIC_API_BASE_URL`.

Example: `https://seed-and-spoon-backend.vercel.app`

---

## Authentication & CORS

### CORS Configuration

The backend must allow requests from the frontend domain:

```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### No Authentication Required (Public Endpoints)

All endpoints listed below are public and do not require authentication.

---

## API Endpoints

### 1. Directory - Food Banks

**Endpoint:** `GET /api/directory/food-banks`

**Description:** Fetch all food bank locations with coordinates for map display and directory listing.

**Query Parameters:**
- None (returns all food banks)

**Response Format:**

```json
[
  {
    "id": "1",
    "name": "Newark Community Food Pantry",
    "address": "123 Main St",
    "city": "Newark",
    "county": "Essex",
    "zip": "07102",
    "latitude": 40.7357,
    "longitude": -74.1724,
    "phone": "(973) 555-0100",
    "website": "https://example.org",
    "hours": "Mon-Fri 9am-5pm",
    "service_type": "Food Pantry",
    "notes": "Photo ID required"
  }
]
```

**Required Fields:**
- `id` (string|number)
- `name` (string)
- `latitude` (number)
- `longitude` (number)
- `county` (string)

**Optional Fields:**
- `address`, `city`, `zip`, `phone`, `website`, `hours`, `service_type`, `notes`

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 2. Directory - Services

**Endpoint:** `GET /api/directory/services`

**Description:** Fetch available services/resources from food banks.

**Query Parameters:**
- `foodBankId` (optional) - Filter services by food bank ID

**Example:**
```
GET /api/directory/services?foodBankId=123
```

**Response Format:**

```json
[
  {
    "id": "1",
    "foodBankId": "123",
    "name": "Food Pantry",
    "description": "Weekly food distribution",
    "schedule": "Every Tuesday 10am-2pm",
    "eligibility": "Must live in Essex County"
  }
]
```

**Required Fields:**
- `id` (string|number)
- `name` (string)

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### 3. Donations - Create

**Endpoint:** `POST /api/donations/create`

**Description:** Create a Stripe checkout session for donations.

**Request Body:**

```json
{
  "amount": 50.00,
  "interval": "one-time",
  "successUrl": "https://frontend.com/thank-you?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://frontend.com/donate"
}
```

**Request Fields:**
- `amount` (number, required) - Donation amount in dollars (e.g., 50.00)
- `interval` (string, required) - Either "one-time" or "monthly"
- `successUrl` (string, required) - URL to redirect after successful payment
- `cancelUrl` (string, required) - URL to redirect if payment is cancelled

**Response Format:**

```json
{
  "clientSecret": "cs_test_...",
  "sessionId": "cs_test_...",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Response Fields:**
- `clientSecret` (string, required) - Stripe client secret for payment
- `sessionId` (string, optional) - Stripe session ID
- `checkoutUrl` (string, required) - URL to redirect user to Stripe Checkout

**Status Codes:**
- `200` - Success
- `400` - Invalid request (amount too low, invalid interval, etc.)
- `500` - Server error

**Validation:**
- Minimum amount: $1.00
- Valid intervals: "one-time", "monthly"

---

### 4. Forms - Client Intake

**Endpoint:** `POST /api/forms/intake-client`

**Description:** Submit a client application for food assistance.

**Request Body:**

```json
{
  "applicant": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St",
    "city": "Newark",
    "county": "Essex",
    "zip": "07102"
  },
  "household": {
    "size": 4,
    "children": 2,
    "seniors": 0
  },
  "dietary": {
    "allergies": ["peanuts", "dairy"],
    "restrictions": ["vegetarian"],
    "notes": "Gluten-free preferred"
  },
  "needs": {
    "frequency": "weekly",
    "preferredDays": ["Tuesday", "Thursday"],
    "transportation": "public_transit"
  },
  "consent": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Application received successfully",
  "applicationId": "APP-12345"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `500` - Server error

**Backend Actions:**
1. Validate and sanitize input
2. Save application to database
3. Send confirmation email to applicant
4. Send notification to staff
5. Return success response

---

### 5. Forms - Referral Intake

**Endpoint:** `POST /api/forms/intake-referral`

**Description:** Submit a referral for a client from a partner organization.

**Request Body:**

```json
{
  "referrer": {
    "name": "Jane Smith",
    "organization": "Community Center",
    "email": "jane@communitycenter.org",
    "phone": "(555) 987-6543"
  },
  "applicant": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St",
    "city": "Newark",
    "county": "Essex",
    "zip": "07102"
  },
  "household": {
    "size": 4,
    "children": 2,
    "seniors": 0
  },
  "dietary": {
    "allergies": ["peanuts"],
    "restrictions": [],
    "notes": ""
  },
  "clientConsent": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Referral received successfully",
  "referralId": "REF-12345"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `500` - Server error

---

### 6. Forms - Provider Submission

**Endpoint:** `POST /api/forms/provider-submission`

**Description:** Submit a request to be listed as a food provider in the directory.

**Request Body:**

```json
{
  "organization": {
    "name": "New Community Food Pantry",
    "type": "food_pantry",
    "address": "456 Oak St",
    "city": "Jersey City",
    "county": "Hudson",
    "zip": "07302",
    "phone": "(201) 555-0100",
    "email": "info@newfoodpantry.org",
    "website": "https://newfoodpantry.org"
  },
  "services": {
    "types": ["food_pantry", "hot_meals"],
    "schedule": "Mon, Wed, Fri 10am-2pm",
    "eligibility": "Open to all Hudson County residents",
    "languages": ["English", "Spanish"]
  },
  "contact": {
    "name": "Sarah Johnson",
    "title": "Director",
    "email": "sarah@newfoodpantry.org",
    "phone": "(201) 555-0101"
  },
  "consent": true
}
```

**Response Format:**

```json
{
  "success": true,
  "message": "Provider submission received successfully",
  "submissionId": "PROV-12345"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `500` - Server error

---

### 7. Health Check (Optional)

**Endpoint:** `GET /api/health`

**Description:** Health check endpoint for monitoring.

**Response Format:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200` - Healthy
- `503` - Unhealthy

---

## Error Response Format

All error responses should follow this format:

```json
{
  "error": "Error message here",
  "message": "User-friendly error message",
  "statusCode": 400
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Security Requirements

### 1. Input Validation

- Sanitize all user input to prevent XSS attacks
- Validate email addresses, phone numbers, and zip codes
- Reject requests with invalid data types

### 2. Rate Limiting

- Implement rate limiting on form submission endpoints
- Suggested: 5 requests per minute per IP address
- Return `429 Too Many Requests` when limit exceeded

### 3. CORS

- Configure CORS to only allow requests from authorized domains
- Do not use wildcard (`*`) in production

### 4. Stripe Integration

**Environment Variables:**
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_test_... or pk_live_...)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (whsec_...)

**Stripe Checkout Session Creation:**

```javascript
// Example using Stripe Node.js SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const session = await stripe.checkout.sessions.create({
  mode: interval === 'one-time' ? 'payment' : 'subscription',
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Donation to Seed & Spoon NJ',
        },
        unit_amount: Math.round(amount * 100), // Convert dollars to cents
        ...(interval === 'monthly' && {
          recurring: {
            interval: 'month',
          },
        }),
      },
      quantity: 1,
    },
  ],
  success_url: successUrl,
  cancel_url: cancelUrl,
});

return {
  clientSecret: session.client_secret,
  sessionId: session.id,
  checkoutUrl: session.url,
};
```

---

## Database Models (Reference)

### Food Bank

```
{
  id: string/number
  name: string (required)
  address: string
  city: string
  county: string (required)
  zip: string
  latitude: number (required)
  longitude: number (required)
  phone: string
  email: string
  website: string
  hours: string
  service_type: string
  notes: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Client Application

```
{
  id: string/number
  applicant: object
  household: object
  dietary: object
  needs: object
  consent: boolean
  status: string (pending|approved|rejected)
  created_at: timestamp
  updated_at: timestamp
}
```

### Donation

```
{
  id: string/number
  amount: number
  interval: string
  stripe_session_id: string
  stripe_payment_intent_id: string
  status: string (pending|completed|failed|refunded)
  donor_email: string
  created_at: timestamp
  updated_at: timestamp
}
```

---

## Email Notifications

### Client Application Received

**To:** Applicant email
**Subject:** "Application Received - Seed & Spoon NJ"

**Content:**
```
Dear [Name],

Thank you for applying for food assistance with Seed & Spoon NJ.

We have received your application and will contact you within 48 hours at [phone].

If you need immediate assistance, please call 2-1-1.

Best regards,
Seed & Spoon NJ Team
```

### Donation Confirmation

**To:** Donor email (from Stripe)
**Subject:** "Thank You for Your Donation - Seed & Spoon NJ"

**Content:**
```
Dear Donor,

Thank you for your generous donation of $[amount] to Seed & Spoon NJ.

Your donation will help us provide fresh, nutritious meals to families in need across New Jersey.

Donation Details:
- Amount: $[amount]
- Type: [One-time / Monthly]
- Date: [date]
- Receipt ID: [id]

As a 501(c)(3) nonprofit organization, your donation is tax-deductible.
Tax ID: [EIN]

Best regards,
Seed & Spoon NJ Team
```

---

## Testing

### Test Data

Use these test values during development:

**Stripe Test Card:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Test Food Bank:**
```json
{
  "id": "test-1",
  "name": "Test Food Pantry",
  "address": "123 Test St",
  "city": "Newark",
  "county": "Essex",
  "zip": "07102",
  "latitude": 40.7357,
  "longitude": -74.1724,
  "phone": "(555) 123-4567",
  "website": "https://test.example.com",
  "hours": "Mon-Fri 9am-5pm",
  "service_type": "Food Pantry"
}
```

---

## Deployment Checklist

### Environment Variables

- [ ] `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (backend)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (backend)
- [ ] CORS origins configured correctly

### API Endpoints

- [ ] `/api/directory/food-banks` returns food bank data
- [ ] `/api/directory/services` returns services data
- [ ] `/api/donations/create` creates Stripe sessions
- [ ] `/api/forms/intake-client` accepts client applications
- [ ] `/api/forms/intake-referral` accepts referrals
- [ ] `/api/forms/provider-submission` accepts provider submissions
- [ ] `/api/health` (optional) returns health status

### Security

- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled on form endpoints
- [ ] Input validation and sanitization implemented
- [ ] Stripe webhook signature verification enabled
- [ ] Environment variables secured (not committed to git)

### Email Notifications

- [ ] Email service configured (SendGrid, AWS SES, etc.)
- [ ] Confirmation emails for client applications
- [ ] Confirmation emails for donations
- [ ] Notification emails to staff

---

## Support

For questions or issues with the API integration, please contact:
- **Technical Issues:** Create an issue on GitHub
- **Deployment Help:** Check the deployment documentation

---

## Version History

- **v1.0.0** (2024-01-15) - Initial API specification
