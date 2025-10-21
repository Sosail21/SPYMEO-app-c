# Système d'inscription SPYMEO

## 📋 Vue d'ensemble

Le système d'inscription SPYMEO gère deux flux distincts :
- **Particuliers** : Inscription immédiate avec option PASS payante
- **Professionnels** : Candidature → Validation admin → Paiement → Activation

## 🔄 Flux complets

### Particuliers (PASS_USER)

```
┌─────────────────┐
│  Formulaire     │
│  /auth/signup   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/auth/ │
│    register     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  FREE      PASS
    │         │
    ▼         ▼
 ACTIF   Paiement
           │
           ▼
         ACTIF
```

### Professionnels (PRACTITIONER/ARTISAN/COMMERCANT)

```
┌─────────────────┐
│  Formulaire     │
│  multi-étapes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/auth/ │
│  register-pro   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Status: PENDING │
│  _VALIDATION    │
└────────┬────────┘
         │
         ├─► Email admin
         └─► Email candidat
         │
         ▼
┌─────────────────┐
│ Admin valide    │
│ /admin/pros     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Approuvé   Refusé
    │         │
    ▼         └─► Email refus
Email+lien
paiement
    │
    ▼
┌─────────────────┐
│ Paiement        │
│ /payment/pro    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/      │
│ payment/confirm │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Status: ACTIVE  │
│ Email bienvenue │
└─────────────────┘
```

## 🔌 Routes API

### POST /api/auth/register

Inscription particuliers

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "minimum8chars",
  "userPlan": "FREE" | "PASS"
}
```

**Réponse (FREE):**
```json
{
  "success": true,
  "userId": "clx...",
  "message": "Compte créé avec succès"
}
```

**Réponse (PASS):**
```json
{
  "success": true,
  "userId": "clx...",
  "redirectTo": "/payment/pass?userId=clx..."
}
```

### POST /api/auth/register-pro

Candidature praticien

**Body:**
```json
{
  "firstName": "Marie",
  "lastName": "Martin",
  "email": "marie@example.com",
  "password": "securepass",
  "discipline": "Réflexologie",
  "city": "Paris",
  "experience": 5,
  "ethics": "Description...",
  "documents": "https://..."
}
```

**Réponse:**
```json
{
  "success": true,
  "userId": "clx...",
  "status": "PENDING",
  "message": "Candidature envoyée avec succès. Réponse sous 48h."
}
```

### POST /api/auth/register-merchant

Candidature artisan/commerçant

**Body:**
```json
{
  "type": "ARTISAN" | "COMMERCANT",
  "businessName": "Ma Boutique",
  "city": "Lyon",
  "email": "contact@example.com",
  "password": "securepass",
  "categories": "Bio, Vrac",
  "description": "..."
}
```

### GET /api/admin/pending-pros

Liste des candidatures en attente de validation

**Réponse:**
```json
{
  "users": [
    {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "Marie",
      "lastName": "Martin",
      "role": "PRACTITIONER",
      "status": "PENDING_VALIDATION",
      "profileData": { ... },
      "createdAt": "2025-10-21T..."
    }
  ]
}
```

### POST /api/admin/validate-pro

Validation admin d'une candidature

**Body:**
```json
{
  "userId": "clx...",
  "approved": true,
  "adminNotes": "Dossier complet, OK"
}
```

### POST /api/payment/confirm

Confirmation paiement (webhook)

**Body:**
```json
{
  "token": "eyJ...",
  "paymentIntentId": "pi_...",
  "amount": 49.90
}
```

## 📧 Emails automatiques

### 1. Admin (cindy-dorbane@spymeo.fr)
**Trigger:** Nouvelle candidature pro
**Template:** `emailTemplates.adminNotification`
**Contenu:** Infos candidat + lien panneau admin

### 2. Candidat - Confirmation réception
**Trigger:** Soumission candidature
**Template:** `emailTemplates.candidatureReceived`
**Contenu:** Confirmation + délai 48h

### 3. Candidat - Approbation
**Trigger:** Admin approuve
**Template:** `emailTemplates.candidatureApproved`
**Contenu:** Félicitations + lien paiement

### 4. Candidat - Refus
**Trigger:** Admin refuse
**Template:** `emailTemplates.candidatureRejected`
**Contenu:** Message + raison (optionnelle)

### 5. Candidat - Bienvenue
**Trigger:** Paiement confirmé
**Template:** `emailTemplates.accountActivated`
**Contenu:** Accès espace pro

## 🎨 Pages frontend

| Page | Description |
|------|-------------|
| `/auth/signup` | Formulaire multi-rôles avec steps |
| `/admin/pros` | Liste candidatures PENDING_VALIDATION avec actions |
| `/payment/pass` | Paiement abonnement PASS (particuliers) |
| `/payment/pro` | Paiement abonnement pro (après validation) |

## 🔒 Sécurité

- Passwords hashés avec bcrypt (12 rounds)
- Tokens JWT pour validation (7 jours validité)
- Validation Zod sur tous les inputs
- Messages d'erreur génériques
- Logs de toutes les actions sensibles

## 🗄️ Base de données

### Statuts utilisateur

- `ACTIVE`: Compte actif et fonctionnel
- `PENDING_VALIDATION`: En attente validation admin
- `PENDING_PAYMENT`: Validé, en attente paiement
- `REJECTED`: Candidature refusée
- `SUSPENDED`: Compte suspendu (modération)

### Rôles

- `PASS_USER`: Particulier (gratuit ou PASS)
- `PRACTITIONER`: Praticien de santé alternative
- `ARTISAN`: Artisan
- `COMMERCANT`: Commerçant
- `CENTER`: Centre de formation
- `ADMIN`: Administrateur plateforme

## 🧪 Tests manuels

### Test inscription particulier FREE
1. Aller sur /auth/signup
2. Choisir "Particulier" + "Gratuit"
3. Remplir formulaire
4. Vérifier compte créé (status ACTIVE)
5. Se connecter

### Test inscription particulier PASS
1. Choisir "Particulier" + "PASS"
2. Remplir formulaire
3. Vérifier redirection vers /payment/pass
4. (Simuler paiement)

### Test candidature praticien
1. Choisir "Praticien"
2. Compléter les 4 étapes
3. Vérifier email reçu par admin
4. Dans /admin/pros, cliquer "Approuver"
5. Vérifier email candidat avec lien paiement
6. Cliquer lien paiement
7. (Simuler paiement)
8. Vérifier status ACTIVE

## 📝 TODO Futur

- [ ] Intégration Stripe complète
- [ ] CAPTCHA sur formulaires
- [ ] Rate limiting
- [ ] Export CSV candidatures
- [ ] Statistiques admin
- [ ] Notifications temps réel
- [ ] Relances automatiques email
- [ ] Système de notes internes admin

## 🚀 Déploiement

### 1. Configuration environnement

Copier `.env.example` vers `.env` et configurer :

```bash
cp .env.example .env
```

**Variables obligatoires:**
- `DATABASE_URL`: Connexion PostgreSQL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Configuration email
- `ADMIN_EMAIL`: cindy-dorbane@spymeo.fr
- `JWT_SECRET`: Clé secrète forte
- `NEXT_PUBLIC_URL`: URL publique de l'application

### 2. Migration base de données

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Démarrage

```bash
npm run build
npm start
```

## 📞 Support

Pour toute question sur le système d'inscription :
- Documentation technique : `/docs/REGISTRATION-SYSTEM.md`
- Logs applicatifs : Vérifier les logs des routes `/api/auth/*` et `/api/admin/*`
- Email de notification admin : `ADMIN_EMAIL` dans `.env`
