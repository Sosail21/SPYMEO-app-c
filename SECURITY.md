# 🔒 SPYMEO Security Documentation

## 🚨 ALERTE CRITIQUE : Credentials exposées détectées

### Problème identifié

Le fichier `.env` contient des credentials de production en clair :
```
DATABASE_URL="postgresql://spymeo_admin:SpymeoSecure2025!@spymeo-production-db...
```

### Actions immédiates requises

#### 1. Rotation du mot de passe RDS (URGENT)

```bash
# Via AWS Console
# RDS > Databases > spymeo-production-db > Modify > Master password
# OU via CLI:
aws rds modify-db-instance \
  --db-instance-identifier spymeo-production-db \
  --master-user-password "NOUVEAU_MOT_DE_PASSE_FORT" \
  --apply-immediately \
  --region eu-west-3
```

#### 2. Stocker le nouveau mot de passe dans AWS Secrets Manager

```bash
# Créer le secret
aws secretsmanager create-secret \
  --name spymeo-production-db-password \
  --description "RDS password for SPYMEO production" \
  --secret-string "NOUVEAU_MOT_DE_PASSE_FORT" \
  --region eu-west-3

# Construire DATABASE_URL depuis Secrets Manager dans ECS
# Voir terraform/main.tf pour l'implémentation
```

#### 3. Mettre à jour la task definition ECS

Le Terraform est déjà configuré pour utiliser Secrets Manager (voir `terraform/main.tf` L125-131).
Il faut mettre à jour la référence au secret :

```hcl
secrets = [
  {
    name      = "DATABASE_URL"
    valueFrom = "arn:aws:secretsmanager:eu-west-3:ACCOUNT_ID:secret:spymeo-production-db-password"
  }
]
```

#### 4. Purger le fichier .env local

```bash
# NE JAMAIS committer .env avec des secrets
# Ajouter à .gitignore (déjà fait)
echo "⚠️ .env purgé - utiliser .env.example"
cp .env.example .env
# Éditer .env avec vos valeurs locales de dev
```

#### 5. Rotation du NEXTAUTH_SECRET

```bash
# Générer un nouveau secret
NEW_SECRET=$(openssl rand -base64 32)

# Stocker dans Secrets Manager
aws secretsmanager put-secret-value \
  --secret-id spymeo-production-nextauth-secret \
  --secret-string "$NEW_SECRET" \
  --region eu-west-3
```

## 🛡️ Bonnes pratiques de sécurité

### Environnement local (développement)

- Utiliser `.env.example` comme template
- `.env` est dans `.gitignore` (ne JAMAIS committer)
- Utiliser des credentials de dev/test, jamais de production

### Environnement ECS (production)

- **DATABASE_URL** : Construire depuis Secrets Manager avec user/pass
- **NEXTAUTH_SECRET** : Depuis Secrets Manager (déjà configuré)
- **AWS credentials** : Utiliser IAM roles (task execution role), pas de clés
- **S3_BUCKET_NAME** : Variable d'environnement standard (non sensible)

### GitHub Actions CI/CD

- Utiliser OIDC (OpenID Connect) pour authentification AWS, pas de clés
- Secrets stockés dans GitHub Secrets :
  - `AWS_ROLE_ARN` (pour OIDC assume role)
  - Pas de `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`

### Audit régulier

- Rotation des secrets tous les 90 jours minimum
- git-secrets installé pour scan pre-commit (TODO)
- GitHub secret scanning activé (vérifier dans Settings > Security)

## 🔍 Checklist de vérification

- [ ] Mot de passe RDS roté
- [ ] Nouveau password dans Secrets Manager
- [ ] ECS task definition mise à jour
- [ ] NEXTAUTH_SECRET roté
- [ ] .env local purgé (pas de prod secrets)
- [ ] git-secrets installé et configuré
- [ ] GitHub secret scanning activé
- [ ] Documentation équipe mise à jour

## 📚 Références

- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [ECS Secrets](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-secrets.html)
- [git-secrets](https://github.com/awslabs/git-secrets)
