# DECISIONS LOG - SPYMEO V1 REBUILD
## Documentation des choix techniques autonomes

**Date**: 2025-10-21
**Mission**: Rebuild autonome mobile-first production-ready
**Principe**: Décisions basées sur standards industrie, best practices, et contraintes projet

---

## MÉTHODOLOGIE DE DÉCISION

Chaque décision technique suit ce processus:

1. **Contexte**: Problème ou besoin identifié
2. **Options considérées**: Alternatives évaluées
3. **Décision**: Choix retenu
4. **Justification**: Pourquoi ce choix (pro/cons)
5. **Implémentation**: Comment appliqué concrètement

---

## D1 - ORM: PRISMA (CONSERVÉ)

### Contexte
Besoin ORM pour gérer 32 modèles PostgreSQL, migrations, type-safety TypeScript.

### Options considérées
1. **Prisma 6.17.1** (existant)
2. TypeORM 0.3+
3. Drizzle ORM
4. Kysely (query builder)

### Décision
✅ **Conserver Prisma 6.17.1**

### Justification

**Prisma PRO**:
- Déjà utilisé, schéma complet défini
- Excellent DX (Developer Experience)
- Type-safety compile-time + runtime
- Migrations robustes (deploy, rollback)
- Prisma Studio (UI DB exploration)
- Communauté large, docs exhaustives
- Intégration Next.js native

**Prisma CONS**:
- Bundle size légèrement supérieur (vs Drizzle)
- Abstractions parfois limitantes (requêtes complexes)

**Alternatives rejetées**:
- **TypeORM**: Décorators, moins type-safe, migrations moins robustes
- **Drizzle**: Moderne mais migration risquée (réécrire 32 modèles)
- **Kysely**: Query builder seul, pas de migrations intégrées

### Implémentation
- Utiliser Prisma Client existant
- Créer migrations manquantes (Phase 1 - P0)
- Optimiser queries (select, include ciblés)

---

## D2 - AUTHENTIFICATION: JWT SESSION-LESS (CONSERVÉ)

### Contexte
Multi-rôles (FREE_USER, PASS_USER, PRACTITIONER, ARTISAN, COMMERCANT, CENTER, ADMIN), besoin scalabilité AWS ECS (stateless).

### Options considérées
1. **JWT + Bcrypt** (existant)
2. Session-based (express-session + Redis)
3. NextAuth.js
4. Auth0 / Supabase Auth (SaaS)

### Décision
✅ **Conserver JWT session-less + Bcrypt**

### Justification

**JWT PRO**:
- Stateless (scalable horizontalement AWS ECS)
- Pas de dépendance Redis/DB pour session
- Tokens portables (API, mobile futur)
- Déjà implémenté, migrations utilisateurs évitées

**JWT CONS**:
- Révocation difficile (logout instant impossible)
- Payload size limite
- Rotation tokens complexe

**Alternatives rejetées**:
- **Session-based**: Nécessite Redis, coût infra, single point of failure
- **NextAuth.js**: Over-engineering pour besoin simple, lock-in Next.js
- **Auth0**: Coût mensuel, dépendance SaaS, RGPD complexifié

### Implémentation
- JWT_SECRET sécurisé (openssl rand -base64 32)
- Expiration: 7 jours (refresh token si besoin futur)
- Claims: `{ userId, role, status, type }`
- HttpOnly cookies (CSRF protection)

---

## D3 - VALIDATION: ZOD (CONSERVÉ)

### Contexte
Validation inputs API (64 endpoints), formulaires frontend.

### Options considérées
1. **Zod 4.1.12** (existant)
2. Yup
3. Joi
4. class-validator

### Décision
✅ **Conserver Zod 4.1.12**

### Justification

**Zod PRO**:
- TypeScript-first (inférence types automatique)
- Runtime + compile-time validation
- Bundle size optimal (tree-shakeable)
- Intégration Next.js/React Hook Form excellente
- Déjà installé et utilisé

