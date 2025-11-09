#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BRAND_DIR = join(__dirname, '../public/brand');
const BACKUP_DIR = join(BRAND_DIR, '_backup');

// Width to canonical name mapping
const WIDTH_MAP = {
  800: 'footer-illustration-no-logo-800.webp',
  1200: 'footer-illustration-no-logo-1200.webp',
  1600: 'footer-illustration-no-logo-1600.webp',
  2200: 'footer-illustration-no-logo-2200.webp',
};

const JPEG_TARGET = 'footer-illustration-no-logo-1600.jpg';

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function getImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

async function backupFile(sourcePath, filename) {
  await ensureDir(BACKUP_DIR);
  const backupPath = join(BACKUP_DIR, filename);
  await fs.copyFile(sourcePath, backupPath);
  console.log(`  ⚠️  Backed up to: _backup/${filename}`);
  return backupPath;
}

async function main() {
  console.log('🎨 Footer Asset Renaming Script\n');
  console.log('═'.repeat(60));

  // Read all files in brand directory
  const files = await fs.readdir(BRAND_DIR);
  const imgFiles = files.filter(f => f.startsWith('IMG_') && (f.endsWith('.webp') || f.endsWith('.jpeg')));

  if (imgFiles.length === 0) {
    console.log('✅ No IMG_* files found. Assets already renamed or missing.\n');
    return;
  }

  console.log(`Found ${imgFiles.length} files to process:\n`);

  // Process WebP files
  const webpFiles = imgFiles.filter(f => f.endsWith('.webp'));
  const jpegFiles = imgFiles.filter(f => f.endsWith('.jpeg'));

  const renames = [];
  const widthUsage = new Map(); // Track which widths are already taken

  // Check existing canonical files
  const existingCanonical = files.filter(f => f.startsWith('footer-illustration-no-logo-'));
  for (const file of existingCanonical) {
    const filePath = join(BRAND_DIR, file);
    const dims = await getImageDimensions(filePath);
    if (dims) {
      widthUsage.set(dims.width, file);
      console.log(`  ℹ️  Existing: ${file} (${dims.width}×${dims.height})`);
    }
  }

  if (existingCanonical.length > 0) {
    console.log('');
  }

  // Process WebP files
  for (const file of webpFiles) {
    const sourcePath = join(BRAND_DIR, file);
    const dims = await getImageDimensions(sourcePath);

    if (!dims) {
      console.warn(`⚠️  Skipping ${file}: Could not read dimensions`);
      continue;
    }

    const { width, height } = dims;
    const targetName = WIDTH_MAP[width];

    if (!targetName) {
      console.warn(`⚠️  ${file}: width ${width}px not in map (800/1200/1600/2200)`);
      console.warn(`    Dimensions: ${width}×${height}`);
      continue;
    }

    // Check if this width is already used
    if (widthUsage.has(width)) {
      const existing = widthUsage.get(width);
      if (existing !== targetName) {
        // Two files want the same width - backup the older one
        console.warn(`⚠️  Width ${width}px conflict: ${file} vs existing ${existing}`);
        await backupFile(sourcePath, file);
        continue;
      } else {
        // Target file already exists with this width
        console.log(`  ✓  ${targetName} already exists with correct dimensions`);
        // Delete the source IMG file
        await fs.unlink(sourcePath);
        console.log(`    Deleted: ${file}`);
        continue;
      }
    }

    const targetPath = join(BRAND_DIR, targetName);

    // Check if target exists
    try {
      await fs.access(targetPath);
      // Target exists - verify it's the same dimensions
      const targetDims = await getImageDimensions(targetPath);
      if (targetDims && targetDims.width === width) {
        console.log(`  ✓  ${targetName} already exists with correct dimensions`);
        await fs.unlink(sourcePath);
        console.log(`    Deleted: ${file}`);
        widthUsage.set(width, targetName);
        continue;
      } else {
        // Different dimensions - backup existing and proceed
        await backupFile(targetPath, `${targetName}.backup-${Date.now()}`);
      }
    } catch {
      // Target doesn't exist, proceed with rename
    }

    renames.push({
      from: file,
      to: targetName,
      width,
      height,
      sourcePath,
      targetPath,
    });

    widthUsage.set(width, targetName);
  }

  // Process JPEG file
  for (const file of jpegFiles) {
    const sourcePath = join(BRAND_DIR, file);
    const targetPath = join(BRAND_DIR, JPEG_TARGET);

    try {
      await fs.access(targetPath);
      // Target exists
      console.log(`  ✓  ${JPEG_TARGET} already exists`);
      await fs.unlink(sourcePath);
      console.log(`    Deleted: ${file}`);
    } catch {
      // Target doesn't exist
      renames.push({
        from: file,
        to: JPEG_TARGET,
        sourcePath,
        targetPath,
      });
    }
  }

  // Execute renames
  if (renames.length > 0) {
    console.log('\n📋 Rename Operations:\n');
    console.log('  Old Name              →  New Name                              Dimensions');
    console.log('  ' + '─'.repeat(75));

    for (const op of renames) {
      const dims = op.width ? `${op.width}×${op.height}` : 'N/A';
      console.log(`  ${op.from.padEnd(20)} →  ${op.to.padEnd(37)} ${dims}`);
      await fs.rename(op.sourcePath, op.targetPath);
    }

    console.log('\n✅ All renames completed successfully!\n');
  } else {
    console.log('\n✅ All files already in correct locations!\n');
  }

  // Check for missing widths
  console.log('📊 Final Status:\n');
  const expectedWidths = [800, 1200, 1600, 2200];
  const finalFiles = await fs.readdir(BRAND_DIR);

  for (const width of expectedWidths) {
    const filename = WIDTH_MAP[width];
    if (finalFiles.includes(filename)) {
      console.log(`  ✅  ${filename}`);
    } else {
      console.warn(`  ⚠️   ${filename} - MISSING (no ${width}px version found)`);
    }
  }

  if (finalFiles.includes(JPEG_TARGET)) {
    console.log(`  ✅  ${JPEG_TARGET}`);
  } else {
    console.warn(`  ⚠️   ${JPEG_TARGET} - MISSING`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✨ Done!\n');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
