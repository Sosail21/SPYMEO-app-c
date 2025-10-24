#!/usr/bin/env bash
# Cdw-Spm: Entrypoint Docker SPYMEO
# Exécute les migrations Prisma puis démarre l'application
set -euo pipefail

echo "[entrypoint] SPYMEO container starting..."
echo "[entrypoint] Environment: ${NODE_ENV:-development}"

# Fonction de retry pour les migrations
run_migrations() {
 local max_attempts=5
  local attempt=1
  local wait_time=5

  while [ $attempt -le $max_attempts ]; do
   echo "[entrypoint] Attempt $attempt/$max_attempts: Running Prisma migrations..."

    # Essayer d'appliquer les migrations
    if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log; then
     echo "[entrypoint] Migrations applied successfully"
      return 0
    fi

    # Vérifier si c'est une erreur de migration échouée (P3009)
    if grep -q "P3009" /tmp/migrate_output.log || grep -q "failed migrations" /tmp/migrate_output.log; then
      echo "[entrypoint] Detected failed migration, attempting to resolve..."

      # Extraire le nom de la migration échouée
      FAILED_MIGRATION=$(grep -oP "The \`\K[^']*(?=' migration.*failed)" /tmp/migrate_output.log | head -1)

      if [ -n "$FAILED_MIGRATION" ]; then
        echo "[entrypoint] Resolving failed migration: $FAILED_MIGRATION"
        npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" || true
        echo "[entrypoint] Retrying migration deployment..."
        continue
      fi
    fi

    if [ $attempt -eq $max_attempts ]; then
     echo "[entrypoint] ERROR: Failed to apply migrations after $max_attempts attempts"
      exit 1
    fi

    echo "[entrypoint] Migration failed, retrying in ${wait_time}s..."
    sleep $wait_time
    attempt=$((attempt + 1))
    wait_time=$((wait_time * 2))
  done
}

# Vérifier que DATABASE_URL est définie
if [ -z "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] ERROR: DATABASE_URL is not set"
  exit 1
fi

# Exécuter les migrations
run_migrations

# Exécuter les seeds (nouveau)
echo "[entrypoint] Running database seeds..."
npm run db:seed:min || echo "[entrypoint] Seed already applied or skipped"

# Générer le client Prisma (au cas où)
echo "[entrypoint] Ensuring Prisma client is generated..."
npx prisma generate || echo "[entrypoint] WARNING: Prisma generate failed (may already be generated)"

# Démarrer l'application
echo "[entrypoint] Starting Next.js application on port 3000..."
exec node server.js
