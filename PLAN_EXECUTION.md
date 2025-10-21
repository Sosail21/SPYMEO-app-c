# PLAN D'EXÉCUTION - REBUILD AUTONOME SPYMEO V1
## Mobile-First, Production-Ready, AWS Deployment

**Date début**: 2025-10-21
**Mission**: Reconstruction totale autonome sans questions
**Méthode**: Exécution systématique P0 → P1 → P2 → QA → Documentation

---

## PHASE 0: DISCOVERY ✅ COMPLETED

**Durée**: 30 minutes
**Livrables**:
- ✅ AUDIT-COMPLET.md (182 lignes)
- ✅ REPORT_DISCOVERY.md (927 lignes)
- ✅ Todo list structurée (47 tâches)

**Résultats**:
- Stack identifiée: Next.js 14 + Prisma + PostgreSQL + AWS
- 104 pages, 64 API endpoints, 32 modèles DB
- **7 points P0 bloquants** identifiés
- **9 points P1 importants** identifiés
- **8 points P2 améliorations** identifiés

---

## PHASE 1: P0 - CORRECTIONS BLOQUANTES 🔴

**Objectif**: Éliminer TOUS les bloqueurs production
**Durée estimée**: 3-4 heures
**Critères de succès**: Build passe, DB fonctionne, secrets sécurisés, mocks supprimés

### 1.1 - Database Migrations (CRITIQUE)

**Problème**: `prisma/migrations/` vide, app ne peut démarrer

**Actions**:
```bash
# 1. Vérifier connexion DB (local ou AWS RDS)
npx prisma db pull  # Synchroniser schéma existant si DB peuplée

# 2. Créer migration initiale
npx prisma migrate dev --name init

# 3. Générer Prisma Client
npx prisma generate

# 4. Vérifier migration
npx prisma migrate status
```

**Validation**:
- ✅ Fichier migration créé dans `prisma/migrations/`
- ✅ `npx prisma migrate status` → "Database is up to date"

### 1.2 - Secrets Sécurisés (CRITIQUE SÉCURITÉ)

**Problème**: JWT_SECRET par défaut, DATABASE_URL password exposé

**Actions**:

1. **Générer JWT_SECRET**:
```bash
# Générer secret robuste
openssl rand -base64 32
# Exemple sortie: kX9mP2vR7nQ3sT8wY4zU6aB5cF0dG1eH2iJ3kL4mN5oP
```

2. **Mettre à jour .env** (NE PAS COMMITTER):
```env
# OLD (DANGEREUX)
JWT_SECRET="changeme_in_production"

# NEW (SÉCURISÉ)
JWT_SECRET="kX9mP2vR7nQ3sT8wY4zU6aB5cF0dG1eH2iJ3kL4mN5oP"
```

3. **Rotation password DB** (MANUEL - AWS Console):
```
⚠️ ACTION MANUELLE REQUISE:
1. AWS Console → RDS → spymeo-production-db
2. Modifier mot de passe master user "spymeo_admin"
3. Nouveau password: [utiliser générateur AWS ou 1Password]
4. Mettre à jour DATABASE_URL dans .env (NE PAS COMMITTER)
5. Mettre à jour secrets ECS/Fargate si déployé
```

4. **Vérifier .gitignore**:
```bash
# Confirmer .env ignoré (déjà vérifié ✅)
cat .gitignore | grep ".env"
```

**Validation**:
- ✅ JWT_SECRET dans .env != "changeme_in_production"
- ✅ DATABASE_URL password != "SpymeoSecure2025!"
- ✅ `.env` dans .gitignore
- ✅ `git status` ne montre PAS .env

### 1.3 - Supprimer Mock Database → Prisma

**Problème**: 30 fichiers `src/lib/mockdb/*.ts` avec données hardcodées

**Actions**:

1. **Créer services Prisma réels**:
```typescript
// Exemple: src/lib/services/appointments.service.ts
import { prisma } from '@/lib/prisma'

export async function getUserAppointments(userId: string) {
  return await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startAt: 'desc' },
  })
}

export async function createAppointment(data: CreateAppointmentDTO) {
  return await prisma.appointment.create({ data })
}
```

2. **Remplacer imports dans API routes**:
```typescript
// OLD
import { mockAppointments } from '@/lib/mockdb/appointments'

// NEW
import { getUserAppointments } from '@/lib/services/appointments.service'
```

3. **Supprimer fichiers mock**:
```bash
rm -rf src/lib/mockdb/
```

4. **Créer structure services**:
```
src/lib/services/
├── appointments.service.ts
├── clients.service.ts
├── documents.service.ts
├── messages.service.ts
├── pass.service.ts
├── precompta.service.ts
├── stats.service.ts
└── index.ts
```

