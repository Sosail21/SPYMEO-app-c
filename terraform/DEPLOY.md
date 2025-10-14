# Cdw-Spm: Guide de déploiement Terraform SPYMEO V1

Ce guide vous accompagne dans le déploiement de l'infrastructure AWS pour SPYMEO V1.

## 📋 Prérequis

### 1. Outils installés

```bash
# Terraform
terraform --version  # ≥ 1.5.0

# AWS CLI
aws --version  # ≥ 2.0

# Vérifier la configuration AWS
aws sts get-caller-identity
```

### 2. Compte AWS

- [ ] Compte AWS créé
- [ ] IAM User avec permissions AdministratorAccess (ou custom policy)
- [ ] AWS CLI configuré (`aws configure`)
- [ ] Région eu-west-3 (Paris)

### 3. Certificat SSL

**Important** : Le certificat pour CloudFront doit être créé dans **us-east-1** !

```bash
# Via AWS Console
1. Aller dans ACM (Certificate Manager) en us-east-1
2. Request certificate
3. Domain: spymeo.com
4. Alternative names: *.spymeo.com
5. Validation: DNS (recommandé)
6. Copier l'ARN du certificat
```

Ou via CLI :

```bash
aws acm request-certificate \
  --domain-name spymeo.com \
  --subject-alternative-names *.spymeo.com \
  --validation-method DNS \
  --region us-east-1
```

### 4. Variables d'environnement

```bash
# Secrets (ne PAS commiter)
export TF_VAR_db_password="YOUR_STRONG_PASSWORD"
export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"
```

## 🚀 Déploiement Staging

### Étape 1 : Préparation

```bash
cd terraform

# Copier le fichier de variables
cp environments/staging/terraform.tfvars.example terraform.tfvars

# Éditer avec vos valeurs
nano terraform.tfvars
```

**Variables à modifier** :

- `certificate_arn` : ARN de votre certificat ACM
- `db_password` : Mot de passe fort pour PostgreSQL
- `nextauth_secret` : Secret aléatoire fort
- `container_image` : URL de votre image Docker
- `alert_emails` : Liste des emails pour les alertes

### Étape 2 : Initialisation

```bash
terraform init
```

Cela va :
- Télécharger les providers AWS
- Initialiser les modules
- Préparer le backend

### Étape 3 : Planification

```bash
terraform plan -out=tfplan
```

**Vérifier** :
- [ ] VPC avec subnets
- [ ] RDS PostgreSQL
- [ ] ECS Cluster + Service
- [ ] ALB
- [ ] S3 Bucket
- [ ] CloudFront
- [ ] Security Groups
- [ ] IAM Roles

**Ressources attendues** : ~50-60 ressources

### Étape 4 : Application

```bash
terraform apply tfplan
```

⏱️ **Durée** : 15-20 minutes

### Étape 5 : Récupération des outputs

```bash
terraform output

# Ou pour une valeur spécifique
terraform output alb_dns_name
terraform output cloudfront_domain_name
```

**Outputs importants** :

```bash
alb_dns_name = "spymeo-staging-alb-123456789.eu-west-3.elb.amazonaws.com"
cloudfront_domain_name = "d1234abcd.cloudfront.net"
s3_bucket_name = "spymeo-staging-assets"
```

### Étape 6 : Test de l'ALB

```bash
# Test direct de l'ALB (avant DNS)
curl https://$(terraform output -raw alb_dns_name)/api/health

# Résultat attendu
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "uptime": 123.45,
  "environment": "staging"
}
```

## 🌍 Déploiement Production

### Différences avec Staging

**Production a** :
- RDS Multi-AZ
- Instances plus robustes
- 2+ ECS tasks
- WAF activé
- Deletion protection
- Alertes à plusieurs emails

### Étapes

```bash
# 1. Copier les variables de production
cp environments/production/terraform.tfvars.example terraform.tfvars

# 2. Éditer avec les valeurs de production
nano terraform.tfvars

# 3. Variables critiques
# - db_password: DIFFÉRENT de staging
# - nextauth_secret: DIFFÉRENT de staging
# - domain_name: spymeo.com (sans staging.)

# 4. Plan
terraform plan -out=tfplan

# 5. Review attentif !
# Vérifier : Multi-AZ, WAF, desired_count=2, etc.

# 6. Apply
terraform apply tfplan
```

## 🔧 Configuration DNS

Après déploiement, configurer le DNS :

### Route 53 (recommandé)

