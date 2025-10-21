# DISCOVERY REPORT - SPYMEO V1
## Reconstruction Autonome Mobile-First Production-Ready

**Date**: 2025-10-21
**Mission**: Rebuild total autonome mobile-first, production-ready, AWS en place
**Status**: Discovery Phase COMPLETED

---

## EXECUTIVE SUMMARY

Projet SPYMEO V1 - Plateforme santé & bien-être multi-rôles (Praticiens, Artisans, Commerçants, Centres de formation, PASS). Architecture Next.js 14 + Prisma + PostgreSQL + AWS.

**État global**:
- ✅ Architecture solide, schéma DB complet (32 modèles), infrastructure AWS définie
- ⚠️ **7 points P0 bloquants** (migrations manquantes, secrets, mocks, intégrations incomplètes)
- ⚠️ **9 points P1 importants** (auth, error handling, TypeScript strict, etc.)

**Estimation**: 2-3 semaines pour correction P0/P1 + tests complets avant mise en production

---

## 1. STACK TECHNIQUE DÉTECTÉE

### Frontend
- **Framework**: Next.js 14.2.32 (App Router)
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.5.4
- **Styling**: Tailwind CSS 3.4.10 + plugins (@forms, @typography, @line-clamp)
- **Calendar**: FullCalendar 6.1.19 (daygrid, timegrid, interaction)
- **Charts**: Chart.js 4.4.4 + react-chartjs-2 5.2.0
- **Data Fetching**: SWR 2.3.6
- **Validation**: Zod 4.1.12

### Backend
- **Runtime**: Node.js 20
- **ORM**: Prisma 6.17.1
- **Database**: PostgreSQL 15+ (AWS RDS eu-west-3)
- **Auth**: JWT (jsonwebtoken 9.0.2) + Bcrypt 6.0.0
- **Email**: Nodemailer 7.0.9
- **Storage**: AWS S3 (@aws-sdk/client-s3 3.911.0)

### Infrastructure
- **Cloud**: AWS (ECS, ECR, RDS, S3)
- **IaC**: Terraform 1.23.0
- **CI/CD**: GitHub Actions
- **Container**: Docker (multi-stage build)
- **Testing**: Playwright 1.56.0

### Linting & Formatting
- **ESLint**: 8.57.0 (next config 14.2.5) - loose (max-warnings=999)
- **PostCSS**: 8.4.41
- **Autoprefixer**: 10.4.20

---

## 2. ARCHITECTURE & STRUCTURE

### Répertoires clés
```
/src/app/               # Pages & API routes (App Router Next.js 14)
/src/components/        # Composants React
/src/lib/               # Utilitaires, services, helpers, mockdb
/prisma/                # Schéma DB, migrations (VIDE!), seeds
/public/                # Assets statiques
/terraform/             # Infrastructure as Code (AWS)
/.github/workflows/     # CI/CD pipelines
/docker/                # Entrypoint scripts
```

### Statistiques
- **104** pages (page.tsx)
- **64** API endpoints (route.ts)
- **73** composants React
- **40** fichiers utilitaires (lib/)
- **32** modèles Prisma
- **30** fichiers mock database
- **24,295** lignes TypeScript total

---

## 3. PAGES INVENTORIÉES (104 TOTAL)

### Pages Publiques (13)
- `/` - Homepage
- `/auth/login`, `/auth/register`, `/auth/mot-de-passe-oublie`, `/auth/reinitialiser-mot-de-passe`
- `/praticiens`, `/artisans`, `/commercants`, `/centres-de-formation`
- `/blog`, `/blog/[slug]`
- `/pass`
- `/non-autorise`

### Pages Praticiens (23)
- `/praticiens/tableau-de-bord`
- `/praticiens/profil`, `/praticiens/agenda`, `/praticiens/patients`, `/praticiens/patients/[id]`
- `/praticiens/consultations`, `/praticiens/documents`, `/praticiens/factures`
- `/praticiens/academy`, `/praticiens/academy/[id]`
- `/praticiens/paiement/*` (5 pages)
- `/praticiens/attente-validation`, `/praticiens/attente-paiement`, `/praticiens/abonnement-expire`

