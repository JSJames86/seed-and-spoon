# Bun Migration Quick Start

This is a condensed guide to get you started. See `BUN_MIGRATION_PLAYBOOK.md` for the complete guide.

## ⚡ Quick Migration (5 minutes)

```bash
# 1. Backup current state
git checkout -b migration/npm-to-bun
cp package.json package.json.backup

# 2. Install Bun
curl -fsSL https://bun.sh/install | bash

# 3. Remove npm artifacts
rm -rf node_modules package-lock.json

# 4. Install with Bun
bun install

# 5. Test it works
bun dev
```

## 🚀 Daily Commands

```bash
# Development
bun dev              # Start dev server
bun run build        # Build for production
bun start            # Start production server
bun run lint         # Run linter

# Package management
bun add <package>    # Install package
bun remove <package> # Remove package
bun update           # Update packages
bun pm ls            # List installed packages
```

## ✅ Verify Migration

```bash
# Run smoke tests
./scripts/smoke-test.sh

# Run unit tests
bun test

# Benchmark improvement
./scripts/benchmark.sh
```

## 🔄 Rollback (if needed)

```bash
# Restore npm
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json
rm -rf node_modules bun.lockb
npm install
```

## 📚 Full Documentation

See `BUN_MIGRATION_PLAYBOOK.md` for:
- CI/CD setup with GitHub Actions
- Docker deployment
- Troubleshooting guide
- Performance benchmarks
- Edge cases and solutions
