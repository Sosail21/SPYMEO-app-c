# 🌟 SPYMEO V1 - Plateforme Santé & Bien-être

> Cdw-Spm: Écosystème digital connectant praticiens, artisans, commerçants et utilisateurs autour du bien-être.

[![CI/CD](https://github.com/spymeo/spymeo/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/spymeo/spymeo/actions)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

## 📋 Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Documentation](#documentation)

## 🎯 Présentation

**SPYMEO** est une plateforme complète dédiée au bien-être et à la santé holistique, réunissant :

### 👥 Acteurs

- **Praticiens** : Naturopathes, sophrologues, etc.
- **Artisans** : Bien-être artisanal (savons, huiles essentielles, etc.)
- **Commerçants** : Épiceries bio, boutiques santé
- **Centres de formation** : Formations aux métiers du bien-être
- **Utilisateurs** : Free (gratuit) & PASS (premium)

### ✨ Modules principaux

1. **Espace PRO** : Dashboard métier (agenda, clients, précompta, stats)
2. **SPYMEO PASS** : Abonnement premium (ressources mensuelles, remises partenaires, carnet de vie)
3. **SPYMEO Start** : Programme d'accompagnement personnalisé
4. **SPYMEO Web** : Site vitrine pour professionnels
5. **Spym'Blog** : Articles santé & bien-être
6. **Académie** : Ressources et formations en ligne
7. **Messagerie** : Communication praticien/client
8. **Recherche** : Annuaire des professionnels et produits

## 🚀 Fonctionnalités

### Pour les Membres PRO

- ✅ Fiche publique personnalisée (slug unique)
- ✅ Gestion agenda (Doctolib-like)
- ✅ Fiches clients / patients
- ✅ Téléconsultation & prise de notes
- ✅ Gestion documentaire (ordonnances, conseils)
- ✅ Précomptabilité (encaissements, exports CSV)
- ✅ Statistiques (CA, panier moyen, top produits/services)
- ✅ Catalogue produits/services
- ✅ Cabinet partagé (annonces, échanges entre praticiens)
- ✅ Proposition d'articles Spym'Blog

### Pour les Utilisateurs PASS

- ✅ Carnet de santé digital
- ✅ Ressources mensuelles (podcast, livret, vidéo)
- ✅ Remises partenaires (10-15%)
- ✅ Carnet de vie physique (après 6 mois ou immédiat en annuel)
- ✅ Historique rendez-vous
- ✅ Favoris & praticiens suivis
- ✅ Messagerie sécurisée
- ✅ Documents personnels

### Administration

- ✅ Gestion utilisateurs & rôles (RBAC)
- ✅ Modération articles blog
- ✅ Validation profils professionnels
- ✅ Gestion PASS (abonnements, carnets)
- ✅ Analytics & monitoring

## 🛠️ Stack Technique

### Frontend

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript (strict mode)
- **Styling** : Tailwind CSS + shadcn/ui
- **State Management** : React Hooks
- **Forms** : React Hook Form + Zod
- **Calendar** : FullCalendar
- **Charts** : Recharts

### Backend

- **Runtime** : Node.js 20+
- **API** : Next.js API Routes
- **Authentication** : NextAuth.js
- **ORM** : Prisma
- **Database** : PostgreSQL 15+
- **Storage** : AWS S3
- **Emails** : AWS SES

### Infrastructure

- **Cloud** : AWS (eu-west-3 Paris)
- **Container** : Docker + ECS Fargate
- **Database** : RDS PostgreSQL (Multi-AZ)
- **CDN** : CloudFront
- **Storage** : S3 (encrypted)
- **Load Balancer** : ALB (Application Load Balancer)
- **IaC** : Terraform
- **CI/CD** : GitHub Actions

### DevOps & Qualité

- **CI/CD** : GitHub Actions
- **Tests unitaires** : Jest
- **Tests e2e** : Playwright
- **Linting** : ESLint
- **Type checking** : TypeScript
- **Security** : Snyk, npm audit
- **Monitoring** : CloudWatch
- **Alerting** : SNS + Email

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                         │
│              SSL/TLS + WAF + Cache                          │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
         ┌─────▼──────┐              ┌────────▼────────┐
         │    ALB     │              │   S3 Bucket     │
         │  (HTTPS)   │              │   (Assets)      │
         └─────┬──────┘              └─────────────────┘
               │
         ┌─────▼───────────────────────────────┐
         │     ECS Fargate (Auto-scaling)      │
         │  ┌──────┐  ┌──────┐  ┌──────┐      │
         │  │ App  │  │ App  │  │ App  │      │
         │  │ Task │  │ Task │  │ Task │      │
         │  └──────┘  └──────┘  └──────┘      │
         └─────┬───────────────────────────────┘
               │
         ┌─────▼─────────────────────────┐
         │  RDS PostgreSQL (Multi-AZ)    │
         │  - Encrypted                  │
         │  - Automated backups          │
         └───────────────────────────────┘
```

## 🚀 Installation

### Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15.0 (local ou Docker)
- Git

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/spymeo/spymeo.git
cd spymeo

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 4. Initialiser la base de données
npx prisma generate
npx prisma migrate dev

# 5. (Optionnel) Seed avec des données de test
npx prisma db seed

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 💻 Développement

### Scripts disponibles

```bash
# Développement
npm run dev          # Lance Next.js en mode dev
npm run dev:turbo    # Lance avec Turbopack (expérimental)

# Build
npm run build        # Build production
npm start            # Lance le build en production

# Quality
npm run lint         # ESLint
npm run lint:fix     # ESLint avec auto-fix
npm run type-check   # TypeScript check
npm test             # Tests unitaires
npm run test:e2e     # Tests e2e Playwright
npm run test:watch   # Tests en mode watch

# Database
npx prisma studio    # Interface graphique DB
npx prisma migrate dev    # Créer migration
npx prisma migrate deploy # Appliquer migrations
npx prisma generate  # Générer client Prisma

# Docker
docker build -t spymeo .
docker run -p 3000:3000 spymeo
```

### Structure du projet

```
spymeo/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── prisma/
│   └── schema.prisma       # Schéma base de données
├── public/                 # Assets statiques
├── src/
│   ├── app/                # Pages & API Routes (App Router)
│   │   ├── api/           # API endpoints
│   │   ├── pro/           # Espace PRO
│   │   ├── user/          # Espace utilisateur
│   │   ├── admin/         # Administration
│   │   └── layout.tsx     # Layout racine
│   ├── components/        # Composants React
│   ├── lib/               # Utilitaires & helpers
│   │   ├── auth/         # Authentification
│   │   ├── db/           # Database helpers
│   │   └── mockdb/       # Données mock
│   └── middleware.ts      # Middleware Next.js (RBAC)
├── terraform/             # Infrastructure as Code
├── scripts/               # Scripts utilitaires
├── Dockerfile            # Image Docker production
├── next.config.mjs       # Configuration Next.js
├── tailwind.config.ts    # Configuration Tailwind
├── tsconfig.json         # Configuration TypeScript
└── package.json          # Dépendances npm
```

### Variables d'environnement

Créer un fichier `.env.local` :

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/spymeo"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AWS (production)
AWS_REGION="eu-west-3"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET_NAME="spymeo-assets"

# Email (AWS SES)
EMAIL_FROM="noreply@spymeo.com"
EMAIL_REPLY_TO="contact@spymeo.com"

# Stripe (paiements)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Monitoring
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."

# Feature flags
ENABLE_PASS=true
ENABLE_ACADEMY=true
```

## 🌍 Déploiement

### Production

Le déploiement en production est automatisé via GitHub Actions sur chaque push sur `main`.

#### Prérequis

1. **AWS** : Compte AWS configuré avec Terraform
2. **GitHub Secrets** :
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `SLACK_WEBHOOK_URL` (optionnel)

#### Workflow

```bash
# 1. Créer l'infrastructure avec Terraform
cd terraform
terraform init
terraform plan
terraform apply

# 2. Build & Push Docker image (automatique via CI/CD)
# Déclenché automatiquement sur push main

# 3. Deploy sur ECS (automatique via CI/CD)
# ECS update-service force-new-deployment

# 4. Smoke tests
curl https://spymeo.com/api/health
```

### Staging

```bash
git push origin develop
# Déploiement automatique sur staging.spymeo.com
```

## 🔒 Sécurité

### Conformité HDS-like

- ✅ **Chiffrement at-rest** : RDS + S3 chiffrés (AWS KMS)
- ✅ **Chiffrement in-transit** : HTTPS obligatoire (TLS 1.2+)
- ✅ **Backups automatiques** : RDS (30 jours), snapshots ECS
- ✅ **Logs centralisés** : CloudWatch (rétention 365j production)
- ✅ **Monitoring** : CloudWatch Alarms + SNS
- ✅ **RBAC** : Middleware Next.js + Prisma Row-Level Security
- ✅ **Secrets** : AWS Secrets Manager
- ✅ **Security Headers** : CSP, HSTS, X-Frame-Options, etc.
- ✅ **Audits** : Snyk, npm audit

### RBAC (Contrôle d'accès)

Rôles définis:
- `FREE_USER` : Utilisateur gratuit
- `PASS_USER` : Abonné PASS
- `PRACTITIONER` : Praticien
- `ARTISAN` : Artisan
- `COMMERCANT` : Commerçant
- `CENTER` : Centre de formation
- `ADMIN` : Administrateur

Protection des routes via `src/middleware.ts`.

### Headers de sécurité

Configurés dans `next.config.mjs`:
- `Strict-Transport-Security`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection`
- `Referrer-Policy`

## 🧪 Tests

### Tests unitaires

```bash
npm test                 # Lance Jest
npm run test:watch       # Mode watch
npm run test:coverage    # Avec couverture
```

Objectif: **≥70% coverage**

### Tests e2e (Playwright)

```bash
npm run test:e2e         # Lance Playwright
npm run test:e2e:ui      # Interface UI
npm run test:e2e:debug   # Mode debug
```

Parcours testés:
- ✅ Inscription utilisateur
- ✅ Connexion / Déconnexion
- ✅ Profil professionnel
- ✅ Prise de rendez-vous
- ✅ Souscription PASS
- ✅ Admin : modération blog

## 📚 Documentation

- **Architecture** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API** : [docs/API.md](docs/API.md)
- **Terraform** : [terraform/README.md](terraform/README.md)
- **Sécurité** : [docs/SECURITY.md](docs/SECURITY.md)
- **Runbook Ops** : [docs/RUNBOOK.md](docs/RUNBOOK.md)

## 🤝 Contribution

Ce projet est actuellement privé. Pour contribuer:

1. Créer une branche depuis `develop`
2. Respecter les conventions de nommage :
   - `feat/nom-feature`
   - `fix/nom-bug`
   - `chore/nom-tache`
3. Commit messages : [Conventional Commits](https://www.conventionalcommits.org/)
4. Créer une Pull Request vers `develop`
5. Attendre la review + CI/CD ✅

## 📝 Licence

© 2025 SPYMEO - Tous droits réservés
Code propriétaire - Reproduction interdite

## 👨‍💻 Équipe

- **Fondatrice & CEO** : Cindy Dorbane
- **Site** : https://spymeo.fr

## 📞 Support

- 📧 Email : tech@spymeo.com
- 📱 Slack : #tech-spymeo
- 🐛 Issues : https://github.com/spymeo/spymeo/issues

---

**Made with ❤️ by SPYMEO Team**
