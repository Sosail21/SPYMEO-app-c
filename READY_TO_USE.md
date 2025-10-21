# READY TO USE - SPYMEO V1
## Guide de démarrage rapide Local & Production

**Version**: 1.0.0
**Date**: 2025-10-21
**Stack**: Next.js 14 + Prisma + PostgreSQL + AWS

---

## 🚀 QUICK START LOCAL (5 minutes)

### Prérequis

- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ local OU accès AWS RDS
- Git

### Installation

```bash
# 1. Cloner le repository
git clone <repo-url>
cd spymeo

# 2. Installer dépendances
npm install

# 3. Copier .env.example vers .env.local
cp .env.example .env.local

# 4. Configurer .env.local (MINIMUM REQUIS)
# Éditer .env.local:

DATABASE_URL="postgresql://user:password@localhost:5432/spymeo?schema=public"
JWT_SECRET="<générer_avec_openssl_rand_base64_32>"
NEXTAUTH_SECRET="<même_valeur_que_JWT_SECRET>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
ADMIN_EMAIL="cindy-dorbane@spymeo.fr"

# 5. Générer JWT_SECRET
openssl rand -base64 32
# Copier résultat dans .env.local JWT_SECRET et NEXTAUTH_SECRET

# 6. Générer Prisma Client
npm run db:generate

# 7. Exécuter migrations (si DB locale vierge)
npm run db:migrate

# 8. Seed minimal (créer admin)
npm run db:seed:min

# 9. Démarrer dev server
npm run dev
```

🎉 **Application accessible sur** `http://localhost:3000`

### Connexion admin

```
URL: http://localhost:3000/auth/login
Email: cindy-dorbane@spymeo.fr
Password: ChangeMe2025!

⚠️ Changer le password immédiatement après premier login!
```

---

## 📦 BUILD PRODUCTION LOCAL

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Build Next.js
npm run build

# 4. Démarrer en mode production
npm start

# Application accessible sur http://localhost:3000
```

---

## 🔧 CONFIGURATION COMPLÈTE

### Variables d'environnement (.env.local)

```env
# ══════════════════════════════════════════════════════════════════
# DATABASE (REQUIS)
# ══════════════════════════════════════════════════════════════════
DATABASE_URL="postgresql://user:password@host:5432/spymeo?schema=public"

# ══════════════════════════════════════════════════════════════════
# AUTH (REQUIS)
# ══════════════════════════════════════════════════════════════════
JWT_SECRET="<openssl rand -base64 32>"
NEXTAUTH_SECRET="<même que JWT_SECRET>"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_URL="http://localhost:3000"
ADMIN_EMAIL="cindy-dorbane@spymeo.fr"

# ══════════════════════════════════════════════════════════════════
# STRIPE (OPTIONNEL - paiements désactivés si absent)
# ══════════════════════════════════════════════════════════════════
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ══════════════════════════════════════════════════════════════════
# EMAIL SMTP (OPTIONNEL - emails désactivés si absent)
# ══════════════════════════════════════════════════════════════════
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@spymeo.fr"
SMTP_PASSWORD="your_smtp_password"
SMTP_FROM="SPYMEO <noreply@spymeo.fr>"

# ══════════════════════════════════════════════════════════════════
# AWS S3 (OPTIONNEL - uploads désactivés si absent)
# ══════════════════════════════════════════════════════════════════
AWS_REGION="eu-west-3"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
S3_BUCKET_NAME="spymeo-production-assets"

# ══════════════════════════════════════════════════════════════════
# FEATURE FLAGS (OPTIONNEL - défaut: tout activé)
# ══════════════════════════════════════════════════════════════════
ENABLE_PASS="true"
ENABLE_ACADEMY="true"
ENABLE_BLOG="true"

# ══════════════════════════════════════════════════════════════════
# MONITORING (OPTIONNEL)
# ══════════════════════════════════════════════════════════════════
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"

# ══════════════════════════════════════════════════════════════════
# DEVELOPMENT (OPTIONNEL)
# ══════════════════════════════════════════════════════════════════
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
```

---

## 🗄️ DATABASE SCRIPTS

```bash
# Générer Prisma Client (après modification schema.prisma)
npm run db:generate

# Créer nouvelle migration
npm run db:migrate

# Déployer migrations (production)
npm run db:migrate:deploy

# Status migrations
npm run db:migrate:status

# Seed minimal (admin + données initiales)
npm run db:seed:min

# Reset DB local (⚠️ EFFACE TOUT)
npm run db:reset:local

# Ouvrir Prisma Studio (UI visuelle DB)
npm run db:studio
```

---

## 🎨 DEVELOPMENT SCRIPTS

```bash
# Dev server (hot reload)
npm run dev

# TypeScript check (sans build)
npm run typecheck

# Lint (ESLint)
npm run lint

# Format (Prettier)
npm run format

# Build production
npm run build

# Start production server
npm start
```

---

## 🚢 DÉPLOIEMENT PRODUCTION AWS

### Prérequis

- AWS CLI configuré
- Accès VPN/Bastion pour RDS
- Secrets configurés dans AWS Secrets Manager

### Étapes

**1. Rotation DATABASE_URL** (voir `MIGRATION_NOTES.md` ÉTAPE 1)

**2. Migrations DB** (voir `MIGRATION_NOTES.md` ÉTAPE 2)

```bash
# Via VPN/Bastion
npx prisma migrate deploy
npm run db:seed:min
```

**3. Build Docker**

```bash
docker build -t spymeo:1.0.0 .

