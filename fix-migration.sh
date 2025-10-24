#!/bin/bash
# Script to resolve failed migration in production

echo "Resolving failed migration..."

# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20251024140000_add_client_to_appointments

echo "Migration marked as rolled back. Now deploying migrations..."

# Deploy all pending migrations
npx prisma migrate deploy

echo "Done!"
