# Architecture

## Tech Stack

Seed & Spoon uses:

- **Next.js 15** - Frontend framework and API routes
- **Supabase** - Authentication and database (PostgreSQL)
- **Stripe** - Payment processing and donations
- **Google Maps API** - Location services and mapping
- **Vercel** - Hosting and deployment
- **Bun** - JavaScript runtime (development)

## Migration History

Django has been fully removed as of January 2026.

The platform now runs entirely on Next.js + Supabase serverless architecture.

## Key Services

### Frontend
- Next.js App Router with React Server Components
- Tailwind CSS for styling
- Framer Motion and GSAP for animations

### Backend
- Next.js API Routes for server-side logic
- Supabase for database queries and authentication
- Stripe webhooks for payment processing

### Infrastructure
- Vercel for edge deployment
- Supabase hosted PostgreSQL database
- CDN for static assets

## Environment Variables

See `.env.example` for required configuration:
- Supabase credentials
- Stripe API keys
- Google Maps API key
- Analytics tracking IDs