**Zod CONS**:
- Courbe d'apprentissage (schemas)

**Alternatives rejetées**:
- **Yup**: Moins type-safe, API moins intuitive
- **Joi**: Bundle size supérieur, pas TypeScript-first
- **class-validator**: Décorators, lock-in POO

### Implémentation
```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

type LoginDTO = z.infer<typeof loginSchema>
```

---

## D4 - PAIEMENTS: STRIPE (CONFIRMÉ)

### Contexte
Abonnements PASS (mensuel/annuel), paiements formations, services.

### Options considérées
1. **Stripe**
2. PayPlug (français)
3. Mollie
4. Lemon Squeezy

### Décision
✅ **Stripe**

### Justification

**Stripe PRO**:
- Leader marché (99.99% uptime)
- Webhooks robustes (retry automatique)
- Subscription management complet
- Documentation exhaustive
- SDK TypeScript officiel
- Conformité RGPD/PCI-DSS native
- Intégration Next.js simple

**Stripe CONS**:
- Frais transaction (1.4% + 0.25€)
- Configuration complexe (webhooks, metadata)

**Alternatives rejetées**:
- **PayPlug**: Moins mature, webhooks moins fiables
- **Mollie**: Bon mais communauté plus petite
- **Lemon Squeezy**: Adapté SaaS mais moins flexible

### Implémentation
- Stripe SDK `stripe@latest`
- Checkout Sessions (hosted)
- Webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Feature flag: graceful degradation si clés absentes

---

## D5 - EMAIL: NODEMAILER + SMTP (CONSERVÉ)

### Contexte
Emails transactionnels (inscription, reset password, notifications admin).

### Options considérées
1. **Nodemailer + SMTP** (existant)
2. AWS SES
3. SendGrid
4. Brevo (ex-Sendinblue)
5. Resend

### Décision
✅ **Conserver Nodemailer + SMTP**

### Justification

**Nodemailer PRO**:
- Flexibilité provider (SMTP, SES, SendGrid)
- Pas de lock-in SaaS
- Templates HTML custom
- Gratuit (hors provider)

**Nodemailer CONS**:
- Configuration SMTP manuelle
- Pas de dashboard analytics natif

**Alternatives rejetées**:
- **AWS SES**: Lock-in AWS, configuration complexe (sandbox)
- **SendGrid**: Coût, UI complexe
- **Brevo**: Bon mais coût progressif
- **Resend**: Moderne mais jeune, pricing incertain

### Implémentation
```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️ SMTP non configuré, email non envoyé')
    return // Graceful degradation
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  })
}
```

---

## D6 - STORAGE: AWS S3 (CONSERVÉ)

### Contexte
Upload documents (PDFs, images), stockage assets.

### Options considérées
1. **AWS S3** (infrastructure existante)
2. Cloudflare R2
3. Supabase Storage
4. Filesystem local (non scalable)

### Décision
✅ **AWS S3**

### Justification

**AWS S3 PRO**:
- Déjà infrastructure AWS (ECS, RDS, ECR)
- Scalabilité illimitée
- Durabilité 99.999999999% (11 nines)
- CDN CloudFront intégrable
- SDK officiel `@aws-sdk/client-s3`

**AWS S3 CONS**:
- Coût variable (stockage + requêtes)
- Configuration IAM complexe

**Alternatives rejetées**:
- **Cloudflare R2**: Excellent mais migration infrastructure
- **Supabase Storage**: SaaS, coût progressif, lock-in
- **Filesystem**: Non scalable, backup complexe

### Implémentation
- Bucket: `spymeo-production-assets` (eu-west-3)
- IAM policy: PutObject, GetObject, DeleteObject
- Presigned URLs (uploads sécurisés)
- Feature flag: graceful degradation si credentials absentes

---

## D7 - MOBILE-FIRST: TAILWIND CSS (CONSERVÉ)

### Contexte
Design responsive, 40%+ trafic mobile attendu.

### Options considérées
1. **Tailwind CSS 3.4.10** (existant)
2. CSS Modules
3. Styled-components
4. Vanilla CSS