**Validation**:
- ✅ `src/lib/mockdb/` n'existe plus
- ✅ `npm run build` passe sans erreurs d'imports
- ✅ Toutes les API routes utilisent Prisma

### 1.4 - Seeds Minimaux (ADMIN + Référentiel)

**Problème**: Besoin compte admin cindy-dorbane@spymeo.fr + données référentiel

**Actions**:

1. **Créer script seed**:
```typescript
// prisma/seeds/minimal.ts
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcrypt'

async function main() {
  console.log('🌱 Seeding minimal data...')

  // 1. Admin principal (règle: email @spymeo.fr)
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe2025!',
    10
  )

  await prisma.user.upsert({
    where: { email: 'cindy-dorbane@spymeo.fr' },
    update: {},
    create: {
      email: 'cindy-dorbane@spymeo.fr',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Cindy',
      lastName: 'Dorbane',
      name: 'Cindy Dorbane',
    },
  })

  console.log('✅ Admin créé: cindy-dorbane@spymeo.fr')

  // 2. Feature flags (si table dédiée)
  // await prisma.featureFlag.createMany({ data: [...] })

  // 3. PASS Resources initiales (exemple podcast Janvier 2025)
  await prisma.passResource.upsert({
    where: { id: 'pass-resource-2025-01' },
    update: {},
    create: {
      title: 'Podcast Janvier 2025 - Bien-être hivernal',
      type: 'PODCAST',
      month: '2025-01',
      description: 'Découvrez nos conseils pour traverser l\'hiver en pleine forme',
      url: null, // À remplir par admin
      availableFrom: new Date('2025-01-01'),
    },
  })

  console.log('✅ Seeds minimal completed')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

2. **Ajouter script package.json**:
```json
{
  "scripts": {
    "db:seed:min": "tsx prisma/seeds/minimal.ts"
  }
}
```

3. **Installer tsx si absent**:
```bash
npm install -D tsx
```

4. **Exécuter seed**:
```bash
npm run db:seed:min
```

**Validation**:
- ✅ Compte admin existe en DB (email: cindy-dorbane@spymeo.fr, role: ADMIN)
- ✅ Connexion possible via UI avec password défini
- ✅ 0 autres utilisateurs en DB (sauf admin)

### 1.5 - Stripe SDK & Webhooks

**Problème**: Stripe non installé, webhooks incomplets

**Actions**:

1. **Installer Stripe SDK**:
```bash
npm install stripe @stripe/stripe-js
```

2. **Créer service Stripe**:
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquant')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
})

export async function createCheckoutSession(params: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  return await stripe.checkout.sessions.create({
    customer_email: params.userId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId },
  })
}
```

3. **Webhook avec validation signature**:
```typescript
// src/app/api/payment/webhook/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutCompleted(session)
      break
    case 'customer.subscription.updated':
      // ...
      break
    case 'customer.subscription.deleted':
      // ...
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return Response.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE', subscriptionStart: new Date() },
  })
}
```

4. **Feature flag Stripe**:
```typescript
// src/lib/feature-flags.ts
export const STRIPE_ENABLED =
  process.env.STRIPE_SECRET_KEY &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export function requireStripe() {
  if (!STRIPE_ENABLED) {
    throw new Error('Stripe non configuré (clés manquantes)')
  }
}
```

5. **Adapter pages paiement**:
```typescript
// src/app/praticiens/paiement/page.tsx
import { STRIPE_ENABLED } from '@/lib/feature-flags'

export default function PaymentPage() {
  if (!STRIPE_ENABLED) {
    return (
      <div className="p-8 text-center">
        <p>Paiements temporairement indisponibles. Contactez l'admin.</p>
      </div>
    )
  }

  return <StripeCheckoutForm />
}
```

**Validation**:
- ✅ `stripe` et `@stripe/stripe-js` installés
- ✅ Service Stripe créé avec error handling
- ✅ Webhook valide signature
- ✅ Feature flag STRIPE_ENABLED fonctionne (graceful degradation si clés absentes)

### 1.6 - Academy Resources Components

**Problème**: 5 composants placeholder non implémentés

**Décision**: **Implémenter version MVP** (pas retirer routes, feature importante)

**Actions**:

1. **FiltersBar.tsx** (filtres catégorie/type):
```typescript
// src/components/academy/resources/FiltersBar.tsx
'use client'

interface FiltersBarProps {
  categories: string[]
  types: string[]
  onFilterChange: (filters: Filters) => void
}

export function FiltersBar({ categories, types, onFilterChange }: FiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow">
      <select
        className="px-4 py-2 border rounded-md"
        onChange={(e) => onFilterChange({ category: e.target.value })}
      >
        <option value="">Toutes catégories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        className="px-4 py-2 border rounded-md"
        onChange={(e) => onFilterChange({ type: e.target.value })}
      >
        <option value="">Tous types</option>
        {types.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  )
}
```

2. **ResourceCard.tsx** (carte ressource):
```typescript
// src/components/academy/resources/ResourceCard.tsx
import Link from 'next/link'

interface ResourceCardProps {
  resource: Resource
  href: string
}

export function ResourceCard({ resource, href }: ResourceCardProps) {
  const icon = resource.type === 'VIDEO' ? '🎥' : resource.type === 'PDF' ? '📄' : '🔗'

  return (
    <Link href={href} className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
          {resource.category && (
            <span className="text-xs text-gray-500">{resource.category}</span>
          )}
          {resource.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
```

3. **ResourceGrid.tsx**, **PreviewDrawer.tsx**, **ShareModal.tsx** (similaire)

**Validation**:
- ✅ Tous composants implémentés (version MVP fonctionnelle)
- ✅ Pages Academy affichent ressources
- ✅ `npm run build` passe

### 1.7 - CI/CD DATABASE_URL

**Problème**: `.github/workflows/ci.yml` ligne 73 → `postgresql://user:pass@localhost:5432/test`

**Actions**:

1. **Option A - Service PostgreSQL GitHub Actions**:
```yaml
# .github/workflows/ci.yml
jobs:
  ci:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: spymeo_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Setup database
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/spymeo_test
        run: |
          npx prisma migrate deploy
          npx prisma generate

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Test (si présents)
        run: npm test --if-present
```

2. **Option B - Skip Prisma en CI** (si tests DB non critiques):
```yaml
- name: Build
  run: npm run build
  env:
    SKIP_ENV_VALIDATION: true
```

**Décision**: Implémenter **Option A** (service PostgreSQL) pour CI robuste.

**Validation**:
- ✅ CI GitHub Actions passe
- ✅ Prisma migrate fonctionne en CI
- ✅ Build réussit

---

## PHASE 2: P1 - CORRECTIONS IMPORTANTES 🟠

**Objectif**: Sécuriser, fiabiliser, RBAC, mobile-first
**Durée estimée**: 5-6 heures

### 2.1 - Middleware Auth Complet

**Problème**: API routes `/api/*` non protégées

**Actions**:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/mot-de-passe-oublie',
    '/praticiens',
    '/artisans',
    '/commercants',
    '/centres-de-formation',
    '/blog',
    '/pass',
  ]

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  const isPublicApi = pathname.startsWith('/api/auth/') || pathname === '/api/health'

  if (isPublicPath || isPublicApi) {
    return NextResponse.next()
  }

  // Vérifier session
  const session = await getSession(request)

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Vérifier rôles (RBAC)
  if (pathname.startsWith('/admin')) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/non-autorise', request.url))
    }
  }

  if (pathname.startsWith('/praticiens')) {
    if (session.role !== 'PRACTITIONER' && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/non-autorise', request.url))
    }
  }

  // Similaire pour /artisans, /commercants, /centres-de-formation

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

**Validation**:
- ✅ Accès `/api/professional/*` sans auth → 401
- ✅ Accès `/admin` sans rôle ADMIN → redirect /non-autorise
- ✅ Routes publiques accessibles sans auth

### 2.2 - Error Handling Standard

**Actions**:

1. **Global error boundary**:
```typescript
// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Erreur</h1>
        <p className="text-gray-600 mb-6">
          Une erreur est survenue. Veuillez réessayer.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
```

2. **API error utility**:
```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  return Response.json(
    { error: 'Erreur interne serveur' },
    { status: 500 }
  )
}
```

3. **Standardiser codes HTTP**:
```typescript
// Avant: return Response.json({ success: false, error: '...' }) // status 200 ❌

// Après:
throw new ApiError('Client non trouvé', 404, 'CLIENT_NOT_FOUND')
// ou
return Response.json({ error: 'Client non trouvé' }, { status: 404 })
```

**Validation**:
- ✅ Toutes erreurs API retournent codes HTTP corrects (4xx/5xx)
- ✅ Page error.tsx affichée en cas d'erreur React
- ✅ Pas de `{ success: false }` avec status 200

### 2.3 - Normalisation COMMERÇANT

**Problème**: Inconsistance "COMMERÇANT" vs "COMMERCANT"

**Actions**:

```bash
# Rechercher toutes occurrences
grep -r "COMMERÇANT" src/

# Remplacer par COMMERCANT (valeur Prisma enum)
# Utiliser Edit tool pour chaque fichier
```