### Pages Artisans (22)
- `/artisans/tableau-de-bord`
- `/artisans/profil`, `/artisans/services`, `/artisans/services/[id]`, `/artisans/services/nouveau`
- `/artisans/clients`, `/artisans/clients/[id]`
- `/artisans/commandes`, `/artisans/documents`, `/artisans/pre-compta`
- `/artisans/academy`, `/artisans/academy/[id]`
- `/artisans/paiement/*` (5 pages)
- `/artisans/attente-validation`, `/artisans/attente-paiement`, `/artisans/abonnement-expire`

### Pages Commerçants (24)
- `/commercants/tableau-de-bord`
- `/commercants/profil`, `/commercants/boutique`, `/commercants/produits`, `/commercants/produits/[id]`, `/commercants/produits/nouveau`
- `/commercants/clients`, `/commercants/clients/[id]`
- `/commercants/commandes`, `/commercants/stock`, `/commercants/documents`, `/commercants/pre-compta`
- `/commercants/academy`, `/commercants/academy/[id]`
- `/commercants/paiement/*` (5 pages)
- `/commercants/attente-validation`, `/commercants/attente-paiement`, `/commercants/abonnement-expire`

### Pages Centres de Formation (24)
- `/centres-de-formation/tableau-de-bord`
- `/centres-de-formation/profil`
- `/centres-de-formation/formations`, `/centres-de-formation/formations/[id]`, `/centres-de-formation/formations/nouvelle`
- `/centres-de-formation/sessions`, `/centres-de-formation/sessions/[id]`, `/centres-de-formation/sessions/nouvelle`
- `/centres-de-formation/apprenants`, `/centres-de-formation/apprenants/[id]`
- `/centres-de-formation/documents`, `/centres-de-formation/pre-compta`
- `/centres-de-formation/academy`, `/centres-de-formation/academy/[id]`
- `/centres-de-formation/paiement/*` (5 pages)
- `/centres-de-formation/attente-validation`, `/centres-de-formation/attente-paiement`, `/centres-de-formation/abonnement-expire`

### Pages Admin (6)
- `/admin`
- `/admin/utilisateurs`
- `/admin/pros` (praticiens/artisans/commercants/centres)
- `/admin/centres`
- `/admin/pass` (gestion abonnements)
- `/admin/blog`

### Pages Utilisateurs PASS (2)
- `/compte` (gestion compte utilisateur)
- `/pass/dashboard` (si abonné PASS)

---

## 4. API ENDPOINTS (64 TOTAL)

### Auth (5)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Demande réinitialisation
- `POST /api/auth/reset-password` - Réinitialisation effective

### Account (8)
- `GET /api/user/account` - Infos compte
- `PATCH /api/user/account` - Mise à jour
- `GET /api/user/appointments` - RDV utilisateur
- `GET /api/user/conversations` - Messagerie
- `GET /api/user/documents` - Documents
- `GET /api/user/notes` - Notes PASS
- `GET /api/user/favorites` - Favoris
- `GET /api/user/practitioners` - Liste praticiens favoris

### Admin (2)
- `GET /api/admin/users` - Liste utilisateurs
- `PATCH /api/admin/users/[id]` - Modifier utilisateur (rôles, status, validation)

### Agenda (5)
- `GET /api/professional/agenda` - Agenda pro
- `POST /api/professional/agenda` - Créer RDV
- `PATCH /api/professional/agenda/[id]` - Modifier RDV
- `DELETE /api/professional/agenda/[id]` - Supprimer RDV
- `PATCH /api/professional/agenda/[id]/status` - Changer statut

### Clients/Patients (8)
- `GET /api/professional/clients` - Liste clients
- `POST /api/professional/clients` - Créer client
- `GET /api/professional/clients/[id]` - Détail client
- `PATCH /api/professional/clients/[id]` - Modifier client
- `DELETE /api/professional/clients/[id]` - Supprimer client
- `GET /api/professional/clients/[id]/consultations` - Consultations
- `POST /api/professional/clients/[id]/consultations` - Créer consultation
- `GET /api/professional/clients/[id]/documents` - Documents client

### Documents (4)
- `GET /api/professional/documents` - Liste
- `POST /api/professional/documents` - Upload
- `DELETE /api/professional/documents/[id]` - Supprimer
- `GET /api/professional/documents/[id]/download` - Télécharger

