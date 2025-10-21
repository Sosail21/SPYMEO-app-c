# ROLLBACK PROCÉDURE - SPYMEO V1

**Date**: 2025-10-21
**Version**: 1.0.0

---

## QUAND EFFECTUER UN ROLLBACK

Effectuer un rollback si après déploiement v1.0:

- ❌ Application ne démarre pas (crash loop ECS)
- ❌ Erreurs Prisma connection critiques
- ❌ Utilisateurs ne peuvent pas se connecter
- ❌ Données corrompues/perdues
- ❌ Features critiques cassées (inscription, paiements)

---

## ROLLBACK OPTION 1: CODE (Pas de DB changes)

**Si**: Déploiement code problématique, DB intacte

```bash
# 1. Redéployer version précédente (ECS)
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --task-definition spymeo-app:PREVIOUS_REVISION \
  --region eu-west-3

# 2. Vérifier déploiement
aws ecs describe-services \
  --cluster spymeo-production \
  --services spymeo-app \
  --region eu-west-3

# 3. Healthcheck
curl https://app.spymeo.fr/api/health
```

**Durée**: 5-10 minutes

---

## ROLLBACK OPTION 2: DATABASE (Restore snapshot)

**Si**: Migrations Prisma ont corrompu la DB

### Prérequis

- Snapshot DB créé AVANT migration (voir MIGRATION_NOTES.md)
- Nom snapshot: `spymeo-pre-migration-snapshot`

### Procédure

```bash
# 1. Créer snapshot DB actuelle (sécurité)
aws rds create-db-snapshot \
  --db-instance-identifier spymeo-production-db \
  --db-snapshot-identifier spymeo-failed-migration-$(date +%Y%m%d-%H%M%S) \
  --region eu-west-3

# 2. Restaurer snapshot pré-migration
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier spymeo-production-db-restored \
  --db-snapshot-identifier spymeo-pre-migration-snapshot \
  --region eu-west-3

# Attention: Créera NOUVELLE instance (pas écrasement)

# 3. Mettre à jour DATABASE_URL pour pointer vers DB restaurée
# (Dans AWS Secrets Manager + ECS task definition)

# 4. Redémarrer ECS service
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --force-new-deployment \
  --region eu-west-3

# 5. Vérifier connexion DB
curl https://app.spymeo.fr/api/health
```

**Durée**: 20-30 minutes (temps restauration RDS)

---

## ROLLBACK OPTION 3: COMPLET (Code + DB)

**Si**: Tout a échoué, retour état pré-v1.0

```bash
# 1. Rollback DB (Option 2 ci-dessus)

# 2. Rollback Code (Option 1 ci-dessus)

# 3. Rollback Secrets (si rotation effectuée)
# Restaurer anciens secrets depuis backup

# 4. Validation complète
npm run test:e2e  # Si tests E2E disponibles
```

**Durée**: 30-40 minutes

---

## VÉRIFICATIONS POST-ROLLBACK

- [ ] API health: `curl https://app.spymeo.fr/api/health` → 200
- [ ] Login admin fonctionne
- [ ] Dashboard admin accessible
- [ ] Inscription praticien fonctionne
- [ ] Pas d'erreurs logs CloudWatch

---

## CONTACT URGENCE

En cas de rollback nécessitant support:

- **DevOps**: [Contact DevOps]
- **DBA**: [Contact DBA]
- **On-call**: [Numéro on-call]

---

## PREVENTION ROLLBACK (Pour prochains déploiements)

1. **Blue/Green deployment**:
   - Déployer v1.1 sur environnement parallèle
   - Tester complètement
   - Basculer trafic (Route53 weighted routing)

2. **Canary deployment**:
   - Déployer v1.1 sur 10% instances
   - Monitorer erreurs 1 heure
   - Si OK, déployer sur 100%

3. **Backups automatiques**:
   - Snapshot RDS quotidien (déjà configuré)
   - ECR images taggées par version
   - Secrets Manager versioning activé

---

**FIN ROLLBACK PROCÉDURE**
