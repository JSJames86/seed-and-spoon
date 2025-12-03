# Bun Migration Playbook: Next.js → Bun Runtime
**Project:** Seed & Spoon (Next.js 14 + Django/Postgres)
**Migration Date:** 2025-12-03

---

## A. Prep + Safety

### 1. Pre-flight Backup Commands

```bash
# Create a git branch for this migration
git checkout -b migration/npm-to-bun
git add -A
git commit -m "Pre-migration snapshot: npm baseline"

# Backup package files
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# Document current npm version
npm --version > .npm-version-backup
node --version > .node-version-backup

# Test that current setup works
npm run build
npm run lint
```

### 2. Install Bun (macOS/Linux)

```bash
# Install Bun (latest stable)
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version

# Pin to specific version (recommended for production)
# Example: Install Bun 1.0.21 (current stable as of Dec 2024)
curl -fsSL https://bun.sh/install | bash -s "bun-v1.0.21"

# Add to PATH (if not auto-added)
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Version Pinning Strategy:**
- Create `.bunversion` file with pinned version:
```bash
echo "1.0.21" > .bunversion
```

- Or use asdf/mise for version management:
```bash
# Using asdf
asdf plugin add bun
asdf install bun 1.0.21
asdf local bun 1.0.21
```

---

## B. Migration Commands + Notes

### 1. Remove npm artifacts

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Optional: Remove npm cache (if you want a clean slate)
npm cache clean --force
```

### 2. Install dependencies with Bun

```bash
# Install all dependencies
bun install

# This creates bun.lockb (binary lockfile)
# Verify installation
ls -lh bun.lockb
```

### 3. Detect Incompatible Dependencies

```bash
# Run a test build to catch issues early
bun run build

# Check for native module warnings
bun pm ls | grep -i "native\|binding"

# Specific checks for your dependencies
echo "Checking critical dependencies..."

# Sharp (native module for image optimization)
bun run node -e "const sharp = require('sharp'); console.log('sharp:', sharp.versions)"

# Leaflet (should work fine)
bun run node -e "const L = require('leaflet'); console.log('leaflet OK')"
```

### 4. Known Compatibility Issues & Fixes

#### **Native Modules (sharp)**
Sharp is a native module that Next.js uses for image optimization. Bun has good support but may need attention:

```bash
# If sharp fails, reinstall it explicitly
bun add sharp --force

# For macOS ARM (M1/M2), you may need:
bun add sharp --platform=darwin --arch=arm64

# Verify sharp works
bun run node -e "require('sharp')().metadata().then(console.log)"
```

#### **React-Leaflet**
React-Leaflet should work fine, but if you see SSR hydration issues:

```javascript
// components/Map.jsx - Use dynamic import with ssr: false
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);
```

#### **UUID/nanoid**
Both should work perfectly with Bun (they're pure JS).

#### **Stripe SDK**
Works fine with Bun, but test API calls:

```bash
# Quick test
bun run node -e "const Stripe = require('stripe'); console.log('Stripe SDK loaded')"
```

### 5. If Specific Packages MUST Use npm

For rare cases where a package absolutely won't work with Bun:

```bash
# Install problematic package with npm
npm install problematic-package --save

# But use Bun for everything else
bun install
```

Then create a hybrid approach:
```json
{
  "scripts": {
    "postinstall": "npm rebuild problematic-package"
  }
}
```

**Note:** This is rarely needed. Try Bun first.

---

## C. Next.js Specifics

### 1. next.config.js Updates

Your current config is minimal. For Bun, update it:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },

  // Bun-specific optimizations
  experimental: {
    // Use Bun's faster bundler for server components (Next.js 14+)
    serverComponentsExternalPackages: [],

    // Optimize for Bun runtime
    optimizePackageImports: ['leaflet', 'react-leaflet', 'framer-motion'],
  },

  // Ensure webpack is configured for Bun compatibility
  webpack: (config, { isServer }) => {
    // No special changes needed for Bun
    return config;
  },
};

module.exports = nextConfig;
```

**Important:** Next.js 14 works great with Bun out of the box. No experimental flags required for basic usage.

### 2. Updated package.json Scripts

Replace your scripts section:

```json
{
  "name": "seed-and-spoon-nj",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "bun --bun next dev",
    "build": "bun --bun next build",
    "start": "bun --bun next start",
    "lint": "bun --bun next lint",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "import:resources": "bun run scripts/import-resources.js",
    "type-check": "bun run next info"
  },
  "dependencies": {
    "date-fns": "^4.1.0",
    "framer-motion": "^11.0.0",
    "gsap": "^3.13.0",
    "leaflet": "^1.9.4",
    "nanoid": "^5.1.6",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "stripe": "^19.3.0",
    "uuid": "^13.0.0",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "dotenv": "^17.2.3",
    "postcss": "^8.4.32",
    "sharp": "^0.34.5",
    "tailwindcss": "^3.3.6"
  }
}
```

**Script Breakdown:**
- `bun --bun`: Forces Bun's runtime (bypasses Node.js compatibility layer)
- `bun run`: Uses Bun to execute the script
- `bun test`: Bun's built-in test runner (Jest-compatible)

### 3. Running Development Server

```bash
# Start Next.js dev server with Bun
bun dev

