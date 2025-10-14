# Cdw-Spm: SPYMEO Infrastructure as Code (Terraform)

Infrastructure AWS pour SPYMEO V1, déployée en région **eu-west-3 (Paris)** avec conformité HDS-like.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront                           │
│                    (CDN + WAF + HTTPS)                      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │                              │
         ┌─────▼──────┐              ┌────────▼────────┐
         │    ALB     │              │   S3 Bucket     │
         │  (HTTPS)   │              │   (Assets)      │
         └─────┬──────┘              └─────────────────┘
               │
               │
         ┌─────▼──────────────────────────────────────┐
         │           ECS Fargate                      │
         │  ┌──────┐  ┌──────┐  ┌──────┐             │
         │  │ Task │  │ Task │  │ Task │  (Next.js)  │
         │  └──────┘  └──────┘  └──────┘             │
         └─────┬──────────────────────────────────────┘
               │
               │
         ┌─────▼──────────────────────────────────────┐
         │   RDS PostgreSQL 15+ (Multi-AZ)           │
         │   - Encrypted at rest                     │
         │   - Automated backups (30 days)           │
         │   - Performance Insights                  │
         └───────────────────────────────────────────┘
```

## Composants

### VPC & Networking
- VPC avec sous-réseaux publics et privés sur 3 AZ
- NAT Gateway pour accès internet depuis subnets privés
- Security Groups avec principe du moindre privilège

### RDS PostgreSQL
- Version 15.x
- Chiffrement at-rest activé (AWS KMS)
- Backups automatiques (30 jours)
- Multi-AZ en production
- Performance Insights pour monitoring
- Logs CloudWatch (postgresql, upgrade)

### ECS Fargate
- Cluster ECS avec tasks Fargate
- Application Load Balancer (HTTPS uniquement)
- Auto-scaling basé sur CPU/Memory
- Health checks configurés
- Logs CloudWatch centralisés

### S3
- Bucket pour assets statiques
- Versioning activé
- Chiffrement SSE-S3 activé
- Lifecycle policies (archivage Glacier après 365j)
- CORS configuré pour uploads frontend

### CloudFront
- Distribution CDN globale
- Certificat SSL/TLS (ACM)
- WAF activé en production
- Cache optimisé pour Next.js
- Security headers

### Monitoring & Alertes
- CloudWatch Logs avec rétention 365j (prod) / 30j (staging)
- CloudWatch Alarms (CPU, Memory, RDS)
- SNS pour notifications email
- Performance Insights (RDS)

## Prérequis

1. **Terraform** >= 1.5.0
   ```bash
   # Installation
   brew install terraform  # macOS
   choco install terraform # Windows
   ```

2. **AWS CLI** configuré
   ```bash
   aws configure
   # AWS Access Key ID: YOUR_KEY
   # AWS Secret Access Key: YOUR_SECRET
   # Default region: eu-west-3
   ```

3. **Certificat SSL** dans ACM (eu-west-3)
   - Créer un certificat pour votre domaine dans AWS Certificate Manager
   - Valider le domaine (DNS ou email)
   - Noter l'ARN du certificat

4. **Variables d'environnement**
   ```bash
   export TF_VAR_db_password="YOUR_STRONG_PASSWORD"
   export TF_VAR_nextauth_secret="$(openssl rand -base64 32)"
   ```

## Déploiement

### 1. Initialiser Terraform

```bash
cd terraform
terraform init
```

### 2. Créer le fichier de variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Éditer terraform.tfvars avec vos valeurs
```

### 3. Planifier les changements

```bash
terraform plan -out=tfplan
```

### 4. Appliquer l'infrastructure

```bash
terraform apply tfplan
```

⏱️ **Durée estimée**: 15-20 minutes

### 5. Récupérer les outputs

```bash
terraform output
```

Outputs importants:
- `alb_dns_name`: DNS de l'ALB (pour test avant CloudFront)
- `cloudfront_domain_name`: URL CloudFront
- `s3_bucket_name`: Nom du bucket S3
- `rds_endpoint`: Endpoint RDS (sensible)

## Configuration DNS

Après déploiement, configurer un CNAME ou ALIAS dans votre DNS:

```
# Route 53
spymeo.com  ALIAS  d1234abc.cloudfront.net

# Autre DNS
spymeo.com  CNAME  d1234abc.cloudfront.net
```

## Modules

### `modules/vpc`
VPC avec subnets publics/privés, NAT Gateway, Internet Gateway

### `modules/rds`
RDS PostgreSQL 15+ avec chiffrement, backups, Multi-AZ

### `modules/ecs`
ECS Fargate avec ALB, Auto Scaling, CloudWatch Logs

### `modules/s3`
Bucket S3 avec versioning, chiffrement, lifecycle policies

### `modules/cloudfront`
Distribution CloudFront avec WAF, HTTPS, cache optimisé

## Environnements

### Staging
```bash
terraform workspace new staging
terraform workspace select staging
terraform apply -var-file=environments/staging/terraform.tfvars
```

### Production
```bash
terraform workspace new production
terraform workspace select production
terraform apply -var-file=environments/production/terraform.tfvars
```

## Sécurité & Conformité HDS

- ✅ Chiffrement at-rest (RDS, S3)
- ✅ Chiffrement in-transit (HTTPS obligatoire)
- ✅ Backups automatiques (30 jours)
- ✅ Logs centralisés (CloudWatch)
- ✅ Monitoring & alertes
- ✅ Multi-AZ pour HA
- ✅ Security Groups restrictifs
- ✅ Secrets dans AWS Secrets Manager
- ✅ IAM Roles avec principe du moindre privilège

## Coûts estimés

### Production (eu-west-3)
- ECS Fargate (2 tasks, 0.5 vCPU, 1GB): ~$35/mois
- RDS PostgreSQL (db.t4g.medium, 50GB): ~$90/mois
- ALB: ~$22/mois
- S3 (100GB + requêtes): ~$5/mois
- CloudFront (1TB transfert): ~$85/mois
- NAT Gateway: ~$35/mois
- **Total estimé: ~$270-300/mois**

### Staging
- ECS Fargate (1 task, 0.25 vCPU, 512MB): ~$12/mois
- RDS PostgreSQL (db.t4g.small, 20GB): ~$40/mois
- ALB: ~$22/mois
- S3 (10GB): ~$1/mois
- CloudFront (100GB): ~$9/mois
- NAT Gateway: ~$35/mois
- **Total estimé: ~$120-150/mois**

💡 **Optimisations possibles**:
- Utiliser Fargate Spot pour staging (-70%)
- Reserved Instances RDS (-40%)
- S3 Intelligent-Tiering

## Maintenance

### Mettre à jour l'infrastructure
```bash
terraform plan
terraform apply
```

### Détruire l'infrastructure
```bash
terraform destroy
```

⚠️ **ATTENTION**: Vérifier que les backups RDS sont bien sauvegardés avant destruction!

## Troubleshooting

### ECS Tasks ne démarrent pas
```bash
# Vérifier les logs
aws logs tail /ecs/spymeo-production --follow

# Vérifier le health check
aws elbv2 describe-target-health --target-group-arn <ARN>
```

### RDS connection timeout
```bash
# Vérifier les security groups
# Le SG de l'ECS doit être autorisé sur le port 5432 du RDS
```

### CloudFront cache issues
```bash
# Invalider le cache
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## Support

- 📧 Email: ops@spymeo.com
- 📖 Wiki: https://wiki.spymeo.com/infrastructure
- 🐛 Issues: https://github.com/spymeo/infrastructure/issues

## Licence

© 2025 SPYMEO - Tous droits réservés
