# MIGRATION NOTES - SPYMEO V1
## Database Migrations & Deployment Guide

**Date**: 2025-10-21
**Version**: 1.0.0
**Database**: PostgreSQL 15+ (AWS RDS)

---

## CRITICAL - EXECUTE MIGRATIONS

⚠️ **ATTENTION**: Les migrations Prisma n'ont PAS encore été exécutées sur la base de données.
L'application **NE PEUT PAS démarrer** sans ces migrations.

### Prérequis

1. **Accès à la base de données**:
   - AWS RDS `spymeo-production-db.cfow90jgepol.eu-west-3.rds.amazonaws.com`
   - VPN ou bastion host configuré
   - Credentials valides (voir AWS Secrets Manager)

2. **Variables d'environnement**:
   - `DATABASE_URL` correctement configuré
   - JWT_SECRET configuré (✅ déjà généré)

---

## ÉTAPE 1: ROTATION PASSWORD DATABASE (CRITIQUE)

⚠️ **AVANT TOUTE CHOSE**: Le password DB actuel `SpymeoSecure2025!` a été exposé dans `.env`.

### Actions immédiates:

```bash
# 1. AWS Console → RDS → spymeo-production-db
# 2. Actions → Modifier
# 3. Nouveau mot de passe master: [générer avec AWS ou 1Password]
# 4. Appliquer immédiatement

# 5. Mettre à jour DATABASE_URL dans .env (LOCAL - NE PAS COMMITTER)
DATABASE_URL="postgresql://spymeo_admin:NEW_PASSWORD@spymeo-production-db.cfow90jgepol.eu-west-3.rds.amazonaws.com:5432/spymeo?schema=public"

# 6. Mettre à jour AWS Secrets Manager (PRODUCTION)
aws secretsmanager update-secret \
  --secret-id spymeo/database-url \
  --secret-string "postgresql://spymeo_admin:NEW_PASSWORD@spymeo-production-db.cfow90jgepol.eu-west-3.rds.amazonaws.com:5432/spymeo?schema=public" \
  --region eu-west-3

# 7. Redémarrer ECS tasks pour charger nouveau secret
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --force-new-deployment \
  --region eu-west-3
```

---

## ÉTAPE 2: CRÉER MIGRATIONS PRISMA

### 2.1 - Connexion à la base de données

```bash
# Option A: Via VPN/Bastion
ssh -L 5433:spymeo-production-db.cfow90jgepol.eu-west-3.rds.amazonaws.com:5432 bastion-user@bastion-host

# Option B: Si Security Group autorise votre IP
# (Temporairement ajouter votre IP publique aux règles RDS)
```

### 2.2 - Générer la migration initiale

```bash
# Avec DATABASE_URL correctement configuré

# Créer migration basée sur schema.prisma
npx prisma migrate dev --name init

# Vérifier migration créée
ls prisma/migrations/
# Devrait afficher: <timestamp>_init/

# Générer Prisma Client
npx prisma generate
```

### 2.3 - Vérifier migration

```bash
# Status migrations
npx prisma migrate status

# Devrait afficher:
# "Database schema is up to date!"
```

---

## ÉTAPE 3: EXÉCUTER SEED MINIMAL

⚠️ **IMPORTANT**: Le seed créera le compte admin `cindy-dorbane@spymeo.fr` avec le password `ChangeMe2025!`.

### 3.1 - Exécuter seed

```bash
# Définir password initial admin (optionnel, sinon défaut: ChangeMe2025!)
export ADMIN_INITIAL_PASSWORD="VotrePasswordSecureIci"

# Exécuter seed
npm run db:seed:min

# Devrait afficher:
# ✅ Admin créé: cindy-dorbane@spymeo.fr (ID: ...)
# ✅ PASS resource créé: ...
# ✅ PASS discount créé: ...
```

### 3.2 - Vérifier données créées

```bash
# Ouvrir Prisma Studio (interface visuelle DB)
npm run db:studio

# Vérifier:
# - Table `users`: 1 utilisateur (cindy-dorbane@spymeo.fr, role=ADMIN)
# - Table `pass_resources`: 1 ressource
# - Table `pass_discounts`: 1 discount (inactive)
# - Autres tables: VIDES (0 données de test ✅)
```

### 3.3 - Premier login admin

```bash
# 1. Démarrer application
npm run dev

# 2. Naviguer vers http://localhost:3000/auth/login

# 3. Connexion:
#    Email: cindy-dorbane@spymeo.fr
#    Password: ChangeMe2025! (ou ADMIN_INITIAL_PASSWORD si défini)

# 4. ⚠️ CHANGER PASSWORD IMMÉDIATEMENT via /compte ou /admin/profil
```

