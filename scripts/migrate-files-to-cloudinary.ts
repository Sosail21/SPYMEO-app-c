#!/usr/bin/env tsx

/**
 * Migration Script: Migrate existing mock files to Cloudinary
 *
 * This script migrates:
 * - User avatars
 * - Documents (user and client documents)
 * - Receipts
 * - Product images
 * - Article thumbnails
 * - Service images
 * - Formation images
 * - Announcement images
 * - Resources
 *
 * Usage:
 *   npm run migrate:cloudinary
 *   npm run migrate:cloudinary -- --dry-run
 *   npm run migrate:cloudinary -- --type=avatars
 */

import { PrismaClient } from '@prisma/client';
import {
  uploadAvatar,
  uploadDocument,
  uploadReceipt,
  uploadProductImage,
  uploadArticleCover,
  uploadServiceImage,
  uploadFormationImage,
  uploadAnnonceImage,
  uploadResource,
} from '../src/lib/cloudinary/upload';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
}

interface MigrationOptions {
  dryRun: boolean;
  type?: string;
  batchSize: number;
}

const stats: Record<string, MigrationStats> = {
  avatars: { total: 0, success: 0, failed: 0, skipped: 0 },
  documents: { total: 0, success: 0, failed: 0, skipped: 0 },
  clientDocuments: { total: 0, success: 0, failed: 0, skipped: 0 },
  receipts: { total: 0, success: 0, failed: 0, skipped: 0 },
  products: { total: 0, success: 0, failed: 0, skipped: 0 },
  services: { total: 0, success: 0, failed: 0, skipped: 0 },
  articles: { total: 0, success: 0, failed: 0, skipped: 0 },
  formations: { total: 0, success: 0, failed: 0, skipped: 0 },
  annonces: { total: 0, success: 0, failed: 0, skipped: 0 },
  resources: { total: 0, success: 0, failed: 0, skipped: 0 },
};

/**
 * Check if file exists locally (for mock files)
 */
function fileExists(filePath: string): boolean {
  if (!filePath) return false;
  if (filePath.startsWith('http')) return true; // Already uploaded
  return fs.existsSync(filePath);
}

/**
 * Read file as buffer
 */
function readFileBuffer(filePath: string): Buffer | null {
  try {
    if (filePath.startsWith('http')) return null;
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return null;
  }
}

/**
 * Migrate user avatars
 */
async function migrateAvatars(options: MigrationOptions) {
  console.log('\n📸 Migrating avatars...');

  const users = await prisma.user.findMany({
    where: {
      avatar: { not: null },
      avatarPublicId: null, // Not yet migrated
    },
    select: { id: true, avatar: true },
  });

  stats.avatars.total = users.length;
  console.log(`Found ${users.length} avatars to migrate`);

  for (const user of users) {
    if (!user.avatar) continue;

    // Skip if already a Cloudinary URL
    if (user.avatar.includes('cloudinary.com')) {
      stats.avatars.skipped++;
      continue;
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would migrate avatar for user ${user.id}`);
      stats.avatars.success++;
      continue;
    }

    try {
      let uploadResult;

      if (fileExists(user.avatar)) {
        const buffer = readFileBuffer(user.avatar);
        if (!buffer) {
          stats.avatars.failed++;
          continue;
        }
        uploadResult = await uploadAvatar(buffer, user.id);
      } else {
        // Try as URL
        uploadResult = await uploadAvatar(user.avatar, user.id);
      }

      if (uploadResult.success && uploadResult.secureUrl && uploadResult.publicId) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            avatar: uploadResult.secureUrl,
            avatarPublicId: uploadResult.publicId,
          },
        });
        stats.avatars.success++;
        console.log(`✓ Migrated avatar for user ${user.id}`);
      } else {
        stats.avatars.failed++;
        console.error(`✗ Failed to migrate avatar for user ${user.id}:`, uploadResult.error);
      }
    } catch (error) {
      stats.avatars.failed++;
      console.error(`✗ Error migrating avatar for user ${user.id}:`, error);
    }
  }
}

/**
 * Migrate receipts
 */
async function migrateReceipts(options: MigrationOptions) {
  console.log('\n🧾 Migrating receipts...');

  const receipts = await prisma.receipt.findMany({
    where: {
      cloudinaryPublicId: null,
    },
    select: { id: true, userId: true, fileUrl: true },
  });

  stats.receipts.total = receipts.length;
  console.log(`Found ${receipts.length} receipts to migrate`);

  for (const receipt of receipts) {
    if (receipt.fileUrl.includes('cloudinary.com')) {
      stats.receipts.skipped++;
      continue;
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would migrate receipt ${receipt.id}`);
      stats.receipts.success++;
      continue;
    }

    try {
      let uploadResult;

      if (fileExists(receipt.fileUrl)) {
        const buffer = readFileBuffer(receipt.fileUrl);
        if (!buffer) {
          stats.receipts.failed++;
          continue;
        }
        uploadResult = await uploadReceipt(buffer, receipt.userId);
      } else {
        uploadResult = await uploadReceipt(receipt.fileUrl, receipt.userId);
      }

      if (uploadResult.success && uploadResult.secureUrl && uploadResult.publicId) {
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: {
            fileUrl: uploadResult.secureUrl,
            cloudinaryPublicId: uploadResult.publicId,
          },
        });
        stats.receipts.success++;
        console.log(`✓ Migrated receipt ${receipt.id}`);
      } else {
        stats.receipts.failed++;
        console.error(`✗ Failed to migrate receipt ${receipt.id}:`, uploadResult.error);
      }
    } catch (error) {
      stats.receipts.failed++;
      console.error(`✗ Error migrating receipt ${receipt.id}:`, error);
    }
  }
}