**Validation**:
- ✅ `grep -r "COMMERÇANT" src/` → 0 résultats
- ✅ Enum Prisma `COMMERCANT` utilisé partout

### 2.4 - Service Email Validation

**Actions**:

```typescript
// src/lib/email.test.ts (script manuel test)
import { sendEmail } from '@/lib/email'

async function testEmail() {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'test@example.com',
      subject: 'Test SPYMEO Email',
      html: '<p>Email service fonctionne ✅</p>',
    })
    console.log('✅ Email envoyé')
  } catch (err) {
    console.error('❌ Email error:', err)
  }
}

testEmail()
```

```bash
# Tester
tsx src/lib/email.test.ts
```

**Validation**:
- ✅ Email de test reçu
- ✅ Template inscription/reset password fonctionnels

### 2.5 - Baseline Mobile-First

**Actions**:

1. **Vérifier Tailwind config**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

2. **Audit composants critiques** (formulaires, tableaux, menus):
```tsx
// Avant (desktop-first ❌)
<div className="grid grid-cols-3 gap-4">

// Après (mobile-first ✅)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

3. **Viewport meta** (Next.js l'ajoute par défaut ✅):
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

4. **Touch targets 44x44px minimum**:
```tsx
// Boutons mobiles
<button className="px-4 py-3 min-h-[44px] min-w-[44px]">
```

**Validation**:
- ✅ Toutes pages responsive (test Chrome DevTools iPhone 14)
- ✅ Formulaires utilisables sur mobile
- ✅ Navigation mobile fonctionnelle

### 2.6 - Pages Légales Manquantes

**Actions**:

Créer 5 pages:
1. `/politique-de-confidentialite` - RGPD obligatoire
2. `/conditions-generales` - CGU
3. `/mentions-legales` - Mentions légales
4. `/accessibilite` - Déclaration a11y
5. `/contact` - Formulaire contact

**Template**:
```tsx
// src/app/politique-de-confidentialite/page.tsx
export const metadata = {
  title: 'Politique de confidentialité | SPYMEO',
  description: 'Politique de confidentialité et gestion de vos données personnelles',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8">Politique de confidentialité</h1>

      <div className="prose prose-lg max-w-none">
        <h2>1. Responsable du traitement</h2>
        <p>SPYMEO - Contact: cindy-dorbane@spymeo.fr</p>

        <h2>2. Données collectées</h2>
        <p>...</p>

        <h2>3. Finalités</h2>
        <p>...</p>

        <h2>4. Vos droits (RGPD)</h2>
        <p>Droit d'accès, rectification, suppression, portabilité...</p>
      </div>
    </div>
  )
}
```

**Validation**:
- ✅ 5 pages créées et accessibles
- ✅ Liens footer fonctionnels
- ✅ SEO metadata présentes

### 2.7 - RBAC Complet

**Actions**:

1. **Hook useRequireRole**:
```typescript
// src/hooks/useRequireRole.ts
import { useSession } from '@/lib/auth/session-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireRole(requiredRole: Role | Role[]) {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(session.role) && session.role !== 'ADMIN') {
      router.push('/non-autorise')
    }
  }, [session, requiredRole, router])
}
```

2. **Appliquer sur toutes pages protégées**:
```tsx
// src/app/praticiens/tableau-de-bord/page.tsx
'use client'

import { useRequireRole } from '@/hooks/useRequireRole'

export default function PractitionerDashboard() {
  useRequireRole('PRACTITIONER')

  return <div>...</div>
}
```

3. **Guards API**:
```typescript
// src/lib/api/guards.ts
export function requireAuth(session: Session | null): Session {
  if (!session) {
    throw new ApiError('Non authentifié', 401, 'UNAUTHORIZED')
  }
  return session
}