### Décision
✅ **Conserver Tailwind CSS mobile-first**

### Justification

**Tailwind PRO**:
- Utility-first (DX rapide)
- Mobile-first par défaut (sm:, md:, lg:)
- Tree-shaking (CSS optimisé)
- Design system cohérent (spacing, colors)
- Plugins: @forms, @typography, @line-clamp

**Tailwind CONS**:
- Verbosité classes HTML
- Courbe apprentissage

**Alternatives rejetées**:
- **CSS Modules**: Boilerplate, moins DX
- **Styled-components**: Runtime CSS-in-JS, perf impact
- **Vanilla CSS**: Maintenance difficile

### Implémentation
```tsx
// Mobile-first (défaut mobile, breakpoints progressifs)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <button className="px-4 py-3 min-h-[44px]"> {/* Touch target 44px */}
```

Breakpoints:
- Mobile: < 640px (défaut)
- Tablet: 640px (sm:)
- Desktop: 1024px (lg:)

---

## D8 - ERROR HANDLING: CODES HTTP STANDARDS (NOUVEAU)

### Contexte
API retournait `{ success: false, error: '...' }` avec status 200 ❌

### Options considérées
1. Standardiser codes HTTP (4xx/5xx)
2. Conserver `{ success: boolean }` pattern
3. GraphQL errors pattern

### Décision
✅ **Standardiser codes HTTP RESTful**

### Justification

**Codes HTTP PRO**:
- Standard industrie (RFC 7231)
- Cacheable (200 OK, 404 NOT FOUND)
- Monitoring simplifié (Sentry, CloudWatch)
- Client HTTP libraries (axios, fetch) gèrent naturellement

**Codes HTTP utilisés**:
- **200 OK**: Succès
- **201 Created**: Ressource créée
- **400 Bad Request**: Validation failed
- **401 Unauthorized**: Non authentifié
- **403 Forbidden**: Non autorisé (RBAC)
- **404 Not Found**: Ressource inexistante
- **409 Conflict**: Conflit (email déjà utilisé)
- **429 Too Many Requests**: Rate limit
- **500 Internal Server Error**: Erreur serveur

### Implémentation
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

// Usage
throw new ApiError('Client non trouvé', 404, 'CLIENT_NOT_FOUND')

// Response
return Response.json({ error: 'Client non trouvé' }, { status: 404 })
```

---

## D9 - RBAC: MIDDLEWARE + HOOKS (NOUVEAU)

### Contexte
7 rôles distincts, protection routes/pages/actions.

### Options considérées
1. Middleware Next.js + hooks React
2. HOC (Higher-Order Components)
3. Guards API seulement
4. CASL (authorization library)

### Décision
✅ **Middleware Next.js + hooks React**

### Justification

**Middleware PRO**:
- Protection globale (routes, API)
- Exécution edge (Vercel Edge Functions)
- Redirect avant render (perf)

**Hooks PRO**:
- Fine-grained control composants
- UX (loading states, conditional render)

**Combinaison optimale**:
- Middleware: Garde principale
- Hooks: UX + granularité

### Implémentation
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request)

  if (pathname.startsWith('/admin')) {
    if (session?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/non-autorise', request.url))
    }
  }
}

// src/hooks/useRequireRole.ts
export function useRequireRole(role: Role) {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session || session.role !== role) {
      router.push('/non-autorise')
    }
  }, [session, role])
}
```

---

## D10 - RATE LIMITING: UPSTASH (NOUVEAU)

### Contexte
Protection auth endpoints (brute-force), pas de Redis infra existante.

### Options considérées
1. **Upstash Rate Limit** (serverless Redis)
2. express-rate-limit (in-memory)
3. Redis self-hosted
4. Vercel Rate Limit (Edge)

### Décision
✅ **Upstash Rate Limit**

### Justification