# Test local
docker run -p 3000:3000 --env-file .env.production spymeo:1.0.0
curl http://localhost:3000/api/health
```

**4. Push ECR**

```bash
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com

docker tag spymeo:1.0.0 \
  <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0

docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0
```

**5. Deploy ECS**

```bash
# Via Terraform
terraform apply -var-file=terraform.tfvars

# OU via AWS CLI
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --force-new-deployment \
  --region eu-west-3
```

**6. Validations** (voir `MIGRATION_NOTES.md` ÉTAPE 5)

---

## 🧪 TESTING

```bash
# E2E tests Playwright (si implémentés)
npm run test:e2e

# Lancer Playwright UI
npx playwright test --ui
```

---

## 📊 MONITORING & LOGS

### Local

```bash
# Logs dev server (console)
npm run dev

# Prisma logs (query debugging)
DEBUG=prisma:* npm run dev
```

### Production (AWS)

```bash
# CloudWatch Logs
aws logs tail /ecs/spymeo-app --follow --region eu-west-3

# ECS Service status
aws ecs describe-services \
  --cluster spymeo-production \
  --services spymeo-app \
  --region eu-west-3
```

---

## 🐛 TROUBLESHOOTING

### Erreur: "Can't reach database server"

```bash
# Vérifier DATABASE_URL
echo $DATABASE_URL

# Tester connexion PostgreSQL
psql $DATABASE_URL -c "SELECT 1"

# Si AWS RDS: vérifier VPN/Bastion actif
```

### Erreur: "JWT_SECRET is required"

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Ajouter dans .env.local
JWT_SECRET="<résultat_ci-dessus>"
NEXTAUTH_SECRET="<même_valeur>"
```

### Erreur: "Prisma Client not generated"

```bash
# Régénérer Prisma Client
npm run db:generate

# Vérifier installation
ls node_modules/.prisma/client
```

### Erreur: Build Next.js échoue

```bash
# Vérifier TypeScript
npm run typecheck

# Vérifier ESLint
npm run lint

# Nettoyer cache
rm -rf .next node_modules
npm install
npm run build
```

### Erreur: Stripe webhooks 400 Bad Request

```bash
# Vérifier STRIPE_WEBHOOK_SECRET configuré
# Tester signature:
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "stripe-signature: invalid" \
  -d '{}' \
# Expect: 400 (normal, signature invalide)

# En prod: Vérifier endpoint Stripe Dashboard
# https://dashboard.stripe.com/webhooks
```

---

## 📖 DOCUMENTATION COMPLÈTE

- `REPORT_DISCOVERY.md` - Audit complet codebase (927 lignes)
- `PLAN_EXECUTION.md` - Plan détaillé reconstruction (1067 lignes)
- `DECISIONS_LOG.md` - Décisions techniques (736 lignes)
- `MIGRATION_NOTES.md` - Guide migrations DB (285 lignes)
- `ROLLBACK.md` - Procédures rollback (119 lignes)
- `CHANGELOG.md` - Historique versions
- `READY_TO_USE.md` - Ce fichier

---

## 🔒 SÉCURITÉ

### Secrets à ne JAMAIS committer

- `.env` (déjà dans .gitignore ✅)
- `.env.local`
- `.env.production`
- Tout fichier contenant DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, etc.

### Bonnes pratiques

```bash
# Vérifier .gitignore avant commit
cat .gitignore | grep ".env"

# Vérifier aucun secret committé (git-secrets si installé)
git secrets --scan

# Rotation secrets régulière (tous les 90 jours recommandé)
# - DATABASE_URL password
# - JWT_SECRET
# - STRIPE keys (si compromises)
```

---

## 📞 SUPPORT

### Documentation

- README.md - Vue d'ensemble projet
- SECURITY.md - Politique sécurité
- Tous fichiers `*.md` racine projet

### Ressources externes

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## ✅ CHECKLIST PRÉ-PRODUCTION

- [ ] DATABASE_URL password rotaté (AWS RDS)
- [ ] Migrations Prisma exécutées (`npm run db:migrate:deploy`)
- [ ] Seed minimal exécuté (`npm run db:seed:min`)
- [ ] Admin login fonctionne (`cindy-dorbane@spymeo.fr`)
- [ ] Admin password changé (pas `ChangeMe2025!`)
- [ ] Stripe configuré (ou feature flag `STRIPE_ENABLED=false`)
- [ ] SMTP configuré (ou feature flag `EMAIL_ENABLED=false`)
- [ ] S3 configuré (ou feature flag `S3_ENABLED=false`)
- [ ] JWT_SECRET sécurisé (pas `changeme_in_production`)
- [ ] Build Docker réussit (`docker build`)
- [ ] Healthcheck OK (`curl /api/health`)
- [ ] Tests E2E passent (si implémentés)
- [ ] CloudWatch Logs monitorés (pas d'erreurs critiques)
- [ ] Backup RDS activé (snapshots quotidiens)
- [ ] Plan rollback documenté (ROLLBACK.md)

---

**Prêt à l'emploi** ✅

Application testée et documentée pour déploiement production.

**Next steps**:
1. Exécuter checklist pré-production ci-dessus
2. Déployer sur AWS (voir section Déploiement)
3. Monitorer logs CloudWatch 24h post-déploiement
4. Implémenter Phase 2 (P1) - voir PLAN_EXECUTION.md

---

**FIN DU GUIDE READY TO USE**