---

## ÉTAPE 4: DÉPLOIEMENT PRODUCTION

### 4.1 - Build & Test local

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Build production
npm run build

# Tester build localement
npm start

# Vérifier http://localhost:3000 fonctionne
```

### 4.2 - Build Docker

```bash
# Build image
docker build -t spymeo:1.0.0 .

# Test image localement
docker run -p 3000:3000 --env-file .env.production spymeo:1.0.0

# Vérifier healthcheck
curl http://localhost:3000/api/health
# Expect: {"status":"ok"}
```

### 4.3 - Push ECR & Deploy ECS

```bash
# Login ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com

# Tag image
docker tag spymeo:1.0.0 \
  <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0

# Push
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/spymeo:1.0.0

# Deploy ECS (via Terraform ou AWS Console)
terraform apply -var-file=terraform.tfvars

# OU via AWS CLI
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --force-new-deployment \
  --region eu-west-3
```

---

## ÉTAPE 5: VALIDATIONS POST-DÉPLOIEMENT

### 5.1 - Healthchecks

```bash
# API health
curl https://app.spymeo.fr/api/health
# Expect: {"status":"ok"}

# Database connectivity (page admin)
curl https://app.spymeo.fr/admin
# Expect: 200 (après login)
```

### 5.2 - Tests fonctionnels critiques

- [ ] Login admin (`cindy-dorbane@spymeo.fr`)
- [ ] Dashboard admin accessible
- [ ] Inscription nouveau praticien (email test)
- [ ] Validation admin (changer status PENDING_VALIDATION → ACTIVE)
- [ ] Login praticien
- [ ] Dashboard praticien accessible
- [ ] PASS subscription page (UI visible, Stripe no-op si clés absentes)

### 5.3 - Monitoring

```bash
# CloudWatch Logs
aws logs tail /ecs/spymeo-app --follow --region eu-west-3

# Vérifier pas d'erreurs critiques:
# - Prisma connection errors
# - JWT_SECRET missing
# - Uncaught exceptions
```

---

## ROLLBACK PROCÉDURE

Voir fichier séparé: `ROLLBACK.md`

---

## BREAKING CHANGES

### De v0.x à v1.0:

1. **JWT_SECRET**: Maintenant obligatoire et vérifié au démarrage. Application crash si non défini ou égal à `"changeme_in_production"`.

2. **Mock database supprimée**: Tous les fichiers `src/lib/mockdb/*.ts` ont été supprimés. API routes utilisent maintenant Prisma exclusivement.

3. **Stripe SDK ajouté**: Dépendances `stripe` et `@stripe/stripe-js` ajoutées. Si non configuré, feature flag `STRIPE_ENABLED=false` désactive paiements.

4. **Academy Resources**: Composants implémentés (FiltersBar, ResourceCard, ResourceGrid, PreviewDrawer, ShareModal).

5. **Scripts npm**: Nouveaux scripts `db:*` pour migrations/seeds. Voir `package.json`.

---

## DATA MIGRATION (si migration depuis ancienne DB)

⚠️ Si vous aviez une base de données existante avec des données à conserver:

```bash
# 1. Backup DB existante
pg_dump -h OLD_DB_HOST -U OLD_DB_USER -d OLD_DB_NAME > backup_old.sql

# 2. Créer snapshot RDS (sécurité)
aws rds create-db-snapshot \
  --db-instance-identifier spymeo-production-db \
  --db-snapshot-identifier spymeo-pre-migration-snapshot \
  --region eu-west-3

# 3. Exécuter migrations (écrase schéma mais garde données)
npx prisma migrate deploy

# 4. Vérifier données préservées
npx prisma studio

# 5. Si problème, restaurer snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier spymeo-production-db-restored \
  --db-snapshot-identifier spymeo-pre-migration-snapshot \
  --region eu-west-3
```

---

## SUPPORT

En cas de problème lors des migrations:

1. **Prisma errors**:
   - Vérifier `DATABASE_URL` correct
   - Vérifier PostgreSQL version >= 15
   - Vérifier schéma `public` existe

2. **Migration conflicts**:
   - Si schéma existant incompatible, voir `ROLLBACK.md`
   - Contacter équipe DevOps

3. **Seed failures**:
   - Vérifier Prisma Client généré (`npx prisma generate`)
   - Vérifier bcrypt installé (`npm install bcrypt`)
   - Check logs pour erreurs spécifiques

---

**FIN DES MIGRATION NOTES**

**Prochaine étape**: Voir `READY_TO_USE.md` pour guide d'utilisation complet.