### Invoices (2)
- `GET /api/professional/invoices` - Liste factures
- `POST /api/professional/invoices` - Créer facture

### Messaging (3)
- `GET /api/professional/messaging` - Conversations
- `POST /api/professional/messaging` - Nouveau message
- `GET /api/professional/messaging/[id]` - Conversation détail

### PASS (6)
- `GET /api/user/pass` - Abonnement PASS
- `PATCH /api/user/pass/toggle-plan` - Changer plan (mensuel/annuel)
- `POST /api/user/pass/increment-month` - Incrémenter mois payés
- `PATCH /api/user/pass/ship-carnet` - Expédier carnet
- `GET /api/user/pass/resources` - Ressources PASS (podcasts/livrets/vidéos)
- `GET /api/user/pass/discounts` - Réductions PASS

### Academy (6)
- `GET /api/professional/academy` - Ressources academy
- `GET /api/professional/academy/[id]` - Détail ressource
- `POST /api/professional/academy` - Créer ressource
- `PATCH /api/professional/academy/[id]` - Modifier ressource
- `DELETE /api/professional/academy/[id]` - Supprimer ressource
- `GET /api/professional/academy/search` - Recherche

### Resources (3)
- `GET /api/professional/resources` - Liste
- `GET /api/professional/resources/[id]` - Détail
- `POST /api/professional/resources` - Créer

### Articles/Blog (1)
- `GET /api/articles` - Liste articles blog

### Payment (1)
- `POST /api/payment/confirm` - Confirmer paiement (Stripe webhook)

### Pre-Accounting (3)
- `GET /api/professional/precompta` - Écritures pré-compta
- `POST /api/professional/precompta` - Créer écriture
- `GET /api/professional/precompta/export` - Export CSV

### Professional Profile (2)
- `GET /api/professional/profile` - Profil pro
- `PATCH /api/professional/profile` - Modifier profil

### Stats (1)
- `GET /api/professional/stats` - Statistiques dashboard

### Health (1)
- `GET /api/health` - Health check

---

## 5. MODÈLES DATABASE (32 PRISMA)

### Users & Auth
- `User` (multi-rôle: FREE_USER, PASS_USER, PRACTITIONER, ARTISAN, COMMERCANT, CENTER, ADMIN)
- `Profile`
- `PassSubscription`

### Professionals
- `PractitionerProfile` (Praticiens)
- `ArtisanProfile` + `ArtisanService`, `ArtisanClient`, `ArtisanOrder`
- `MerchantProfile` + `Product`, `StockMovement`, `MerchantClient`, `MerchantOrder`
- `CenterProfile` + `Formation`, `FormationSession`, `Learner`, `LearnerEnrollment`

### Patients/Clients
- `Client` (pour praticiens)
- `Consultation`
- `Invoice`

### Appointments & Documents
- `Appointment`
- `Document`

### PASS System
- `PassResource` (podcasts, livrets, vidéos mensuels)
- `PassDiscount` (réductions partenaires)

### Communication
- `Conversation`, `ConversationParticipant`, `Message`

### Content
- `Resource` (Academy)
- `Article` (Blog)
- `Note` (notes utilisateur PASS)
- `Favorite`

### Accounting
- `PreComptaEntry` (pré-comptabilité pour tous pros)

---

## 6. POINTS CRITIQUES DÉTECTÉS

### 🔴 P0 - BLOQUANT PRODUCTION

#### 1. PAS DE MIGRATIONS DATABASE
**Localisation**: `prisma/migrations/` (vide, uniquement README.md)
**Impact**: Application ne peut démarrer sur base vierge
**Solution**:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 2. SECRETS EN CLAIR DANS .env
**Localisation**: `.env` ligne 4
**Secret exposé**: `DATABASE_URL="postgresql://spymeo_admin:SpymeoSecure2025!@spymeo-production-db..."`
**Impact**: Password de production potentiellement compromis
**Solution**:
- ROTATION IMMÉDIATE du password RDS via AWS Console
- Vérifier que `.env` est bien dans `.gitignore` (✅ confirmé ligne 24)
- Ne JAMAIS committer `.env`

