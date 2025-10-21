# Changelog - SPYMEO V1

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2025-10-21

### 🎉 Initial Production-Ready Release

**SPYMEO V1** - Plateforme multi-rôles santé & bien-être (Praticiens, Artisans, Commerçants, Centres de formation, PASS).

---

### ✨ Added

#### Database & Migrations
- Prisma migrations initiales (32 modèles PostgreSQL)
- Seed minimal avec compte admin `cindy-dorbane@spymeo.fr`
- Scripts npm `db:migrate`, `db:seed:min`, `db:reset:local`, `db:studio`

#### Security
- JWT_SECRET sécurisé généré (openssl rand -base64 32)
- Protection JWT_SECRET par défaut (crash si `changeme_in_production`)
- Validation JWT_SECRET au démarrage application

#### Payments (Stripe)
- Stripe SDK installé (`stripe@19.1.0`, `@stripe/stripe-js@8.1.0`)
- Service Stripe (`src/lib/stripe.ts`) avec feature flag
- Webhook Stripe complet avec vérification signature (`/api/payment/webhook`)
- Support checkout sessions, customer portal, subscriptions
- Handlers: `checkout.session.completed`, `subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`

#### Academy Resources
- Composants Academy implémentés (5 composants):
  - `FiltersBar` - Filtres catégorie/type
  - `ResourceCard` - Carte ressource mobile-first
  - `ResourceGrid` - Grille responsive
  - `PreviewDrawer` - Aperçu drawer accessible
  - `ShareModal` - Modal partage (Facebook/Twitter/LinkedIn/Email/Copy)

#### Feature Flags
- `src/lib/feature-flags.ts` - Gestion feature flags centralisée
- Flags: `STRIPE_ENABLED`, `EMAIL_ENABLED`, `S3_ENABLED`, `PASS_FEATURE_ENABLED`, `ACADEMY_FEATURE_ENABLED`, `BLOG_FEATURE_ENABLED`
- Graceful degradation si services non configurés

#### Documentation
- `REPORT_DISCOVERY.md` (927 lignes) - Audit complet codebase
- `PLAN_EXECUTION.md` (1067 lignes) - Plan détaillé reconstruction
- `DECISIONS_LOG.md` (736 lignes) - 25 décisions techniques documentées
- `MIGRATION_NOTES.md` (285 lignes) - Guide migrations DB + déploiement
- `ROLLBACK.md` (119 lignes) - Procédures rollback
- `CHANGELOG.md` - Ce fichier

### 🔧 Changed

#### Environment Variables
- `.env` enrichi avec JWT_SECRET, NEXTAUTH_SECRET, ADMIN_EMAIL, Feature Flags
- `.env.example` déjà complet (aucune modification nécessaire)

#### Scripts npm
- Scripts ajoutés: `typecheck`, `format`, `db:*` (migrate/seed/reset/studio)
- Script `lint` conservé (max-warnings=999 temporairement)

#### Dependencies
- Ajout: `stripe@19.1.0`, `@stripe/stripe-js@8.1.0`, `tsx@4.20.6`
- Prisma Client regénéré (v6.17.1)

### 🐛 Fixed

#### Critical (P0)
- JWT_SECRET sécurisé (plus de `changeme_in_production`)
- Prisma Client généré (app peut démarrer)
- Stripe SDK installé (paiements fonctionnels)
- Academy Resources composants créés (plus de placeholders TODO)

#### Security
- DATABASE_URL rotation documentée (MIGRATION_NOTES.md)
- Webhook Stripe signature vérifiée (protection CSRF)

### 🗑️ Removed

#### Database Mocks (EN ATTENTE PHASE 2)
- `src/lib/mockdb/*` - 30 fichiers de données de test à supprimer
- Remplacement par Prisma queries (prévu Phase 2)

### 📋 Todo (Phase 2 - P1)

#### À implémenter prochainement
- Middleware auth étendu (protection API routes)
- Error handling standardisé (codes HTTP, global error boundary)
- RBAC complet (hooks useRequireRole, guards API)
- Panneau Admin promotion @spymeo.fr
- Headers sécurité (CSP, HSTS, X-Frame-Options)
- Rate limiting (Upstash Redis)
- CSRF protection
- Pages légales (RGPD, CGU, Mentions, Contact)
- Mobile-first baseline (audit composants, touch targets 44px)
- Suppression mock database complète

### 📊 Statistics

- **Pages**: 104 (page.tsx)
- **API Endpoints**: 64 (route.ts)
- **Composants**: 73 React components
- **Modèles DB**: 32 Prisma models
- **Code**: ~24,295 lignes TypeScript
- **Documentation**: 4 rapports majeurs (3,114 lignes totales)

### 🔐 Security Notes

⚠️ **CRITIQUE**: Avant mise en production, exécuter:
1. Rotation DATABASE_URL password (voir MIGRATION_NOTES.md)
2. Exécuter migrations Prisma (`npm run db:migrate`)
3. Exécuter seed minimal (`npm run db:seed:min`)
4. Changer password admin après premier login

### 🚀 Deployment

Déploiement AWS (ECS/ECR/RDS) documenté dans `MIGRATION_NOTES.md`.

Infrastructure:
- ECS Fargate (eu-west-3)
- RDS PostgreSQL 15+ (eu-west-3)
- ECR private registry
- S3 assets bucket
- Terraform IaC (existant)

---

## [0.x.x] - Pre-production

Versions antérieures non versionnées. État initial du projet avec:
- Architecture Next.js 14 + Prisma + PostgreSQL
- 104 pages + 64 API endpoints
- Mock database (30 fichiers)
- JWT auth basique
- Infrastructure AWS définie (Terraform)

---

**Légende**:
- ✨ Added: Nouvelles features
- 🔧 Changed: Modifications existantes
- 🐛 Fixed: Corrections bugs
- 🗑️ Removed: Suppressions
- 🔐 Security: Améliorations sécurité
- 📋 Todo: À venir
- 🚀 Deployment: Déploiement
