#!/bin/bash
# Cdw-Spm: Production Database Migration Script

set -e

echo "🔄 Starting database migration..."

# Run Prisma migrations
npx prisma migrate deploy

echo "✅ Database migration completed successfully!"