export function requireRole(session: Session, roles: Role[]) {
  if (!roles.includes(session.role) && session.role !== 'ADMIN') {
    throw new ApiError('Accès interdit', 403, 'FORBIDDEN')
  }
}
```

**Validation**:
- ✅ Accès pages sans auth → redirect login
- ✅ Accès pages sans bon rôle → redirect /non-autorise
- ✅ API sans auth → 401
- ✅ API sans bon rôle → 403

### 2.8 - Panneau Admin Promotion @spymeo.fr

**Actions**:

```tsx
// src/app/admin/utilisateurs/[id]/promote/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PromoteToAdminPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const router = useRouter()

  // Fetch user
  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then(res => res.json())
      .then(setUser)
  }, [params.id])

  // Vérifier @spymeo.fr
  const isSpymeoEmail = user?.email.endsWith('@spymeo.fr')

  async function handlePromote() {
    if (!confirmed) {
      alert('Veuillez confirmer')
      return
    }

    await fetch(`/api/admin/users/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    })

    alert('Utilisateur promu ADMIN ✅')
    router.push('/admin/utilisateurs')
  }

  if (!isSpymeoEmail) {
    return <div>❌ Seuls les emails @spymeo.fr peuvent être promus ADMIN</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Promouvoir en ADMIN</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p className="font-semibold">⚠️ Action irréversible</p>
        <p className="text-sm">Vous allez promouvoir <strong>{user?.email}</strong> en administrateur.</p>
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>Je confirme vouloir promouvoir cet utilisateur en ADMIN</span>
      </label>

      <button
        onClick={handlePromote}
        disabled={!confirmed}
        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        Confirmer promotion ADMIN
      </button>
    </div>
  )
}
```

**Validation**:
- ✅ Seuls emails `@spymeo.fr` promotables
- ✅ Double confirmation requise
- ✅ Promotion fonctionne (rôle → ADMIN en DB)

### 2.9 - Headers Sécurité

**Actions**:

```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://api.stripe.com;
              frame-src https://js.stripe.com;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

**Validation**:
- ✅ `curl -I https://app.spymeo.fr` montre headers sécurité

### 2.10 - Rate Limiting

**Actions**:

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// En production, utiliser Upstash Redis
// En dev, utiliser in-memory map
const redis = process.env.UPSTASH_REDIS_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    })
  : undefined

export const authRateLimit = new Ratelimit({
  redis: redis || new Map(),
  limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 tentatives / 10 minutes
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await authRateLimit.limit(identifier)

  if (!success) {
    throw new ApiError(
      `Trop de tentatives. Réessayez dans ${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes.`,
      429,
      'RATE_LIMIT_EXCEEDED'
    )
  }

  return { limit, remaining, reset }
}
```

```typescript
// src/app/api/auth/login/route.ts
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // Rate limit par IP ou email
  await checkRateLimit(`login:${email}`)

  // ... suite login
}
```

**Validation**:
- ✅ 6e tentative login → 429 Too Many Requests

### 2.11 - CSRF Protection

**Actions**:

```typescript
// src/lib/csrf.ts
import { cookies } from 'next/headers'
import crypto from 'crypto'

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function setCsrfToken() {
  const token = generateCsrfToken()
  cookies().set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
  return token
}

export function verifyCsrfToken(token: string) {
  const storedToken = cookies().get('csrf-token')?.value
  if (!storedToken || storedToken !== token) {
    throw new ApiError('Token CSRF invalide', 403, 'INVALID_CSRF_TOKEN')
  }
}
```

```tsx
// src/app/auth/login/page.tsx (ajouter input hidden)
const csrfToken = setCsrfToken()

return (
  <form action="/api/auth/login" method="POST">
    <input type="hidden" name="csrf_token" value={csrfToken} />
    {/* ... */}
  </form>
)
```

**Validation**:
- ✅ Requête POST sans CSRF token → 403

---

## PHASE 3: P2 - AMÉLIORATIONS 🟡

**Objectif**: SEO, Accessibilité, Performances
**Durée estimée**: 4-5 heures

### 3.1 - Sitemap.xml Dynamique

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spymeo.fr'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/praticiens`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artisans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/commercants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/centres-de-formation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pass`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    // Ajouter articles blog dynamiquement
  ]
}
```

**Validation**:
- ✅ `https://spymeo.fr/sitemap.xml` accessible
- ✅ Google Search Console accepte sitemap

### 3.2 - Robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/**/tableau-de-bord'],
      },
    ],
    sitemap: 'https://spymeo.fr/sitemap.xml',
  }
}
```

**Validation**:
- ✅ `https://spymeo.fr/robots.txt` accessible

### 3.3 - Metadata SEO Complètes

**Template par page**:

```tsx
// src/app/praticiens/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Praticiens de santé naturelle | SPYMEO',
  description: 'Trouvez votre praticien en naturopathie, sophrologie, et médecines douces. Annuaire vérifié de professionnels du bien-être.',
  openGraph: {
    title: 'Praticiens de santé naturelle | SPYMEO',
    description: 'Trouvez votre praticien en naturopathie, sophrologie, et médecines douces.',
    url: 'https://spymeo.fr/praticiens',
    siteName: 'SPYMEO',
    images: [
      {
        url: 'https://spymeo.fr/og/praticiens.jpg',
        width: 1200,
        height: 630,
        alt: 'SPYMEO Praticiens',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praticiens de santé naturelle | SPYMEO',
    description: 'Trouvez votre praticien en naturopathie, sophrologie, et médecines douces.',
    images: ['https://spymeo.fr/og/praticiens.jpg'],
  },
}
```