#### 3. JWT_SECRET PAR DÉFAUT
**Localisation**: `src/lib/jwt.ts` ligne 4
**Valeur**: `'changeme_in_production'`
**Impact**: Tokens JWT prévisibles, sécurité auth compromise
**Solution**:
```bash
openssl rand -base64 32
# Ajouter résultat dans .env comme JWT_SECRET
```

#### 4. MOCK USERS HARDCODÉS
**Localisation**: `src/lib/mockdb/*.ts` (30 fichiers)
**Impact**: Données de test polluent le code, passwords hardcodés (azerty123)
**Solution**:
- Supprimer tous les fichiers `src/lib/mockdb/*`
- Remplacer par requêtes Prisma réelles
- Créer seeds propres dans `prisma/seeds/`

#### 5. RESOURCES COMPONENTS TODO
**Localisation**: `src/components/academy/resources/`
**Fichiers**: FiltersBar.tsx, ResourceCard.tsx, ResourceGrid.tsx, PreviewDrawer.tsx, ShareModal.tsx
**Impact**: Pages Academy incomplètes
**Solution**: Implémenter composants manquants ou retirer routes Academy si non prioritaire

#### 6. STRIPE INCOMPLET
**Localisation**:
- `src/app/payment/*/page.tsx` - commentaires "// TODO: Intégration Stripe"
- `src/app/api/payment/confirm/route.ts` - webhook non validé
**Impact**: Paiements non fonctionnels
**Solution**:
- Compléter intégration Stripe (checkout, webhooks, subscription management)
- Configurer STRIPE_WEBHOOK_SECRET
- Implémenter validation signature webhooks

#### 7. DATABASE_URL DUMMY DANS CI/CD
**Localisation**: `.github/workflows/ci.yml` ligne 73
**Valeur**: `postgresql://user:pass@localhost:5432/test`
**Impact**: CI peut échouer sur validation Prisma
**Solution**: Utiliser GitHub Service PostgreSQL ou désactiver `prisma validate` en CI

---

### 🟠 P1 - IMPORTANT

#### 1. Middleware Auth Incomplet
**Localisation**: `src/middleware.ts`
**Problème**: Protection des routes `/api/*` incomplète, uniquement pages protégées
**Solution**: Étendre middleware pour protéger TOUTES les routes API sensibles

#### 2. Error Handling Inconsistant
**Problème**: Pas de try/catch global, certaines API retournent 200 avec {error:...}
**Solution**: Standardiser codes HTTP (4xx/5xx), créer error boundary global

#### 3. Session Normalization
**Problème**: Rôle "COMMERÇANT" vs "COMMERCANT" inconsistance
**Localisation**: `src/lib/auth/session.ts`
**Solution**: Normaliser partout avec enum Prisma `COMMERCANT`

#### 4. Email Service Non Validé
**Localisation**: `src/lib/email.ts`
**Problème**: Service Nodemailer configuré mais non testé
**Solution**: Tester envoi emails (inscription, reset password, notifications admin)

#### 5. TypeScript Strict Mode Désactivé
**Localisation**: `tsconfig.json` - `"strict": false`
**Impact**: Erreurs TypeScript potentielles non détectées
**Solution**: Activer progressivement strict mode (strictNullChecks, strictFunctionTypes, etc.)

#### 6. Placeholder Components
**Localisation**: `src/components/pro/Placeholder.tsx`
**Impact**: UX dégradée, composants temporaires en production
**Solution**: Remplacer par composants réels ou empty states propres

#### 7. Mock Data Partout
**Localisation**: `src/lib/mockdb/` (30 fichiers)
**Solution**: Migration complète vers Prisma (déjà en P0)

#### 8. URLs Unsplash Hardcodées
**Localisation**: Multiple fichiers (images de démo)
**Solution**: Remplacer par assets locaux ou S3, optimiser images

#### 9. ESLint Loose Config
**Localisation**: `package.json` - `"lint": "next lint --max-warnings=999"`
**Solution**: Réduire progressivement à 0, corriger warnings

---

### 🟡 P2 - AMÉLIORATION

1. **No robots.txt / sitemap.xml** - SEO incomplet
2. **No rate limiting** - Vulnérable aux abus API
3. **No CSRF protection** - Attaques CSRF possibles
4. **Images non optimizées** - Performances dégradées
5. **Bundle non analysé** - Code-splitting potentiel
6. **Accessibilité** - ARIA manquant sur formulaires
7. **Monitoring** - Sentry configuré mais non testé
8. **Tests E2E** - Playwright installé mais 0 tests