# Or with explicit Bun runtime
bun --bun next dev

# With custom port
bun dev -- -p 3001

# With turbopack (Next.js 14)
bun dev --turbo
```

**Performance Tip:** Use `--bun` flag for maximum performance (5-10x faster HMR).

### 4. Edge Functions & Server Components

**Server Components (app directory):**
- Work perfectly with Bun
- No changes needed to existing components
- Bun's faster startup benefits SSR performance

**API Routes:**
```javascript
// app/api/example/route.js
export async function GET(request) {
  // Works identically with Bun
  return Response.json({ message: 'API route with Bun' });
}
```

**Edge Runtime (if used):**
```javascript
// app/api/edge/route.js
export const runtime = 'edge'; // Still works with Bun

export async function GET() {
  return new Response('Edge function');
}
```

### 5. Middleware

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Works identically with Bun
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## D. CI / CD / Deploy

### 1. GitHub Actions (Bun)

Create `.github/workflows/nextjs-bun.yml`:

```yaml
name: Next.js CI with Bun

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.0.21 # Pin version

      - name: Cache Bun dependencies
        uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run linter
        run: bun run lint

      - name: Run type check
        run: bun run type-check

      - name: Run tests
        run: bun test

      - name: Build Next.js app
        run: bun run build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: nextjs-build
          path: .next/
          retention-days: 7

  # Optional: Deploy job
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to production
        run: echo "Add your deployment commands here"
