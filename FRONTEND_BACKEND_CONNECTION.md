# Frontend-Backend Connection Guide

This document describes how the Next.js frontend connects to the Bun backend API.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │  AuthContext    │────│   API Client    │────│   Forms     │  │
│  │  (Supabase)     │    │ (apiClient.ts)  │    │ Components  │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                         Access Token (Bearer)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Bun API)                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │  Auth Middleware│────│   API Routes    │────│   Supabase  │  │
│  │  (JWT Verify)   │    │  (/api/*)       │    │   Database  │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Local Development Setup

### 1. Environment Variables

Create a `.env.local` file (or copy from `.env.example`):

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Start the Backend

The backend must be running before the frontend can make API calls:

```bash
# In the backend repository
cd backend
bun install
bun run dev  # Starts on http://localhost:4000
```

### 3. Start the Frontend

```bash
# In this repository
bun install
bun run dev  # Starts on http://localhost:3000
```

### 4. Verify Connection

Open the browser console and check for:
- No CORS errors
- Successful API calls in Network tab
- Auth state changes in console logs

## API Client Usage

### Making API Calls

The `apiClient.ts` provides a typed API client:

```typescript
import { api, endpoints } from '@/lib/apiClient';

// GET request (authenticated)
const donations = await api.get(endpoints.donations.history);

// POST request (authenticated)
const result = await api.post(endpoints.volunteers.submit, formData);

// POST without auth (public endpoints)
const checkout = await api.post(
  endpoints.donations.checkout,
  payload,
  { skipAuth: true }
);
```

### Available Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/login` | POST | No | Email/password login |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/auth/oauth/callback` | POST | No | OAuth callback |
| `/api/donations/checkout` | POST | No | Create Stripe checkout |
| `/api/donations` | GET | Yes | Get donation history |
| `/api/intakes` | POST | No | Submit client intake |
| `/api/providers` | POST | No | Submit provider info |
| `/api/volunteers` | POST | No | Submit volunteer app |

## Token Management

### How Tokens Work

1. **Supabase OAuth**: User authenticates via Google/Facebook
2. **Session Created**: Supabase creates a JWT access token
3. **Token Attached**: API client attaches token to all requests
4. **Backend Verifies**: Backend validates JWT with Supabase

### Token Flow

```
User Login (OAuth)
        │
        ▼
Supabase Auth Provider
        │
        ▼
JWT Access Token Issued
        │
        ▼
Stored in AuthContext.session
        │
        ▼
Attached via Authorization: Bearer <token>
        │
        ▼
Backend validates with Supabase
        │
        ▼
User identity confirmed
```

### Accessing the Token

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { accessToken, getAccessToken } = useAuth();

  // Direct access (may be null during SSR)
  console.log(accessToken);

  // Safe getter (works everywhere)
  const token = getAccessToken();
}
```

## Token Debugging

### Check Token in Console

```javascript
// In browser console
const { data } = await window.supabase.auth.getSession();
console.log('Token:', data.session?.access_token);
console.log('User:', data.session?.user);
```

### Decode JWT Token

```javascript
// Decode without verification (for debugging)
const token = data.session?.access_token;
const [header, payload, signature] = token.split('.');
console.log('Payload:', JSON.parse(atob(payload)));
```

### Test API Manually

```bash
# Get your token from browser console, then:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/auth/me
```

## Common Errors

### 401 Unauthorized

**Cause**: Missing or expired token

**Solutions**:
1. Check if user is logged in
2. Verify token is being sent in headers
3. Check if token has expired (default: 1 hour)
4. Try refreshing the session

```typescript
const { refreshSession } = useAuth();
await refreshSession();
```

### 403 Forbidden

**Cause**: User lacks required permissions

**Solutions**:
1. Check user's role in profile
2. Verify endpoint requires the user's role
3. Contact admin to update permissions

### Network Error / CORS

**Cause**: Backend not running or CORS misconfigured

**Solutions**:
1. Verify backend is running: `curl http://localhost:4000/health`
2. Check CORS settings in backend
3. Ensure `NEXT_PUBLIC_BACKEND_URL` is correct

### "Supabase credentials not found"

**Cause**: Missing environment variables

**Solutions**:
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase credentials from dashboard
3. Restart the dev server

## Role-Based Access

### Available Roles

| Role | Description | Access |
|------|-------------|--------|
| `donor` | Financial contributor | Donation history, receipts |
| `volunteer` | Active volunteer | Calendar, hours, tasks |
| `client` | Food assistance recipient | Intake status, resources |
| `admin` | Staff administrator | Full dashboard access |

### Checking Roles

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/components/RoleGuard';

function MyComponent() {
  const { hasRole, isAdmin, isDonor } = useAuth();
  const { canAccessDonorFeatures } = useRoleAccess();

  if (isAdmin()) {
    // Admin-only logic
  }

  if (hasRole('volunteer')) {
    // Volunteer logic
  }
}
```

### Role Guard Components

```jsx
import { AdminOnly, DonorOnly, VolunteerOnly } from '@/components/RoleGuard';

function Dashboard() {
  return (
    <div>
      <AdminOnly>
        <AdminPanel />
      </AdminOnly>

      <DonorOnly fallback={<DonorCTA />}>
        <DonationHistory />
      </DonorOnly>
    </div>
  );
}
```

## Testing Checklist

### Before Deploying

- [ ] Backend is running and healthy
- [ ] Environment variables are set
- [ ] Login with email/password works
- [ ] OAuth login (Google/Facebook) works
- [ ] Token is attached to authenticated requests
- [ ] Public endpoints work without token
- [ ] 401 errors trigger re-authentication
- [ ] Role-based UI shows correct content

### Test Commands

```bash
# Health check
curl http://localhost:4000/health

# Test donation checkout (public)
curl -X POST http://localhost:4000/api/donations/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "usd", "interval": "one_time"}'

# Test authenticated endpoint
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Issue: Forms not submitting

1. Check browser Network tab for errors
2. Verify `NEXT_PUBLIC_BACKEND_URL` is set
3. Check if backend is running
4. Look for validation errors in response

### Issue: User not staying logged in

1. Check if cookies are being set
2. Verify Supabase session persistence
3. Check for errors in `onAuthStateChange`
4. Clear localStorage and try again

### Issue: Role-based UI not showing

1. Verify profile has `role` field
2. Check role value matches expected strings
3. Ensure AuthContext has loaded (not `loading`)
4. Check for errors in profile fetch

## Support

For issues with this integration:
1. Check the common errors section above
2. Review browser console for detailed errors
3. Test endpoints with curl to isolate frontend/backend issues
4. File an issue with reproduction steps