---

## 7. SERVICES & ADAPTERS IDENTIFIÉS

### Email Service
**Fichier**: `src/lib/email.ts`
**Provider**: Nodemailer 7.0.9
**Config**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
**Status**: ⚠️ Configuré mais non testé

### Storage Service
**Fichier**: `src/lib/storage.ts` (probable)
**Provider**: AWS S3 (@aws-sdk/client-s3)
**Config**: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME
**Status**: ⚠️ Adapter présent, uploads non validés

### Payment Service
**Fichier**: `src/lib/stripe.ts` (probable)
**Provider**: Stripe (non installé dans dependencies!)
**Config**: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
**Status**: ❌ Incomplet, dépendance manquante

### Analytics
**Status**: ❌ Non implémenté (pas de Google Analytics, Plausible, etc.)

---

## 8. CONFIGURATION AWS & CI/CD

### Infrastructure AWS
**Fichier**: `terraform/main.tf`
**Composants**:
- ECS (Elastic Container Service) - Hébergement conteneurs
- ECR (Elastic Container Registry) - Registry Docker
- RDS PostgreSQL 15+ (eu-west-3) - Database
- S3 - Stockage assets
- VPC - Réseau isolé

**Status**: ✅ Infrastructure définie, besoin validation déploiement

### CI/CD GitHub Actions
**Fichier**: `.github/workflows/ci.yml`
**Pipeline**:
1. Checkout code
2. Setup Node 20
3. Install dependencies
4. Lint (loose config)
5. Build Next.js
6. Run Playwright tests (si présents)

**Problèmes détectés**:
- DATABASE_URL dummy (ligne 73)
- Pas de validation Prisma migrations
- Pas de scan secrets (git-secrets, trufflehog)

### Docker
**Fichier**: `Dockerfile` (multi-stage build)
**Étapes**: build → prune devDependencies → production runtime
**Status**: ✅ Optimisé, utilise standalone Next.js

---

## 9. FICHIERS ENVIRONNEMENT

### .env (PRODUCTION - NON COMMITTER)
**Status**: ⚠️ Contient secrets réels (password DB exposé)
**Action**: ROTATION + vérifier .gitignore

### .env.example (TEMPLATE)
**Status**: ✅ Complet, toutes les variables documentées
**Variables**: DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET, AWS_*, SMTP_*, STRIPE_*, ADMIN_EMAIL, FEATURE_FLAGS

---

## 10. SCRIPTS NPM DISPONIBLES

### Actuels
```json
{
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "next lint --max-warnings=999"
}
```

### Manquants (À CRÉER)
```json
{
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "db:migrate": "prisma migrate dev",
  "db:migrate:deploy": "prisma migrate deploy",
  "db:seed:min": "tsx prisma/seeds/minimal.ts",
  "db:reset:local": "prisma migrate reset --force",
  "db:generate": "prisma generate",
  "links:check": "tsx scripts/check-links.ts",
  "a11y:check": "tsx scripts/check-a11y.ts",
  "lighthouse:local": "lhci autorun",
  "analyze": "ANALYZE=true next build"
}
```

---

## 11. PAGES/ROUTES MANQUANTES DÉTECTÉES

### Référencées mais Inexistantes
1. `/politique-de-confidentialite` - Lien footer
2. `/conditions-generales` - Lien footer
3. `/mentions-legales` - Lien footer
4. `/accessibilite` - Lien footer (a11y statement)
5. `/aide` - Menu principal
6. `/contact` - Menu principal

### Solutions
- Créer pages légales (RGPD obligatoire)
- Créer page contact (formulaire)
- Créer page aide/FAQ

---

## 12. IMPORTS CASSÉS POTENTIELS

**Méthode**: Grep TODO/FIXME/MOCK a identifié 30+ fichiers avec warnings développeur.

**Fichiers critiques à vérifier**:
- `src/components/academy/resources/*.tsx` - Composants non implémentés
- `src/lib/mockdb/*.ts` - À supprimer entièrement

**Solution**: Build TypeScript (`npm run build`) révélera imports cassés.

---

## 13. DONNÉES DE TEST HARDCODÉES