```

**Speed Comparison:**
- npm install: ~45-60s
- Bun install: ~8-15s (3-4x faster)

### 2. Vercel Deployment

**Option A: Vercel with Bun (Native - Experimental)**

Vercel has experimental Bun support. Create `vercel.json`:

```json
{
  "buildCommand": "bun run build",
  "devCommand": "bun dev",
  "installCommand": "bun install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add: `BUN_VERSION` = `1.0.21`

**Option B: Vercel with Node.js (Stable)**

If Bun support is flaky on Vercel, use Node.js for runtime but Bun for builds:

```json
{
  "buildCommand": "bun install && bun run build",
  "framework": "nextjs"
}
```

**Option C: Custom Dockerfile (Full Control)**

See Dockerfile example below.

### 3. Dockerfile (Bun Runtime)

Create `Dockerfile.bun`:

```dockerfile
# Use Bun official image
FROM oven/bun:1.0.21-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start Next.js with Bun
CMD ["bun", "server.js"]
```

**Build & Run:**

```bash
# Build image
docker build -f Dockerfile.bun -t seed-and-spoon:bun .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  seed-and-spoon:bun

# Or with docker-compose
```

**Docker Compose (Full Stack):**

Create `docker-compose.bun.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: seedspoon
      POSTGRES_PASSWORD: development
      POSTGRES_DB: seedspoon_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  django:
    build:
      context: .
      dockerfile: Dockerfile.django
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://seedspoon:development@postgres:5432/seedspoon_db

  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.bun
    ports:
      - "3000:3000"
    depends_on:
      - django
    environment:
      NEXT_PUBLIC_API_URL: http://django:8000

volumes:
  postgres_data:
```

**Run Full Stack:**
```bash
docker-compose -f docker-compose.bun.yml up
```

### 4. Railway / Render / Fly.io Deployment

**Railway:**
```toml
# railway.toml
[build]
builder = "nixpacks"

[build.nixpacksCommand]
install = "bun install"
build = "bun run build"
start = "bun start"
```

**Render (render.yaml):**
```yaml
services:
  - type: web
    name: seed-and-spoon-nextjs
    env: docker
    dockerfilePath: ./Dockerfile.bun
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: seed-spoon-db
          property: connectionString
```

---

## E. Post-Migration Tests

### 1. Smoke Test Checklist

Create `scripts/smoke-test.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running Bun Migration Smoke Tests..."

# 1. Check Bun is available
echo "✓ Checking Bun installation..."
bun --version || exit 1

# 2. Install dependencies
echo "✓ Installing dependencies..."
bun install

# 3. Lint check
echo "✓ Running linter..."
bun run lint

# 4. Build the app
echo "✓ Building Next.js app..."
bun run build

# 5. Start production server in background
echo "✓ Starting production server..."
bun start &
SERVER_PID=$!
sleep 5

# 6. Test homepage loads
echo "✓ Testing homepage (/)..."
curl -f http://localhost:3000 > /dev/null || {
  echo "❌ Homepage failed to load"
  kill $SERVER_PID
  exit 1
}

# 7. Test API route (if you have one)
echo "✓ Testing API routes..."
# Adjust to your actual API routes
# curl -f http://localhost:3000/api/health > /dev/null

# 8. Test SSR route
echo "✓ Testing SSR routes..."
curl -f http://localhost:3000/about > /dev/null || echo "⚠️  About page not found (ok if doesn't exist)"

# 9. Cleanup
echo "✓ Cleaning up..."
kill $SERVER_PID

echo "✅ All smoke tests passed!"
```

Make it executable:
```bash
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh
```

### 2. Manual Test Cases

**Test Matrix:**

| Test Case | Command | Expected Result |
|-----------|---------|-----------------|
| Dev server starts | `bun dev` | Server runs on port 3000 |
| Hot reload works | Edit a file while dev server runs | Browser updates without refresh |
| Production build | `bun run build` | No errors, `.next` folder created |
| Production server | `bun start` | Server runs, pages load |
| Static export (if used) | `bun run build && next export` | `out/` folder created |
| API routes | `curl http://localhost:3000/api/...` | Returns expected JSON |
| Image optimization | Load page with `<Image>` component | Images load and are optimized |
| Client-side routing | Click internal links | Navigation works without page reload |
| SSR data fetching | View page source of dynamic route | HTML contains rendered data |
| Stripe integration | Test checkout flow | Payment flow works |
| Leaflet map loads | Visit page with map component | Map renders correctly |

### 3. Automated Tests (Bun Test Runner)

Create `__tests__/bun-migration.test.js`:

```javascript
import { expect, test, describe } from 'bun:test';

describe('Bun Migration Tests', () => {
  test('Bun runtime is available', () => {
    expect(typeof Bun).toBe('object');
    expect(Bun.version).toBeDefined();
  });

  test('Dependencies load correctly', async () => {
    // Test critical imports
    const dateFns = await import('date-fns');
    const nanoid = await import('nanoid');
    const stripe = await import('stripe');

    expect(dateFns).toBeDefined();
    expect(nanoid.nanoid).toBeTypeOf('function');
    expect(stripe.default).toBeTypeOf('function');
  });

  test('Environment variables load', () => {
    // Test that .env files are loaded
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
```

Run tests:
```bash
bun test
bun test --watch  # Watch mode
bun test --coverage  # With coverage
```

### 4. Performance Benchmarks

Create `scripts/benchmark.sh`:

```bash
#!/bin/bash

echo "📊 Benchmarking Bun vs npm..."

# Cleanup
rm -rf node_modules bun.lockb package-lock.json

# Benchmark Bun install
echo "⏱️  Bun install..."
time bun install > /dev/null 2>&1
BUN_TIME=$SECONDS

# Cleanup
rm -rf node_modules bun.lockb

# Benchmark npm install
echo "⏱️  npm install..."
SECONDS=0
time npm install > /dev/null 2>&1
NPM_TIME=$SECONDS

echo "Results:"
echo "  Bun: ${BUN_TIME}s"
echo "  npm: ${NPM_TIME}s"
echo "  Speedup: $((NPM_TIME / BUN_TIME))x"

# Restore Bun
bun install
```

### 5. CI Test Command

Add to GitHub Actions:

```yaml
- name: Run smoke tests
  run: |
    ./scripts/smoke-test.sh

- name: Run unit tests
  run: bun test

- name: Test production build
  run: |
    bun run build
    timeout 30s bun start &
    sleep 10
    curl -f http://localhost:3000
```

---

## F. Rollback & Common Pitfalls

### 1. Rollback to npm (if needed)

```bash
# Stop using Bun immediately
git checkout package.json package.json.backup
git checkout package-lock.json package-lock.json.backup

# Remove Bun artifacts
rm -rf node_modules bun.lockb

# Reinstall with npm
npm install

# Restore npm scripts (if you changed them)
# Edit package.json and remove `bun --bun` prefixes

# Test that rollback worked
npm run build
npm run dev
```

**Quick Rollback Alias:**
```bash
# Add to .bashrc or run directly
alias rollback-bun='rm -rf node_modules bun.lockb && cp package.json.backup package.json && cp package-lock.json.backup package-lock.json && npm install'
```

### 2. Common Pitfalls

#### **Pitfall 1: Native Addons (N-API)**

**Problem:**
Some packages use N-API (Node-API) for native C++ bindings. Bun supports N-API but may have edge cases.

**Your Risk:**
- `sharp` (image processing) - MEDIUM risk
- Most other dependencies are pure JS - LOW risk

**Solution:**
```bash
# Force reinstall native modules
bun add sharp --force

# If still broken, use npm for that one package
npm install sharp --save
bun install  # Install rest with Bun
```

#### **Pitfall 2: Binary Lockfile (bun.lockb)**

**Problem:**
Bun uses a binary lockfile that's not human-readable. Git diff won't show changes.

**Solution:**
```bash
# Generate a human-readable version for review
bun install --lockfile=yarn  # Creates bun.lock (text format)

# Or use --yarn flag
bun install --yarn
```

**Git LFS (optional):**
```bash
# If bun.lockb gets very large
git lfs track "*.lockb"
git add .gitattributes
```

#### **Pitfall 3: package.json Scripts**

**Problem:**
Scripts that assume `npm` or `node` may break.

**Example:**
```json
{
  "scripts": {
    "custom": "node scripts/something.js"  // Works fine
    "bad": "npm run other"  // Won't work with Bun
  }
}
```

**Solution:**
```json
{
  "scripts": {
    "custom": "bun run scripts/something.js",
    "good": "bun run other"  // Call scripts with `bun run`
  }
}
```

#### **Pitfall 4: Monorepo Workspaces**

**Problem:**
If you later migrate to a monorepo (e.g., `packages/frontend`, `packages/backend`), Bun's workspace support differs slightly from npm/yarn.

**Your Risk:**
Not applicable yet (single package), but worth noting.

**Solution (future):**
```json
// package.json root
{
  "workspaces": ["packages/*"],
  "scripts": {
    "install:all": "bun install --workspaces"
  }
}
```

#### **Pitfall 5: Environment Variables**

**Problem:**
Bun loads `.env` files automatically. This might cause conflicts if you use `dotenv` package explicitly.

**Your Project:**
You have `dotenv` in devDependencies. This is fine, but redundant with Bun.

**Solution:**
```javascript
// Old way (with npm + dotenv package)
require('dotenv').config();

// Bun way (automatic, remove dotenv package)
// Just use process.env.VARIABLE directly

// Or keep dotenv for compatibility
import 'dotenv/config';  // Still works
```

**Recommendation:** Remove `dotenv` from dependencies after testing:
```bash
bun remove dotenv
```

#### **Pitfall 6: Postinstall Scripts**

**Problem:**
Some packages run `postinstall` scripts that assume Node.js.

**Solution:**
```bash
# If postinstall fails, check which package
bun pm ls | grep -A5 "scripts"

# Skip postinstall scripts if needed
bun install --no-scripts

# Then manually run specific postinstall
bun run scripts/postinstall.js
```

#### **Pitfall 7: TypeScript Configuration**

**Your Project:**
You use `jsconfig.json` (JavaScript with JSDoc). No issues expected.

**If you were using TypeScript:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["bun-types"]  // Add Bun types
  }
}
```

```bash
# Install Bun types
bun add -d @types/bun
```

### 3. Known Edge Cases

#### **Edge Case 1: Canvas / Headless Browser**

If you later add packages like `canvas`, `puppeteer`, or `playwright`:

**Problem:**
These rely on system libraries and may need special handling.

**Solution:**
```bash
# Install system dependencies first (Ubuntu/Debian)
sudo apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Then install with Bun
bun add canvas
```

#### **Edge Case 2: SQLite Native Bindings**

If you use `better-sqlite3` or similar:

**Solution:**
```bash
# Bun has built-in SQLite support
import { Database } from 'bun:sqlite';