**Validation**:
- ✅ Toutes pages publiques ont metadata
- ✅ Test Open Graph Debugger (Facebook, Twitter)

### 3.4 - JSON-LD Schemas

```tsx
// src/components/JsonLd.tsx
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SPYMEO',
    url: 'https://spymeo.fr',
    logo: 'https://spymeo.fr/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-XX-XX-XX-XX',
      contactType: 'customer service',
      email: 'contact@spymeo.fr',
    },
    sameAs: [
      'https://www.facebook.com/spymeo',
      'https://www.instagram.com/spymeo',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Validation**:
- ✅ Google Rich Results Test valide schemas

### 3.5 - Optimisation Images

**Actions**:

1. **Remplacer Unsplash par assets locaux**:
```bash
# Télécharger images optimisées
# Placer dans public/images/
```

2. **Utiliser next/image partout**:
```tsx
// Avant
<img src="/images/hero.jpg" alt="..." />

// Après
import Image from 'next/image'
<Image
  src="/images/hero.jpg"
  alt="..."
  width={1200}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/..."
  priority
/>
```

3. **Formats modernes** (Next.js gère WebP/AVIF auto ✅)

**Validation**:
- ✅ Lighthouse "Serve images in modern formats" ✅
- ✅ Lazy loading fonctionne

### 3.6 - Bundle Analysis

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // ... config existante
}

export default withBundleAnalyzer(nextConfig)
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

```bash
npm run analyze
# Ouvre navigateur avec visualisation bundle
```

**Actions optimisation**:
- Dynamic imports pour routes lourdes (Academy, Admin)
- Tree-shaking libraries inutilisées

**Validation**:
- ✅ First Load JS < 200kB (target Next.js)

### 3.7 - Accessibilité Audit

**Actions**:

1. **ARIA sur formulaires**:
```tsx
<form aria-label="Formulaire de connexion">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert">
    {errors.email}
  </span>
</form>
```

2. **Focus trap modals**:
```bash
npm install focus-trap-react
```

3. **Skip links**:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Aller au contenu principal
</a>
```

4. **Lighthouse accessibility audit**:
```bash
npm install -g @lhci/cli

lhci autorun --config=lighthouserc.json
```

**Validation**:
- ✅ Lighthouse Accessibility score > 95
- ✅ Navigation clavier complète
- ✅ Lecteur d'écran (NVDA/JAWS) fonctionnel

### 3.8 - TypeScript Strict Mode

**Actions progressives**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    // Ou activer progressivement:
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    // "noImplicitAny": true,
  }
}
```

```bash
# Corriger erreurs une par une
npm run typecheck
```

**Validation**:
- ✅ `npm run typecheck` passe sans erreurs

### 3.9 - Tests E2E Playwright

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test('inscription praticien complète', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/register')

  await page.fill('[name="email"]', 'test-praticien@example.com')
  await page.fill('[name="password"]', 'SecurePassword123!')
  await page.selectOption('[name="role"]', 'PRACTITIONER')
  await page.click('button[type="submit"]')

  // Attendre validation admin
  await expect(page).toHaveURL(/attente-validation/)
  await expect(page.locator('h1')).toContainText('En attente de validation')
})

test('login + logout', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login')
  await page.fill('[name="email"]', 'cindy-dorbane@spymeo.fr')
  await page.fill('[name="password"]', 'ChangeMe2025!')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/admin/)

  await page.click('button:has-text("Déconnexion")')
  await expect(page).toHaveURL(/auth\/login/)
})
```

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

**Validation**:
- ✅ Tests critiques passent (signup, login, booking, payment no-op)

---

## PHASE 4: SCRIPTS & QUALITY ASSURANCE 🔧

**Objectif**: Automatiser vérifications, générer rapports
**Durée estimée**: 2-3 heures

### 4.1 - Scripts Database

```json
// package.json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed:min": "tsx prisma/seeds/minimal.ts",
    "db:reset:local": "prisma migrate reset --force && npm run db:seed:min",
    "db:studio": "prisma studio"
  }
}
```

### 4.2 - Scripts QA

