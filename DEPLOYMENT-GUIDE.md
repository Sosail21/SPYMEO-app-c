# 🚀 Guide de Déploiement SPYMEO - Production Ready

Ce guide vous accompagne pour déployer SPYMEO en production avec toutes les fonctionnalités intégrées.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
3. [Variables d'Environnement](#variables-denvironnement)
4. [Services Tiers](#services-tiers)
5. [Déploiement sur Vercel](#déploiement-sur-vercel)
6. [Tests Avant Lancement](#tests-avant-lancement)
7. [Monitoring et Maintenance](#monitoring-et-maintenance)
8. [Checklist de Déploiement](#checklist-de-déploiement)

---

## ✅ Prérequis

### Services Requis

- [ ] Compte **Vercel** (pour l'hébergement Next.js)
- [ ] Base de données **PostgreSQL** (Vercel Postgres, Supabase, ou Neon)
- [ ] Compte **Stripe** (paiements PASS)
- [ ] Compte **Cloudinary** (stockage fichiers)
- [ ] Compte **Resend** (emails transactionnels)
- [ ] Domaine configuré (ex: spymeo.fr)

### Outils Locaux

```bash
node --version  # v18+ requis
npm --version   # v9+ requis
git --version
```

---

## 🗄️ Configuration de la Base de Données

### Option 1 : Vercel Postgres (Recommandé)

1. **Créer une base de données Vercel Postgres**
   - Dashboard Vercel → Storage → Create Database → Postgres
   - Copier `POSTGRES_PRISMA_URL` et `POSTGRES_URL_NON_POOLING`

2. **Configurer Prisma**
   ```bash
   # .env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Appliquer les migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate deploy
   ```

### Option 2 : Supabase

1. **Créer un projet Supabase**
   - supabase.com → New Project
   - Copier la connexion string (Pooler en mode Transaction)

2. **Configurer et migrer**
   ```bash
   DATABASE_URL="postgresql://[user]:[password]@[host]:5432/postgres?pgbouncer=true"
   npm run prisma:migrate deploy
   ```

### Option 3 : Neon

1. **Créer une base Neon**
   - neon.tech → New Project
   - Copier la connexion string

2. **Configurer et migrer**
   ```bash
   DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]"
   npm run prisma:migrate deploy
   ```

### Seeding (Optionnel - Développement)

```bash
# Peupler avec des données de test
npx ts-node prisma/seed-clients.ts
```

---

## 🔐 Variables d'Environnement

### Créer `.env.production`

```env
# ===========================
# APPLICATION
# ===========================
NEXT_PUBLIC_APP_URL=https://spymeo.fr
NEXT_PUBLIC_APP_NAME=SPYMEO
NODE_ENV=production

# ===========================
# DATABASE
# ===========================
DATABASE_URL="postgresql://user:password@host:5432/spymeo_prod"

# ===========================
# AUTHENTICATION (NextAuth.js)
# ===========================
NEXTAUTH_URL=https://spymeo.fr
NEXTAUTH_SECRET=YOUR_SUPER_SECRET_KEY_HERE_MIN_32_CHARS

# Générer avec: openssl rand -base64 32

# ===========================
# STRIPE
# ===========================
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Products IDs (après création via script)
STRIPE_PRODUCT_PASS_MONTHLY=prod_xxxxxxxxxxxxx
STRIPE_PRODUCT_PASS_ANNUAL=prod_xxxxxxxxxxxxx
STRIPE_PRICE_PASS_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PASS_ANNUAL=price_xxxxxxxxxxxxx

# ===========================
# CLOUDINARY
# ===========================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxx

# ===========================
# RESEND (Emails)
# ===========================
RESEND_API_KEY=re_xxxxxxxxxxxxx

# ===========================
# OPTIONAL
# ===========================
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxxx

# Algolia Search (future)
NEXT_PUBLIC_ALGOLIA_APP_ID=xxxxxxxxxxxxx
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=xxxxxxxxxxxxx
ALGOLIA_ADMIN_KEY=xxxxxxxxxxxxx
```

### Sécuriser les Variables

⚠️ **JAMAIS** commiter `.env*` dans Git !

```bash
# Vérifier .gitignore
cat .gitignore | grep .env

# Doit contenir:
.env
.env.local
.env.production
.env*.local
```

---

## 🔧 Services Tiers

### 1. Stripe (Paiements)

#### A. Configuration du Compte

1. **Activer le mode Live**
   - Dashboard Stripe → Basculer vers "Live mode"

2. **Créer les produits PASS**
   ```bash
   # En local avec clés live
   STRIPE_SECRET_KEY=sk_live_xxx npm run setup-stripe-products
   ```

3. **Configurer les webhooks**
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://spymeo.fr/api/stripe/webhooks`
   - Événements à écouter:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copier le `Signing secret` → `STRIPE_WEBHOOK_SECRET`

#### B. Tester les Webhooks

```bash
# Installation Stripe CLI
brew install stripe/stripe-brew/stripe  # macOS
# ou télécharger: https://stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Tester webhook local
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Simuler événement
stripe trigger checkout.session.completed
```

---

### 2. Cloudinary (Stockage Fichiers)

#### A. Configuration du Compte

1. **Créer un compte** sur cloudinary.com
2. **Copier les credentials** (Dashboard → Settings → Access Keys)
3. **Créer les dossiers** (optionnel, créés automatiquement):
   - `spymeo/avatars/`
   - `spymeo/documents/`
   - `spymeo/receipts/`
   - `spymeo/products/`
   - `spymeo/articles/`

#### B. Configurer Upload Presets (Optionnel)

1. Dashboard → Settings → Upload
2. Add upload preset:
   - **Name**: `spymeo_avatars`
   - **Folder**: `spymeo/avatars`
   - **Transformations**: Face detection, circular crop
   - **Format**: Auto (WebP préféré)

---

### 3. Resend (Emails)

#### A. Configuration du Compte

1. **Créer un compte** sur resend.com
2. **Ajouter et vérifier le domaine**:
   - Dashboard → Domains → Add Domain
   - Domaine: `spymeo.fr`
   - Ajouter les enregistrements DNS (SPF, DKIM)
   - Attendre la vérification (quelques minutes)

3. **Générer une API Key**:
   - Dashboard → API Keys → Create API Key
   - Permissions: "Full Access"
   - Copier → `RESEND_API_KEY`

#### B. Configurer l'Expéditeur

Modifier `src/lib/email/config.ts`:

```typescript
export const EMAIL_CONFIG = {
  from: {
    default: 'SPYMEO <noreply@spymeo.fr>',
    support: 'Support SPYMEO <support@spymeo.fr>',
    noreply: 'SPYMEO <noreply@spymeo.fr>',
  },
  replyTo: 'contact@spymeo.fr',
  // ...
};
```

---

## 🌐 Déploiement sur Vercel

### Étape 1 : Préparer le Dépôt Git

```bash
# S'assurer que tout est commité
git status

# Pousser sur GitHub/GitLab
git remote add origin https://github.com/votre-compte/spymeo.git
git push -u origin main
```

### Étape 2 : Importer sur Vercel

1. **Connecter le dépôt**:
   - vercel.com → New Project → Import Git Repository
   - Sélectionner `spymeo`

2. **Configurer le projet**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Ajouter les variables d'environnement**:
   - Settings → Environment Variables
   - Copier-coller toutes les variables de `.env.production`
   - Scope: Production

4. **Déployer**:
   - Cliquer sur "Deploy"
   - Attendre la fin du build (~3-5 min)

### Étape 3 : Configurer le Domaine

1. **Ajouter le domaine custom**:
   - Settings → Domains → Add Domain
   - Entrer: `spymeo.fr` et `www.spymeo.fr`

2. **Configurer DNS**:
   - Ajouter enregistrement CNAME:
     ```
     www  →  cname.vercel-dns.com
     @    →  76.76.21.21 (A record)
     ```

3. **Activer HTTPS**:
   - Vercel génère automatiquement le certificat SSL (Let's Encrypt)

### Étape 4 : Vérifier la Base de Données

```bash
# Dans le terminal Vercel (Functions → Edge Logs)
# Ou localement avec connexion prod:

DATABASE_URL="postgresql://prod..." npm run prisma:studio

# Vérifier que les tables existent
```

---

## 🧪 Tests Avant Lancement

### Tests Fonctionnels

#### 1. Authentification
- [ ] Inscription avec email/mot de passe
- [ ] Connexion
- [ ] Déconnexion
- [ ] Réinitialisation mot de passe (email envoyé ?)

#### 2. PASS Subscription
- [ ] Accéder à la page `/pass`
- [ ] Cliquer sur "Souscrire" (Monthly ou Annual)
- [ ] Compléter le paiement Stripe (carte test en staging)
- [ ] Vérifier réception email de confirmation
- [ ] Vérifier rôle utilisateur → `PASS_USER`
- [ ] Accéder aux ressources PASS
- [ ] Tester Customer Portal (modifier plan, annuler)

#### 3. Uploads Cloudinary
- [ ] Upload avatar → Preview correct ?
- [ ] Upload document → Accessible dans "Mes documents" ?
- [ ] Upload reçu (praticien) → Stocké correctement ?

#### 4. Emails
- [ ] Welcome email reçu après inscription
- [ ] Email de confirmation rendez-vous
- [ ] Email PASS activé
- [ ] Tester préférences email (`/user/email-preferences`)

#### 5. Module Clients (Praticiens)
- [ ] Se connecter en tant que praticien
- [ ] Créer un client
- [ ] Ajouter une consultation
- [ ] Ajouter un antécédent
- [ ] Rechercher un client
- [ ] Supprimer un client (cascade fonctionne ?)

### Tests de Performance

```bash
# Lighthouse CI (local)
npm install -g @lhci/cli
lhci autorun --collect.url=https://spymeo.fr

# Objectifs:
# - Performance: > 90
# - Accessibilité: > 95
# - Best Practices: > 90
# - SEO: > 90
```

### Tests de Charge

```bash
# Tester avec k6 ou Artillery
npm install -g artillery

# Créer test.yml
artillery run test.yml --target https://spymeo.fr
```

---

## 📊 Monitoring et Maintenance

### 1. Surveillance des Erreurs (Sentry)

```bash
npm install @sentry/nextjs

# Suivre le setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/
```

### 2. Analytics (Google Analytics / Plausible)

```typescript
// src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Monitoring Vercel

- Vercel Dashboard → Analytics
- Vérifier:
  - Temps de réponse
  - Taux d'erreur
  - Bandwidth
  - Edge requests

### 4. Monitoring Stripe

- Dashboard Stripe → Developers → Logs
- Surveiller:
  - Paiements réussis/échoués
  - Webhooks reçus
  - Taux de rétention

### 5. Monitoring Cloudinary

- Dashboard → Media Library → Usage
- Surveiller:
  - Stockage utilisé
  - Bande passante
  - Transformations

### 6. Monitoring Resend

- Dashboard → Logs
- Surveiller:
  - Emails envoyés
  - Taux de délivrabilité
  - Bounces
  - Spam reports

---

## ✅ Checklist de Déploiement

### Pré-Déploiement

- [ ] Toutes les variables d'environnement configurées
- [ ] Base de données créée et migrée
- [ ] Stripe products créés
- [ ] Stripe webhooks configurés
- [ ] Cloudinary configuré
- [ ] Resend domaine vérifié
- [ ] Tests locaux passés
- [ ] Code committé et pushé

### Déploiement

- [ ] Projet importé sur Vercel
- [ ] Build réussi (aucune erreur)
- [ ] Domaine configuré
- [ ] HTTPS actif
- [ ] Variables d'environnement en production

### Post-Déploiement

- [ ] Tester authentification
- [ ] Tester paiement PASS (mode test puis live)
- [ ] Tester uploads
- [ ] Tester envoi emails
- [ ] Tester module Clients
- [ ] Vérifier webhooks Stripe reçus
- [ ] Vérifier analytics
- [ ] Vérifier performance (Lighthouse > 90)

### Maintenance Continue

- [ ] Surveiller logs Vercel (erreurs)
- [ ] Surveiller Sentry (si configuré)
- [ ] Vérifier délivrabilité emails (Resend)
- [ ] Vérifier paiements Stripe
- [ ] Backups base de données (automatiques sur Vercel/Supabase)

---

## 🆘 Dépannage

### Erreur de Build sur Vercel

```
Error: Cannot find module '@prisma/client'
```

**Solution**: Ajouter `postinstall` script dans `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Webhooks Stripe Non Reçus

1. Vérifier URL du webhook: `https://spymeo.fr/api/stripe/webhooks`
2. Vérifier `STRIPE_WEBHOOK_SECRET` correspond au webhook
3. Tester avec Stripe CLI: `stripe listen --forward-to https://spymeo.fr/api/stripe/webhooks`

### Emails Non Envoyés

1. Vérifier domaine Resend vérifié (Dashboard → Domains)
2. Vérifier `RESEND_API_KEY` valide
3. Consulter logs Resend (Dashboard → Logs)
4. Vérifier expéditeur autorisé (`from` dans config)

### Uploads Cloudinary Échouent

1. Vérifier `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`
2. Vérifier `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` correct
3. Tester upload depuis Dashboard Cloudinary
4. Vérifier taille fichier < limite (10MB par défaut)

---

## 📚 Ressources Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Cloudinary](https://cloudinary.com/documentation)
- [Documentation Resend](https://resend.com/docs)
- [Documentation NextAuth.js](https://next-auth.js.org)

---

## 🎉 Félicitations !

SPYMEO est maintenant déployé en production ! 🚀

Pour toute question, consulter la documentation dans `/docs` ou ouvrir une issue sur le dépôt Git.