const db = new Database('mydb.sqlite');
// Use Bun's native SQLite instead of better-sqlite3
```

#### **Edge Case 3: Serverless / Lambda**

If deploying to AWS Lambda:

**Problem:**
AWS Lambda doesn't natively support Bun runtime yet.

**Solution:**
Use custom runtime (Docker or layer):
```dockerfile
# Use Bun in Lambda with custom runtime
FROM public.ecr.aws/lambda/provided:al2

COPY --from=oven/bun:1.0.21 /usr/local/bin/bun /usr/local/bin/bun
COPY . /var/task

CMD ["bun", "run", "index.js"]
```

### 4. Debugging Commands

```bash
# Check Bun version and config
bun --version
bun --print

# List installed packages
bun pm ls

# Check for outdated packages
bun pm outdated

# Verify lockfile integrity
bun install --check

# Clear Bun cache
bun pm cache rm

# Verbose install (debug issues)
bun install --verbose

# Force fresh install
rm -rf node_modules bun.lockb
bun install
```

### 5. When to Stick with npm

**Consider staying with npm if:**

1. ❌ You have many native addons that don't work with Bun
2. ❌ Your deployment platform doesn't support Bun (and you can't use Docker)
3. ❌ Your team is unfamiliar with Bun and resistance is high
4. ❌ You need 100% npm compatibility for a monorepo with complex workspace setups

**Proceed with Bun if:**

1. ✅ You want 3-4x faster installs and dev server startup
2. ✅ Your dependencies are mostly pure JavaScript (like yours)
3. ✅ You can use Docker for deployment
4. ✅ You're willing to troubleshoot occasional edge cases

**Your Project Assessment:**
✅ **GOOD CANDIDATE FOR BUN**
- All dependencies are Bun-compatible
- No complex native addons (sharp is well-supported)
- Next.js 14 works great with Bun
- Faster CI/CD and local development

---

## G. Migration Execution Steps (Recommended Order)

### **Phase 1: Local Migration (Day 1)**

1. ✅ Backup files (Section A.1)
2. ✅ Install Bun (Section A.2)
3. ✅ Remove npm artifacts (Section B.1)
4. ✅ Install with Bun (Section B.2)
5. ✅ Update package.json scripts (Section C.2)
6. ✅ Test dev server: `bun dev`
7. ✅ Test production build: `bun run build`
8. ✅ Run smoke tests (Section E.1)

### **Phase 2: Code Changes (Day 1-2)**

9. ✅ Update next.config.js (Section C.1)
10. ✅ Remove dotenv if redundant (Section F.2.5)
11. ✅ Test critical flows (Stripe, maps, etc.)
12. ✅ Commit changes: `git commit -am "Migrate to Bun runtime"`

### **Phase 3: CI/CD (Day 2-3)**

13. ✅ Create GitHub Actions workflow (Section D.1)
14. ✅ Test CI build passes
15. ✅ Create Dockerfile (Section D.3)
16. ✅ Test Docker build locally

### **Phase 4: Deployment (Day 3-5)**

17. ✅ Deploy to staging with Bun
18. ✅ Run full QA suite
19. ✅ Monitor performance (install speed, build time, runtime)
20. ✅ Deploy to production
21. ✅ Monitor for 48 hours
22. ✅ Document any issues in team wiki

### **Phase 5: Cleanup (Day 5+)**

23. ✅ Remove .backup files if all is well
24. ✅ Update README with Bun instructions
25. ✅ Train team on Bun commands
26. ✅ Delete npm-specific files: `package-lock.json.backup`

---

## H. Quick Reference

### **Bun vs npm Command Equivalents**

| Task | npm | Bun |
|------|-----|-----|
| Install all | `npm install` | `bun install` |
| Add package | `npm install pkg` | `bun add pkg` |
| Remove package | `npm uninstall pkg` | `bun remove pkg` |
| Run script | `npm run script` | `bun run script` |
| Run file | `node file.js` | `bun run file.js` |
| Execute binary | `npx binary` | `bunx binary` |
| Update packages | `npm update` | `bun update` |
| List packages | `npm ls` | `bun pm ls` |
| Clean cache | `npm cache clean` | `bun pm cache rm` |

### **Performance Gains (Expected)**

| Metric | npm | Bun | Improvement |
|--------|-----|-----|-------------|
| Install time | 45-60s | 8-15s | 3-4x faster |
| Dev server start | 3-5s | 0.5-1s | 5-10x faster |
| Build time | ~same | ~same | Similar |
| Runtime perf | Baseline | 5-10% faster | Slightly better |

### **Support Resources**

- 📚 Bun Docs: https://bun.sh/docs
- 🐛 Bun Issues: https://github.com/oven-sh/bun/issues
- 💬 Bun Discord: https://bun.sh/discord
- 🔧 Next.js + Bun Guide: https://bun.sh/guides/ecosystem/nextjs

---

## I. Success Criteria

Your migration is successful when:

- ✅ `bun dev` starts the development server without errors
- ✅ `bun run build` completes successfully
- ✅ All pages load correctly in production mode
- ✅ No console errors related to missing dependencies
- ✅ CI/CD pipeline passes with Bun
- ✅ Production deployment works
- ✅ Team is trained on Bun commands
- ✅ No regressions in functionality (Stripe, maps, etc.)

---

**End of Playbook**

*Next Steps: Start with Phase 1 (Local Migration). Test thoroughly before proceeding to CI/CD.*