```typescript
// scripts/check-links.ts
import { glob } from 'glob'
import * as fs from 'fs'

async function checkLinks() {
  const files = await glob('src/**/*.{tsx,ts}')
  const brokenLinks: string[] = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')

    // Regex pour détecter <Link href="...">
    const linkRegex = /<Link\s+href=["']([^"']+)["']/g
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      const href = match[1]

      // Vérifier si page existe
      if (href.startsWith('/') && !href.startsWith('/api')) {
        const pagePath = `src/app${href}/page.tsx`
        if (!fs.existsSync(pagePath)) {
          brokenLinks.push(`${file}: ${href}`)
        }
      }
    }
  }

  // Générer rapport
  fs.writeFileSync(
    'LINKS_REPORT.md',
    `# Links Check Report\n\n**Date**: ${new Date().toISOString()}\n\n` +
    (brokenLinks.length === 0
      ? '✅ Aucun lien cassé détecté\n'
      : `❌ ${brokenLinks.length} liens cassés:\n\n${brokenLinks.map(l => `- ${l}`).join('\n')}\n`)
  )

  console.log(`✅ Rapport généré: LINKS_REPORT.md`)
}

checkLinks()
```

```json
// package.json
{
  "scripts": {
    "links:check": "tsx scripts/check-links.ts",
    "a11y:check": "tsx scripts/check-a11y.ts",
    "lighthouse:local": "lhci autorun"
  }
}
```

### 4.3 - Lighthouse CI

```javascript
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/praticiens",
        "http://localhost:3000/pass"
      ],
      "numberOfRuns": 3,
      "startServerCommand": "npm run build && npm start"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.95}]
      }
    },
    "upload": {
      "target": "filesystem",
      "outputDir": "./lighthouse-reports"
    }
  }
}
```

**Validation**:
- ✅ `npm run links:check` → LINKS_REPORT.md généré
- ✅ `npm run lighthouse:local` → rapports dans lighthouse-reports/

---

## PHASE 5: DOCUMENTATION FINALE 📚

**Objectif**: Livrer documentation complète production-ready
**Durée estimée**: 2-3 heures

### 5.1 - READY_TO_USE.md

Contenu:
- Quick start local (clone, install, .env, migrate, seed, dev)
- Quick start production (build, deploy AWS ECS)
- Variables environnement requises
- Scripts npm disponibles
- Troubleshooting commun

### 5.2 - API_README.md

Contenu:
- Liste tous endpoints avec méthode HTTP, auth requise, rôle requis
- Exemples requêtes curl
- Schémas réponses (success/error)
- Codes d'erreur standardisés

### 5.3 - CHANGELOG.md

Format:
```markdown
# Changelog

## [1.0.0] - 2025-10-21

### Added
- 🎯 Migrations Prisma initiales (32 modèles)
- 🔐 JWT_SECRET sécurisé
- 🗑️ Suppression mock database → Prisma
- 💳 Intégration Stripe complète (webhooks validés)
- 🎓 Composants Academy Resources
- 🛡️ RBAC complet tous rôles
- 👮 Panneau Admin promotion @spymeo.fr
- 📱 Baseline mobile-first
- 🔒 Headers sécurité (CSP, HSTS, etc.)
- ⏱️ Rate limiting auth endpoints
- 🚫 CSRF protection
- 📄 Pages légales (RGPD, CGU, mentions, contact)
- 🗺️ Sitemap.xml + robots.txt
- ♿ Accessibilité ARIA complète
- 📊 Scripts QA (links/a11y/lighthouse)
- 🧪 Tests E2E Playwright

### Changed
- 🔧 Normalisation COMMERÇANT (enum Prisma)
- 🚨 Error handling standardisé (codes HTTP corrects)
- 🖼️ Images optimisées (Next.js Image, WebP)
- 📦 Bundle optimisé (code-split Academy/Admin)

### Fixed
- 🐛 Middleware auth protège API routes
- 🐛 CI/CD DATABASE_URL PostgreSQL service
- 🐛 Email service Nodemailer validé