**Upstash PRO**:
- Serverless (pas d'infra Redis à gérer)
- Pay-per-request (coût optimal)
- Compatible Next.js Edge
- Fallback in-memory (dev)
- DX excellent (SDK TypeScript)

**Upstash CONS**:
- Dépendance SaaS externe
- Latence légèrement supérieure (vs Redis local)

**Alternatives rejetées**:
- **express-rate-limit**: In-memory, perdu au redémarrage
- **Redis self-hosted**: Coût infra, maintenance
- **Vercel Rate Limit**: Lock-in Vercel (AWS ECS déploiement)

### Implémentation
```typescript
import { Ratelimit } from '@upstash/ratelimit'

export const authRateLimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_URL
    ? new Redis({ url: process.env.UPSTASH_REDIS_URL })
    : new Map(), // Fallback dev
  limiter: Ratelimit.slidingWindow(5, '10 m'),
})
```

---

## D11 - CSRF PROTECTION: COOKIES + TOKENS (NOUVEAU)

### Contexte
Protection mutations (POST/PATCH/DELETE) contre CSRF.

### Options considérées
1. Double Submit Cookies
2. Synchronizer Token Pattern
3. SameSite=Strict cookies seul
4. CORS strict

### Décision
✅ **Double Submit Cookies + SameSite=Strict**

### Justification

**Double Submit PRO**:
- Pas de session server-side (stateless)
- Compatible JWT auth
- Validation simple

**SameSite=Strict PRO**:
- Protection native navigateur
- Pas de code custom

**Combinaison**:
- SameSite=Strict: Première ligne défense
- Double Submit: Validation explicite

### Implémentation
```typescript
// Cookie CSRF token
cookies().set('csrf-token', generateToken(), {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
})

// Validation
export function verifyCsrfToken(token: string) {
  const storedToken = cookies().get('csrf-token')?.value
  if (storedToken !== token) {
    throw new ApiError('CSRF token invalide', 403)
  }
}
```

---

## D12 - SECURITY HEADERS: NEXT.CONFIG.MJS (NOUVEAU)

### Contexte
Protection XSS, clickjacking, MIME sniffing.

### Options considérées
1. next.config.mjs headers
2. Middleware custom
3. Helmet.js (Express)
4. Vercel headers config

### Décision
✅ **next.config.mjs headers**

### Justification

**next.config PRO**:
- Configuration déclarative
- Appliqué globalement
- Cache-friendly
- Next.js native

**Headers implémentés**:
- **CSP**: Whitelist scripts/styles (Stripe, self)
- **HSTS**: Force HTTPS (max-age 1 an)
- **X-Frame-Options**: DENY (anti-clickjacking)
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Désactiver camera/micro/geo

### Implémentation
Voir PLAN_EXECUTION.md Phase 2.9

---

## D13 - SEO: NEXT.JS METADATA API (NOUVEAU)

### Contexte
104 pages, SEO critique (trafic organique).

### Options considérées
1. Next.js Metadata API (App Router)
2. react-helmet
3. next-seo
4. Head tags manuels

### Décision
✅ **Next.js Metadata API native**

### Justification

**Metadata API PRO**:
- TypeScript type-safe
- SSR automatique
- Open Graph / Twitter Cards intégrés
- Génération sitemap.xml native

### Implémentation
```typescript
// src/app/praticiens/page.tsx
export const metadata: Metadata = {
  title: 'Praticiens | SPYMEO',
  description: '...',
  openGraph: {
    title: '...',
    description: '...',
    url: 'https://spymeo.fr/praticiens',
    images: [{ url: '/og/praticiens.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}
```

---

## D14 - IMAGES: NEXT/IMAGE (NOUVEAU)

### Contexte
Performance (LCP), formats modernes (WebP/AVIF).

### Options considérées
1. Next.js Image component
2. <img> natif + optimisation manuelle
3. Cloudinary / Imgix (SaaS)

### Décision
✅ **Next.js Image component**

### Justification

**next/image PRO**:
- Optimisation automatique (WebP/AVIF)
- Lazy loading natif
- Responsive images (srcset)
- Placeholder blur
- LCP optimisé (priority prop)

### Implémentation
```tsx
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="..."
  width={1200}
  height={600}
  placeholder="blur"
  priority // Above-the-fold
/>
```

---

## D15 - BUNDLE ANALYSIS: @NEXT/BUNDLE-ANALYZER (NOUVEAU)

### Contexte
Optimiser First Load JS (target < 200kB).

### Options considérées
1. @next/bundle-analyzer
2. webpack-bundle-analyzer
3. source-map-explorer

### Décision
✅ **@next/bundle-analyzer**

### Justification

**@next/bundle-analyzer PRO**:
- Intégration Next.js native
- Visualisation interactive
- Identifie duplications

### Implémentation
```bash
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build
```

Actions:
- Dynamic imports Academy/Admin
- Tree-shake libraries inutilisées

---

## D16 - ACCESSIBILITÉ: MANUAL AUDIT + LIGHTHOUSE (NOUVEAU)

### Contexte
RGPD exige accessibilité, target WCAG AA.

### Options considérées
1. Audit manuel + Lighthouse
2. axe DevTools
3. Pa11y
4. Automated testing (jest-axe)

### Décision
✅ **Combinaison Audit manuel + Lighthouse**

### Justification

**Lighthouse PRO**:
- Gratuit, intégré Chrome DevTools
- Score objectif (0-100)
- Recommandations actionnables

**Audit manuel nécessaire**:
- 30% erreurs a11y non détectables auto
- Navigation clavier, lecteurs d'écran

### Implémentation
```bash
lhci autorun --config=lighthouserc.json
```

Assertions:
- Accessibility score > 95
- ARIA complet
- Focus management
- Contrastes WCAG AA

---

## D17 - TESTS E2E: PLAYWRIGHT (CONSERVÉ)

### Contexte
Tests critiques (signup, login, booking, payment).

### Options considérées
1. **Playwright 1.56.0** (installé)
2. Cypress
3. Puppeteer
4. TestCafe

### Décision
✅ **Playwright**

### Justification

**Playwright PRO**:
- Multi-browser (Chromium, Firefox, WebKit)
- Auto-wait (flakiness réduit)
- Traces/screenshots automatiques
- TypeScript natif
- Déjà installé

**Playwright CONS**:
- Courbe apprentissage

### Implémentation
```typescript
// tests/auth.spec.ts
test('signup praticien', async ({ page }) => {
  await page.goto('/auth/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.selectOption('[name="role"]', 'PRACTITIONER')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/attente-validation/)
})
```

---

## D18 - CI/CD: GITHUB ACTIONS + DOCKER (CONSERVÉ)

### Contexte
Pipeline existante, déploiement AWS ECS.

### Options considérées
1. **GitHub Actions** (existant)
2. GitLab CI
3. CircleCI
4. AWS CodePipeline

### Décision
✅ **GitHub Actions**

### Justification

**GitHub Actions PRO**:
- Intégration native GitHub
- Gratuit (2000 min/mois)
- Marketplace actions riche
- YAML lisible

### Implémentation
Voir PLAN_EXECUTION.md Phase 1.7 (fix DATABASE_URL PostgreSQL service)

---

## D19 - INFRASTRUCTURE: AWS (CONSERVÉ)

### Contexte
Infrastructure existante (ECS, RDS, S3, ECR).

### Options considérées
1. **AWS** (existant)
2. Vercel
3. Render
4. Fly.io

### Décision
✅ **AWS (ECS, RDS, S3, ECR)**

### Justification

**AWS PRO**:
- Infrastructure déjà définie (Terraform)
- Scalabilité horizontale (ECS)
- RDS PostgreSQL géré
- Régionalité (eu-west-3 RGPD)

**AWS CONS**:
- Complexité configuration
- Coût variable

**Alternatives rejetées**:
- **Vercel**: Lock-in, coût élevé (BDD externe)
- **Render**: Moins mature
- **Fly.io**: Jeune, pricing incertain

### Implémentation
Terraform main.tf existant, corrections mineures si nécessaire.

---

## D20 - SECRETS MANAGEMENT: .ENV + AWS SECRETS MANAGER (HYBRIDE)

### Contexte
JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY à sécuriser.

### Options considérées
1. .env local + AWS Secrets Manager prod
2. Doppler
3. Vault (HashiCorp)
4. .env partout (insécure)

### Décision
✅ **.env local (dev) + AWS Secrets Manager (prod)**

### Justification

**Hybride PRO**:
- Dev simple (.env.local)
- Prod sécurisé (AWS Secrets Manager)
- Rotation automatique (RDS password)
- Audit trail (CloudTrail)

### Implémentation
```bash
# Dev
cp .env.example .env.local
# Remplir secrets locaux

# Prod (ECS task definition)
{
  "secrets": [
    { "name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..." },
    { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..." }
  ]
}
```

---

## D21 - ADMIN @SPYMEO.FR: PROMOTION UI (NOUVEAU)

### Contexte
Règle métier: emails `*@spymeo.fr` promotables ADMIN.

### Options considérées
1. UI Admin avec double confirmation
2. Script CLI manuel
3. Seed automatique

### Décision
✅ **UI Admin avec double confirmation**

### Justification

**UI PRO**:
- Self-service (pas besoin développeur)
- Audit trail (logs DB)
- UX claire (confirmation explicite)

**Protection double confirmation**:
- Prévient erreurs
- Traçabilité

### Implémentation
Voir PLAN_EXECUTION.md Phase 2.8

---

## D22 - MOCK DATA: SUPPRESSION TOTALE (NOUVEAU)

### Contexte
30 fichiers `src/lib/mockdb/*.ts` à supprimer.

### Options considérées
1. Supprimer entièrement → Prisma
2. Migrer vers fixtures tests
3. Conserver en dev

### Décision
✅ **Suppression totale**

### Justification

**Suppression PRO**:
- Code production propre
- Pas de risque données test en prod
- Force utilisation Prisma (best practice)

**Fixtures tests**:
- Séparés dans `tests/fixtures/`
- Non importés en production

### Implémentation
```bash
rm -rf src/lib/mockdb/
```

Créer services Prisma (voir PLAN_EXECUTION Phase 1.3)

---

## D23 - FEATURE FLAGS: ENVIRONNEMENT VARIABLES (SIMPLE)

### Contexte
ENABLE_PASS, ENABLE_ACADEMY, ENABLE_BLOG.

### Options considérées
1. Variables environnement simples
2. LaunchDarkly / Flagsmith (SaaS)
3. Base de données feature flags

### Décision
✅ **Variables environnement**

### Justification

**Env vars PRO**:
- Simplicité (pas de SaaS)
- Gratuit
- Configuration déploiement (ECS task def)

**Limitations**:
- Pas de toggle runtime (redémarrage requis)
- Pas d'A/B testing

**Suffisant pour MVP**:
- Features stables (pas de rollout progressif)

### Implémentation
```typescript
// src/lib/feature-flags.ts
export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY
export const ACADEMY_ENABLED = process.env.ENABLE_ACADEMY === 'true'
```

---

## D24 - DOCUMENTATION: MARKDOWN (SIMPLE)

### Contexte
READY_TO_USE, API_README, CHANGELOG, etc.

### Options considérées
1. Markdown simple
2. Docusaurus
3. GitBook
4. Notion

### Décision
✅ **Markdown simple**

### Justification

**Markdown PRO**:
- Lisible GitHub (preview natif)
- Versionné Git
- Pas de build nécessaire
- Format universel

### Implémentation
- READY_TO_USE.md
- API_README.md
- CHANGELOG.md
- MIGRATION_NOTES.md
- ROLLBACK.md
- ARTIFACT_RELEASE.md

---

## D25 - TYPESCRIPT STRICT: PROGRESSIF (NOUVEAU)

### Contexte
`"strict": false` actuellement, ~24k lignes TypeScript.

### Options considérées
1. Activer strict immédiatement (breaking)
2. Progressif (par flag)
3. Ignorer (status quo)

### Décision
✅ **Activation progressive**

### Justification

**Progressif PRO**:
- Pas de blocage déploiement
- Corrections ciblées
- Apprentissage incrémental

**Ordre activation**:
1. `strictNullChecks` (le plus impactant)
2. `noImplicitAny`
3. `strictFunctionTypes`
4. `strictBindCallApply`
5. `strict: true` (all flags)

### Implémentation
```json
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true, // Phase 3
    // Activer progressivement autres flags
  }
}
```

---

## RÉSUMÉ DÉCISIONS

| ID | Décision | Rationale | Phase |
|----|----------|-----------|-------|
| D1 | Prisma ORM | Type-safety, DX, déjà utilisé | P0 |
| D2 | JWT session-less | Stateless, scalable AWS ECS | P0 |
| D3 | Zod validation | TypeScript-first, runtime safe | P0 |
| D4 | Stripe payments | Leader marché, webhooks robustes | P0 |
| D5 | Nodemailer SMTP | Flexibilité provider, pas de lock-in | P0 |
| D6 | AWS S3 storage | Infra existante, scalable | P0 |
| D7 | Tailwind mobile-first | Utility-first, responsive natif | P1 |
| D8 | Codes HTTP standards | RESTful best practices | P1 |
| D9 | RBAC Middleware+Hooks | Protection globale + granularité | P1 |
| D10 | Upstash rate-limit | Serverless, pas d'infra Redis | P1 |
| D11 | CSRF Double Submit | Stateless, SameSite=Strict | P1 |
| D12 | Security headers CSP | Standard OWASP, Next.js natif | P1 |
| D13 | Next.js Metadata API | Type-safe, SSR auto | P2 |
| D14 | next/image | WebP/AVIF auto, lazy loading | P2 |
| D15 | Bundle analyzer | Optimisation First Load JS | P2 |
| D16 | Lighthouse a11y | Score objectif, WCAG AA | P2 |
| D17 | Playwright E2E | Multi-browser, auto-wait | P2 |
| D18 | GitHub Actions CI | Intégration native, gratuit | Existant |
| D19 | AWS infra (ECS/RDS) | Scalable, RGPD eu-west-3 | Existant |
| D20 | .env + AWS Secrets | Hybride dev/prod | P0 |
| D21 | Admin UI @spymeo.fr | Self-service, double confirm | P1 |
| D22 | Suppression mocks | Production propre, Prisma only | P0 |
| D23 | Feature flags env vars | Simplicité, gratuit | P0 |
| D24 | Markdown docs | Versionné Git, lisible | P5 |
| D25 | TypeScript strict progressif | Non-bloquant, incrémental | P2-P3 |

---

## PRINCIPES DIRECTEURS

Toutes les décisions suivent ces principes:

1. **Standards industrie**: Privilégier solutions éprouvées (Stripe, Prisma, Tailwind)
2. **Type-safety**: TypeScript partout, runtime validation (Zod)
3. **Stateless**: Architecture scalable (JWT, S3, ECS)
4. **Sécurité**: Defense in depth (CSP, CSRF, rate-limit, RBAC)
5. **Mobile-first**: 40%+ trafic mobile, Tailwind responsive
6. **Performance**: Core Web Vitals, bundle < 200kB, images optimisées
7. **Accessibilité**: WCAG AA minimum, Lighthouse > 95
8. **Autonomie**: Feature flags, graceful degradation
9. **Observabilité**: Codes HTTP standards, logs structurés
10. **Documentation**: Markdown versionné, exhaustif

---

**FIN DU DECISIONS LOG**

**Date**: 2025-10-21
**Auteur**: Claude Code (Autonomous Rebuild Agent)
**Décisions totales**: 25
**Prochaine étape**: Démarrer Phase 1 - P0 (Corrections bloquantes)
