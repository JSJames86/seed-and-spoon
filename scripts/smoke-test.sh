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

# 7. Test about page
echo "✓ Testing about page..."
curl -f http://localhost:3000/about > /dev/null || echo "⚠️  About page not found (ok if doesn't exist)"

# 8. Test recipes page
echo "✓ Testing recipes page..."
curl -f http://localhost:3000/recipes > /dev/null || echo "⚠️  Recipes page not found (ok if doesn't exist)"

# 9. Cleanup
echo "✓ Cleaning up..."
kill $SERVER_PID

echo "✅ All smoke tests passed!"
