#!/bin/bash

echo "📊 Benchmarking Bun vs npm installation speed..."
echo "================================================"

# Ensure we start clean
rm -rf node_modules bun.lockb package-lock.json

# Benchmark Bun install
echo ""
echo "⏱️  Testing Bun install..."
SECONDS=0
bun install > /dev/null 2>&1
BUN_TIME=$SECONDS
echo "   Completed in ${BUN_TIME} seconds"

# Cleanup
rm -rf node_modules bun.lockb

# Benchmark npm install
echo ""
echo "⏱️  Testing npm install..."
SECONDS=0
npm install > /dev/null 2>&1
NPM_TIME=$SECONDS
echo "   Completed in ${NPM_TIME} seconds"

# Calculate speedup
if [ $BUN_TIME -gt 0 ]; then
  SPEEDUP=$(echo "scale=2; $NPM_TIME / $BUN_TIME" | bc)
else
  SPEEDUP="N/A"
fi

# Display results
echo ""
echo "================================================"
echo "📈 Results:"
echo "   Bun: ${BUN_TIME}s"
echo "   npm: ${NPM_TIME}s"
echo "   Speedup: ${SPEEDUP}x"
echo "================================================"

# Restore Bun installation
echo ""
echo "🔄 Restoring Bun installation..."
rm -rf node_modules package-lock.json
bun install > /dev/null 2>&1
echo "✅ Done!"