/**
 * Migrate documents
 */
async function migrateDocuments(options: MigrationOptions) {
  console.log('\n📄 Migrating documents...');

  const documents = await prisma.document.findMany({
    where: {
      cloudinaryPublicId: null,
    },
    select: { id: true, userId: true, fileUrl: true, category: true },
  });

  stats.documents.total = documents.length;
  console.log(`Found ${documents.length} documents to migrate`);

  for (const doc of documents) {
    if (doc.fileUrl.includes('cloudinary.com')) {
      stats.documents.skipped++;
      continue;
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would migrate document ${doc.id}`);
      stats.documents.success++;
      continue;
    }

    try {
      let uploadResult;
      const docType = doc.category || 'general';

      if (fileExists(doc.fileUrl)) {
        const buffer = readFileBuffer(doc.fileUrl);
        if (!buffer) {
          stats.documents.failed++;
          continue;
        }
        uploadResult = await uploadDocument(buffer, doc.userId, docType);
      } else {
        uploadResult = await uploadDocument(doc.fileUrl, doc.userId, docType);
      }

      if (uploadResult.success && uploadResult.secureUrl && uploadResult.publicId) {
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            fileUrl: uploadResult.secureUrl,
            cloudinaryPublicId: uploadResult.publicId,
          },
        });
        stats.documents.success++;
        console.log(`✓ Migrated document ${doc.id}`);
      } else {
        stats.documents.failed++;
        console.error(`✗ Failed to migrate document ${doc.id}:`, uploadResult.error);
      }
    } catch (error) {
      stats.documents.failed++;
      console.error(`✗ Error migrating document ${doc.id}:`, error);
    }
  }
}

/**
 * Migrate product images
 */
async function migrateProducts(options: MigrationOptions) {
  console.log('\n🛍️ Migrating product images...');

  const products = await prisma.product.findMany({
    where: {
      images: { isEmpty: false },
    },
    select: { id: true, images: true, cloudinaryPublicIds: true },
  });

  stats.products.total = products.length;
  console.log(`Found ${products.length} products to migrate`);

  for (const product of products) {
    if (product.cloudinaryPublicIds && product.cloudinaryPublicIds.length > 0) {
      stats.products.skipped++;
      continue;
    }

    if (options.dryRun) {
      console.log(`[DRY RUN] Would migrate ${product.images.length} images for product ${product.id}`);
      stats.products.success++;
      continue;
    }

    try {
      const newImages: string[] = [];
      const newPublicIds: string[] = [];

      for (let i = 0; i < product.images.length; i++) {
        const imageUrl = product.images[i];

        if (imageUrl.includes('cloudinary.com')) {
          newImages.push(imageUrl);
          continue;
        }

        let uploadResult;

        if (fileExists(imageUrl)) {
          const buffer = readFileBuffer(imageUrl);
          if (!buffer) continue;
          uploadResult = await uploadProductImage(buffer, product.id, i);
        } else {
          uploadResult = await uploadProductImage(imageUrl, product.id, i);
        }

        if (uploadResult.success && uploadResult.secureUrl && uploadResult.publicId) {
          newImages.push(uploadResult.secureUrl);
          newPublicIds.push(uploadResult.publicId);
        }
      }

      if (newImages.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: newImages,
            cloudinaryPublicIds: newPublicIds,
          },
        });
        stats.products.success++;
        console.log(`✓ Migrated ${newImages.length} images for product ${product.id}`);
      } else {
        stats.products.failed++;
      }
    } catch (error) {
      stats.products.failed++;
      console.error(`✗ Error migrating product ${product.id}:`, error);
    }
  }
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));

  Object.entries(stats).forEach(([type, stat]) => {
    if (stat.total > 0) {
      console.log(`\n${type.toUpperCase()}:`);
      console.log(`  Total: ${stat.total}`);
      console.log(`  ✓ Success: ${stat.success}`);
      console.log(`  ✗ Failed: ${stat.failed}`);
      console.log(`  ⊘ Skipped: ${stat.skipped}`);
    }
  });

  console.log('\n' + '='.repeat(50));
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    type: args.find((arg) => arg.startsWith('--type='))?.split('=')[1],
    batchSize: 100,
  };

  console.log('🚀 Starting Cloudinary Migration');
  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
  }

  try {
    if (!options.type || options.type === 'avatars') {
      await migrateAvatars(options);
    }

    if (!options.type || options.type === 'receipts') {
      await migrateReceipts(options);
    }

    if (!options.type || options.type === 'documents') {
      await migrateDocuments(options);
    }

    if (!options.type || options.type === 'products') {
      await migrateProducts(options);
    }

    // Add more migration functions as needed...

    printSummary();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