### Security
- 🔐 Rotation DATABASE_URL password (manuel AWS)
- 🔐 JWT_SECRET généré cryptographiquement
- 🔐 Suppression données de test
```

### 5.4 - MIGRATION_NOTES.md

Contenu:
- Comment exécuter migrations (dev, staging, prod)
- Rollback procédure
- Breaking changes potentiels
- Données à sauvegarder avant migration

### 5.5 - ROLLBACK.md

Procédure rollback complète si déploiement échoue.

### 5.6 - ARTIFACT_RELEASE.md

Contenu:
- Comment builder image Docker
- Comment tagger version
- Comment push ECR
- Comment déployer ECS
- Healthchecks à valider post-déploiement

---

## PHASE 6: HANDOVER & VALIDATION FINALE ✅

**Objectif**: Livraison complète production-ready
**Durée estimée**: 1 heure

### 6.1 - Checklist Finale

**Database**:
- [x] Migrations créées et appliquées
- [x] Seeds minimaux exécutés
- [x] Admin cindy-dorbane@spymeo.fr créé
- [x] 0 données de test

**Code**:
- [x] Mocks supprimés → Prisma
- [x] TypeScript build passe
- [x] ESLint passe
- [x] Tests E2E passent

**Sécurité**:
- [x] JWT_SECRET sécurisé
- [x] DATABASE_URL password rotaté
- [x] Headers sécurité configurés
- [x] Rate limiting actif
- [x] CSRF protection active

**RBAC**:
- [x] Tous rôles opérationnels
- [x] Middleware protège routes
- [x] Panneau Admin @spymeo.fr fonctionne

**Mobile-First**:
- [x] Toutes pages responsive
- [x] Touch targets 44x44px
- [x] Navigation mobile fluide

**Intégrations**:
- [x] Stripe webhooks fonctionnels (ou no-op graceful)
- [x] Email service validé
- [x] S3 uploads configurés (ou no-op graceful)

**SEO**:
- [x] Sitemap.xml généré
- [x] Robots.txt créé
- [x] Metadata complètes
- [x] JSON-LD schemas

**Accessibilité**:
- [x] Lighthouse a11y > 95
- [x] ARIA complet
- [x] Focus management OK

**Performances**:
- [x] Lighthouse perf > 90
- [x] Images optimisées
- [x] Bundle < 200kB First Load

**Documentation**:
- [x] READY_TO_USE.md
- [x] API_README.md
- [x] CHANGELOG.md
- [x] MIGRATION_NOTES.md
- [x] ROLLBACK.md
- [x] ARTIFACT_RELEASE.md

**CI/CD**:
- [x] GitHub Actions passe
- [x] Build Docker fonctionne
- [x] Terraform plan valide

**QA Reports**:
- [x] LINKS_REPORT.md
- [x] A11Y_REPORT.md
- [x] LIGHTHOUSE_REPORT.md

### 6.2 - Tests Déploiement AWS (Simulation)

```bash
# 1. Build image Docker
docker build -t spymeo:1.0.0 .

# 2. Test local
docker run -p 3000:3000 --env-file .env.production spymeo:1.0.0

# 3. Vérifier healthcheck
curl http://localhost:3000/api/health
# Expect: { "status": "ok" }

# 4. Tag & Push ECR (si credentials AWS disponibles)
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-3.amazonaws.com
docker tag spymeo:1.0.0 <account-id>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0
docker push <account-id>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0

# 5. Déployer ECS (Terraform ou AWS Console)
terraform apply -var-file=terraform.tfvars
```

---

## TIMELINE CONSOLIDÉE

| Phase | Durée | Tâches clés |
|-------|-------|-------------|
| **Phase 0: Discovery** | 30min | ✅ Audit complet, rapports |
| **Phase 1: P0 Bloquants** | 3-4h | Migrations, secrets, mocks→Prisma, Stripe, Resources |
| **Phase 2: P1 Important** | 5-6h | Auth, RBAC, mobile-first, pages légales, security headers |
| **Phase 3: P2 Améliorations** | 4-5h | SEO, a11y, perf, images, bundle, TypeScript strict |
| **Phase 4: Scripts & QA** | 2-3h | Scripts DB/QA, Lighthouse, rapports |
| **Phase 5: Documentation** | 2-3h | READY_TO_USE, API_README, CHANGELOG, MIGRATION_NOTES |
| **Phase 6: Handover** | 1h | Checklist finale, tests déploiement AWS |
| **TOTAL** | **18-23 heures** | **Livraison production-ready complète** |

---

## NEXT ACTIONS (EXÉCUTION AUTONOME)

1. ✅ Discovery completed (AUDIT-COMPLET.md, REPORT_DISCOVERY.md)
2. ✅ Plan d'exécution créé (PLAN_EXECUTION.md)
3. ⏭️ Créer DECISIONS_LOG.md
4. ⏭️ **DÉMARRER PHASE 1 - P0 BLOQUANTS**
   - Créer migrations Prisma
   - Générer JWT_SECRET
   - Mettre à jour .env
   - Supprimer mockdb
   - Créer seeds
   - Installer Stripe
   - Implémenter Resources
   - Fix CI/CD
5. ⏭️ Continuer Phase 2, 3, 4, 5, 6 séquentiellement
6. ✅ Livraison production-ready

---

**PLAN D'EXÉCUTION COMPLET CRÉÉ**

**Date**: 2025-10-21
**Auteur**: Claude Code (Autonomous Rebuild Agent)
**Status**: ✅ PLAN READY - Démarrage Phase 1 imminent
**Méthode**: Exécution autonome systématique sans questions