```bash
# Récupérer les infos CloudFront
CF_DOMAIN=$(terraform output -raw cloudfront_domain_name)
CF_ZONE_ID=$(terraform output -raw cloudfront_hosted_zone_id)

# Créer l'enregistrement ALIAS
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "spymeo.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "'$CF_ZONE_ID'",
          "DNSName": "'$CF_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### Autre DNS

Créer un CNAME :

```
Type: CNAME
Name: spymeo.com
Value: d1234abcd.cloudfront.net
TTL: 300
```

### Vérification

```bash
# Attendre la propagation DNS (1-5 minutes)
dig spymeo.com

# Test HTTPS
curl https://spymeo.com/api/health
```

## 🗄️ Base de données

### Connexion

```bash
# Récupérer l'endpoint
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Se connecter
psql -h $RDS_ENDPOINT -U spymeo_admin -d spymeo

# Ou via bastion/tunnel SSH si pas d'accès direct
```

### Migrations Prisma

```bash
# Dans votre projet Next.js
export DATABASE_URL="postgresql://spymeo_admin:PASSWORD@$RDS_ENDPOINT/spymeo"

# Appliquer les migrations
npx prisma migrate deploy

# Vérifier
npx prisma studio
```

## 📊 Monitoring

### CloudWatch

```bash
# Dashboard URL
echo "https://console.aws.amazon.com/cloudwatch/home?region=eu-west-3#dashboards:"

# Logs ECS
echo "https://console.aws.amazon.com/cloudwatch/home?region=eu-west-3#logsV2:log-groups/log-group//ecs/spymeo-production"
```

### Alarmes configurées

- ECS CPU > 80%
- ECS Memory > 80%
- RDS CPU > 80%
- RDS Storage < 10GB
- RDS Connections > 80

## 🔄 Mises à jour

### Mise à jour de l'application

```bash
# 1. Build nouvelle image Docker
docker build -t spymeo:v1.1.0 .

# 2. Push vers ECR
aws ecr get-login-password --region eu-west-3 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.eu-west-3.amazonaws.com

docker tag spymeo:v1.1.0 ACCOUNT_ID.dkr.ecr.eu-west-3.amazonaws.com/spymeo:latest
docker push ACCOUNT_ID.dkr.ecr.eu-west-3.amazonaws.com/spymeo:latest

# 3. Force new deployment
aws ecs update-service \
  --cluster spymeo-production \
  --service spymeo-app \
  --force-new-deployment \
  --region eu-west-3

# 4. Suivre le déploiement
aws ecs wait services-stable \
  --cluster spymeo-production \
  --services spymeo-app \
  --region eu-west-3
```

### Mise à jour de l'infrastructure

```bash
# 1. Modifier les fichiers Terraform

# 2. Plan
terraform plan -out=tfplan

# 3. Review des changements

# 4. Apply
terraform apply tfplan
```

## 🧹 Nettoyage

### Staging

```bash
terraform destroy

# Confirmation requise
# yes
```

### Production

**⚠️ ATTENTION** : Vérifier les backups avant !

```bash
# 1. Vérifier les snapshots RDS
aws rds describe-db-snapshots \
  --db-instance-identifier spymeo-production-db

# 2. Créer un snapshot manuel
aws rds create-db-snapshot \
  --db-instance-identifier spymeo-production-db \
  --db-snapshot-identifier spymeo-production-final-$(date +%Y%m%d)

# 3. Destroy (avec protection)
terraform destroy

# Si deletion_protection=true, le RDS ne sera pas détruit
# Désactiver manuellement si nécessaire
```

## 🆘 Troubleshooting

### ECS tasks ne démarrent pas

```bash
# Vérifier les logs
aws logs tail /ecs/spymeo-production --follow

# Vérifier les events
aws ecs describe-services \
  --cluster spymeo-production \
  --services spymeo-app \
  --query 'services[0].events[0:5]'
```

### RDS inaccessible

```bash
# Vérifier le security group
aws ec2 describe-security-groups \
  --group-ids $(terraform output -raw rds_security_group_id)

# Le SG doit autoriser le port 5432 depuis le SG de l'ECS
```

### CloudFront 502/504

```bash
# Vérifier le health check de l'ALB
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw target_group_arn)

# Target health doit être "healthy"
```

### "Error acquiring state lock"

```bash
# Si le lock est bloqué
terraform force-unlock LOCK_ID

# Ou supprimer l'item DynamoDB (dernier recours)
aws dynamodb delete-item \
  --table-name terraform-state-lock \
  --key '{"LockID": {"S": "spymeo-production/terraform.tfstate"}}'
```

## 📚 Ressources

- **Terraform AWS Provider** : https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **AWS ECS Best Practices** : https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/
- **RDS PostgreSQL** : https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html
- **CloudFront** : https://docs.aws.amazon.com/cloudfront/

## 📞 Support

- Email : ops@spymeo.com
- Slack : #infra-spymeo

---

**Bonne chance pour le déploiement ! 🚀**
