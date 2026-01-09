# Architecture

## Tech Stack

Seed & Spoon uses:

- **Next.js 15** - Frontend framework and API routes
- **Supabase** - Authentication and database (PostgreSQL)
- **Stripe** - Payment processing and donations
- **Leaflet + OpenStreetMap** - Interactive maps
- **Vercel** - Hosting and deployment
- **Bun** - JavaScript runtime (development)

## Key Services

### Frontend
- Next.js App Router with React Server Components
- Tailwind CSS for styling
- Framer Motion and GSAP for animations
- Leaflet with React-Leaflet for maps

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
- Analytics tracking IDs (optional)