### Mock Users
**Localisation**: `src/lib/auth/users.ts` (probable)
**Contenu**: Comptes test avec passwords (azerty123)
**Action**: SUPPRIMER

### Mock Database (30 fichiers)
**Localisation**: `src/lib/mockdb/`
**Fichiers**:
- appointments.ts, clients-artisan.ts, clients-commercant.ts
- documents.ts, messages.ts, orders-artisan.ts, orders-commercant.ts
- pass.ts, precompta-artisan.ts, precompta-commercant.ts
- products-commercant.ts, resources.ts, services-artisan.ts
- stats-artisan.ts, stats-commercant.ts, stock-commercant.ts
- user-favorites.ts, user-practitioners.ts
- + 12 autres

**Action**:
1. Créer migrations Prisma
2. Créer seeds minimaux RÉELS (pas de users test)
3. Supprimer tous fichiers mockdb
4. Remplacer imports par Prisma queries

---

## 14. SEO & ASSETS

### Sitemap
**Status**: ❌ Absent (`/sitemap.xml`)
**Solution**: Générer dynamiquement avec Next.js (app/sitemap.ts)

### Robots.txt
**Status**: ❌ Absent (`/robots.txt`)
**Solution**: Créer `public/robots.txt` ou `app/robots.ts`

### Metadata
**Status**: ⚠️ Partiel (certaines pages ont metadata, d'autres non)
**Solution**: Audit complet, titles/descriptions uniques par page

### Open Graph / Twitter Cards
**Status**: ⚠️ Incomplet
**Solution**: Ajouter OG/Twitter meta tags sur toutes pages publiques

### JSON-LD
**Status**: ❌ Absent
**Solution**: Implémenter Organization, Breadcrumb, Article schemas

### Images
**Localisation**: `public/` + URLs Unsplash externes
**Problèmes**: Pas d'optimisation, formats non modernes (WebP/AVIF)
**Solution**: Next.js Image component + assets locaux optimisés

---

## 15. ACCESSIBILITÉ (A11Y)

### ARIA
**Status**: ⚠️ Incomplet
**Problèmes détectés** (à valider):
- Formulaires sans labels explicites
- Boutons sans aria-label (icônes)
- Navigation sans landmark roles
- Modals sans focus trap

### Focus Management
**Status**: ⚠️ À vérifier (modals, drawers, menus mobiles)

### Contrastes Couleurs
**Status**: ⚠️ À valider avec WCAG AA minimum

### Keyboard Navigation
**Status**: ⚠️ À tester (tous interactifs accessibles au clavier)

---

## 16. PERFORMANCES

### Bundle Size
**Status**: ❌ Non analysé
**Solution**: `ANALYZE=true next build` avec @next/bundle-analyzer

### Code Splitting
**Status**: ⚠️ Par défaut Next.js, à optimiser (dynamic imports)

### Images
**Status**: ❌ Non optimisées (Unsplash externe, pas de lazy loading systématique)

### Fonts
**Status**: ⚠️ À vérifier (utiliser next/font)

### Core Web Vitals
**Status**: ❌ Non mesurés
**Solution**: Lighthouse CI, Web Vitals monitoring

---

## 17. SÉCURITÉ

### Headers HTTP
**Localisation**: `next.config.mjs` (probable)
**Manquants**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
**Solution**: Configurer dans next.config.mjs headers

### Cookies
**Status**: ⚠️ À vérifier (Secure, HttpOnly, SameSite)

### Rate Limiting
**Status**: ❌ Absent
**Solution**: Implémenter middleware rate-limit (upstash/ratelimit ou express-rate-limit)

### CSRF Protection
**Status**: ❌ Absent
**Solution**: Tokens CSRF pour mutations (POST/PATCH/DELETE)

### Input Sanitization
**Status**: ⚠️ Partiel (Zod validation présent, mais XSS/SQLi check incomplet)

### Secret Scanning
**Status**: ❌ Pas de pre-commit hook
**Solution**: git-secrets ou Husky + trufflehog

---

## 18. TESTING

### Unit Tests
**Status**: ❌ Absents (pas de Jest/Vitest configuré)

### Integration Tests
**Status**: ❌ Absents

### E2E Tests
**Framework**: Playwright 1.56.0 installé
**Status**: ❌ 0 tests écrits
**Solution**: Créer tests critiques (signup, login, booking, payment)

---

## 19. FEATURE FLAGS

**Localisation**: `.env.example` lignes 76-78
**Flags**:
- `ENABLE_PASS="true"` - Activer abonnements PASS
- `ENABLE_ACADEMY="true"` - Activer Academy
- `ENABLE_BLOG="true"` - Activer Blog

**Status**: ✅ Définis mais pas forcément utilisés dans le code
**Solution**: Vérifier implémentation conditionnelle dans composants

---

## 20. ADMIN REQUIREMENTS (MISSION SPÉCIALE)

### Compte Admin Principal
**Email requis**: `cindy-dorbane@spymeo.fr`
**Rôle**: `ADMIN`
**Création**: Via migration seed sécurisée (pas de password en clair)

### Promotion ADMIN @spymeo.fr
**Règle**: Tout compte email `*@spymeo.fr` peut être promu ADMIN via panneau Admin
**Protection**: Double confirmation requise
**Implémentation**: À créer dans `/admin/utilisateurs`

---

## 21. TIMELINE ESTIMÉE

### Phase 1 - Semaine 1 (P0 Bloquants)
- [ ] Créer migrations Prisma (`npx prisma migrate dev --name init`)
- [ ] Générer JWT_SECRET sécurisé (`openssl rand -base64 32`)
- [ ] ROTATION password DB RDS (AWS Console)
- [ ] Supprimer mock database, implémenter Prisma queries
- [ ] Créer seeds minimaux (rôles, flags, admin cindy-dorbane@spymeo.fr)
- [ ] Compléter intégration Stripe (checkout + webhooks)
- [ ] Implémenter composants Academy Resources ou retirer routes

### Phase 2 - Semaine 2 (P1 Important + Mobile-First)
- [ ] Étendre middleware auth (protéger API routes)
- [ ] Standardiser error handling (codes HTTP, global boundary)
- [ ] Normaliser rôle COMMERÇANT/COMMERCANT
- [ ] Tester service email (Nodemailer)
- [ ] Établir baseline mobile-first (grilles Tailwind, breakpoints)
- [ ] Créer pages légales manquantes (RGPD, CGU, mentions)
- [ ] Implémenter RBAC complet (gardes routes/pages/actions)
- [ ] Créer panneau Admin promotion @spymeo.fr

### Phase 3 - Semaine 3 (Security, SEO, Perf)
- [ ] Configurer headers sécurité (CSP, HSTS, etc.)
- [ ] Implémenter rate-limiting auth endpoints
- [ ] CSRF tokens
- [ ] Générer sitemap.xml + robots.txt
- [ ] Metadata SEO complètes (titles/descriptions/OG/JSON-LD)
- [ ] Optimiser images (WebP, lazy loading, Next.js Image)
- [ ] Analyser bundle, code-split Academy/Blog
- [ ] Tests E2E Playwright (signup, login, booking, payment)

### Phase 4 - Semaine 4 (QA, Documentation, Handover)
- [ ] Audit accessibilité (ARIA, focus, contrastes)
- [ ] TypeScript strict mode progressif
- [ ] Performance tuning (Core Web Vitals)
- [ ] Créer scripts QA (links:check, a11y:check, lighthouse)
- [ ] Générer rapports (LINKS_REPORT, A11Y_REPORT, LIGHTHOUSE_REPORT)
- [ ] Documentation complète (READY_TO_USE, API_README, CHANGELOG)
- [ ] Tests déploiement AWS (ECS/ECR/RDS)

---

## 22. DÉCISIONS STANDARDS INDUSTRIE

### Database
**Choix**: Prisma ORM (moderne, type-safe, migrations robustes)
**Justification**: Déjà utilisé, excellent DX, intégration TypeScript

### Auth
**Choix**: JWT + Bcrypt (session-less)
**Justification**: Scalable, stateless, adapté architecture distribuée AWS ECS

### Validation
**Choix**: Zod
**Justification**: Type-safe, runtime + compile-time, intégration Next.js

### Email
**Choix**: Nodemailer + SMTP
**Justification**: Flexibilité provider (Brevo, SendGrid, AWS SES), fallback facile

### Storage
**Choix**: AWS S3
**Justification**: Déjà infrastructure AWS, scalable, CDN intégrable (CloudFront)

### Payment
**Choix**: Stripe
**Justification**: Standard industrie, webhooks robustes, gestion abonnements

### Mobile-First
**Choix**: Tailwind CSS responsive utilities
**Justification**: sm:, md:, lg: breakpoints, design tokens cohérents

### Error Handling
**Choix**: Standardisation codes HTTP + error boundaries React
**Justification**: RESTful best practices, UX clarté erreurs

### CI/CD
**Choix**: GitHub Actions (existant)
**Justification**: Intégration native GitHub, workflows YAML lisibles

---

## 23. PRIORISATION CORRECTIONS

### P0 (BLOQUANT) - Semaine 1
1. Migrations Prisma
2. JWT_SECRET rotation
3. DB password rotation
4. Supprimer mocks → Prisma
5. Stripe complet
6. Resources components

### P1 (IMPORTANT) - Semaines 2-3
1. Auth middleware complet
2. Error handling standard
3. RBAC + Admin panel @spymeo.fr
4. Mobile-first baseline
5. Pages manquantes (légales)
6. Email service validation
7. Security headers
8. Rate limiting

### P2 (AMÉLIORATION) - Semaine 3-4
1. SEO complet (sitemap, metadata, JSON-LD)
2. Accessibilité (ARIA, focus, contrastes)
3. Performances (images, bundle, Core Web Vitals)
4. TypeScript strict mode
5. Tests E2E Playwright

### P3 (NICE-TO-HAVE) - Post-MVP
1. Monitoring Sentry validation
2. Analytics integration
3. Unit tests
4. Pre-commit hooks (secret scan)

---

## 24. FICHIERS ESSENTIELS (CHECKLIST)

### Configuration
- [x] `package.json` - Dépendances OK
- [x] `next.config.mjs` - Config OK (à enrichir headers)
- [x] `tsconfig.json` - OK (strict: false à corriger)
- [x] `prisma/schema.prisma` - Complet
- [ ] `prisma/migrations/` - VIDE (P0)
- [x] `.env.example` - Complet
- [⚠️] `.env` - Secrets exposés (P0)
- [x] `.gitignore` - OK (.env ignoré)

### Infrastructure
- [x] `Dockerfile` - Multi-stage OK
- [x] `docker/entrypoint.sh` - OK
- [x] `terraform/main.tf` - Infrastructure définie
- [x] `.github/workflows/ci.yml` - OK (DATABASE_URL à corriger)

### Code
- [x] `src/app/` - Pages & API routes
- [x] `src/components/` - Composants
- [⚠️] `src/lib/` - Utils OK, mockdb à supprimer
- [x] `src/middleware.ts` - Middleware auth (à étendre)

### Documentation
- [x] `README.md` - Existant
- [x] `SECURITY.md` - Existant
- [ ] `READY_TO_USE.md` - À créer
- [ ] `API_README.md` - À créer
- [ ] `CHANGELOG.md` - À créer
- [ ] `MIGRATION_NOTES.md` - À créer

---

## 25. NEXT STEPS (EXÉCUTION AUTONOME)

1. ✅ **Discovery COMPLETED** (ce rapport)
2. ⏭️ **Créer PLAN_EXECUTION.md** (plan détaillé phase par phase)
3. ⏭️ **Créer DECISIONS_LOG.md** (documenter choix techniques)
4. ⏭️ **Corriger P0** (migrations, secrets, mocks, Stripe)
5. ⏭️ **Corriger P1** (auth, RBAC, mobile-first, pages manquantes)
6. ⏭️ **Corriger P2** (SEO, a11y, perf)
7. ⏭️ **QA & Reports** (links, a11y, lighthouse)
8. ⏭️ **Documentation** (READY_TO_USE, API_README, CHANGELOG)
9. ⏭️ **Handover** (livraison complète prod-ready)

---

**FIN DU RAPPORT DISCOVERY**

**Date**: 2025-10-21
**Auteur**: Claude Code (Autonomous Rebuild Agent)
**Status**: ✅ DISCOVERY PHASE COMPLETED
**Prochaine étape**: Créer PLAN_EXECUTION.md et DECISIONS_LOG.md, puis lancer corrections P0
