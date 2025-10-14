# Cdw-Spm: Checklist Go-Live SPYMEO V1

> Checklist complète pour le lancement en production de SPYMEO V1

## 📋 Table des matières

1. [Pré-déploiement](#pré-déploiement)
2. [Infrastructure](#infrastructure)
3. [Application](#application)
4. [Base de données](#base-de-données)
5. [Sécurité](#sécurité)
6. [Monitoring](#monitoring)
7. [Tests](#tests)
8. [DNS & Domaine](#dns--domaine)
9. [Performance](#performance)
10. [Documentation](#documentation)
11. [Communication](#communication)
12. [Post-déploiement](#post-déploiement)

---

## 🚀 Pré-déploiement

### Environnements

- [ ] **Staging** : Environnement de test configuré et fonctionnel
- [ ] **Production** : Environnement de production créé
- [ ] **Variables d'environnement** : Toutes les variables configurées
- [ ] **Secrets** : AWS Secrets Manager configuré
- [ ] **Feature flags** : ENABLE_PASS, ENABLE_ACADEMY définis

### Code & Qualité

- [ ] **Build** : `npm run build` réussit sans erreurs
- [ ] **Linting** : `npm run lint` passe sans erreurs
- [ ] **Type checking** : `npx tsc --noEmit` sans erreurs
- [ ] **Tests unitaires** : ≥70% coverage
- [ ] **Tests e2e** : Tous les parcours critiques testés
- [ ] **Security audit** : `npm audit` sans vulnérabilités critiques
- [ ] **Lighthouse scores** : ≥90 sur toutes les pages principales

---

## ☁️ Infrastructure

### AWS Account

- [ ] **Compte AWS** : Compte production créé et configuré
- [ ] **Région** : eu-west-3 (Paris) sélectionnée
- [ ] **IAM** : Utilisateurs et rôles créés avec moindre privilège
- [ ] **Billing alerts** : Alertes configurées

### Terraform

- [ ] **Terraform init** : `terraform init` exécuté
- [ ] **Terraform plan** : Aucune erreur dans le plan
- [ ] **Terraform apply** : Infrastructure déployée avec succès
- [ ] **State backend** : S3 + DynamoDB configurés
- [ ] **Outputs** : Tous les outputs importants récupérés

### VPC & Networking

- [ ] **VPC** : Créé avec subnets publics/privés
- [ ] **NAT Gateway** : Configuré pour subnets privés
- [ ] **Security Groups** : Configurés avec règles restrictives
- [ ] **Route tables** : Routes correctement configurées

### ECS Fargate

- [ ] **Cluster ECS** : Créé
- [ ] **Task Definition** : Configurée avec ressources appropriées
- [ ] **Service** : Déployé avec auto-scaling
- [ ] **ALB** : Configuré avec health checks
- [ ] **Target Group** : Health checks OK
- [ ] **Logs** : CloudWatch Logs configurés

### RDS PostgreSQL

- [ ] **Instance RDS** : Créée (Multi-AZ en production)
- [ ] **Chiffrement** : Activé (at-rest)
- [ ] **Backups** : Configurés (30 jours)
- [ ] **Performance Insights** : Activé
- [ ] **Parameter Group** : Optimisé pour PostgreSQL 15
- [ ] **Security Group** : Accessible uniquement depuis ECS
- [ ] **Snapshots** : Premier snapshot manuel créé

### S3

- [ ] **Bucket** : Créé avec nom unique
- [ ] **Chiffrement** : SSE-S3 activé
- [ ] **Versioning** : Activé
- [ ] **Lifecycle policies** : Configurées
- [ ] **CORS** : Configuré pour uploads frontend
- [ ] **Bucket policy** : Accès public lecture si nécessaire

### CloudFront

- [ ] **Distribution** : Créée
- [ ] **Origins** : ALB + S3 configurés
- [ ] **SSL/TLS** : Certificat ACM associé
- [ ] **WAF** : Activé (production)
- [ ] **Cache behaviors** : Configurés
- [ ] **Custom error responses** : Configurées

---

## 💻 Application

### Docker

- [ ] **Dockerfile** : Testé et optimisé
- [ ] **Image** : Buildée et pushée sur registry
- [ ] **Health check** : Endpoint `/api/health` fonctionnel
- [ ] **Size** : Image optimisée (<500MB)

### Configuration

- [ ] **next.config.mjs** : Configuration production OK
- [ ] **Security headers** : Configurés
- [ ] **Output** : `standalone` activé
- [ ] **Image domains** : S3 bucket configuré

### Environment Variables

- [ ] `DATABASE_URL` : Configurée
- [ ] `NEXTAUTH_URL` : Configurée
- [ ] `NEXTAUTH_SECRET` : Secret fort généré
- [ ] `AWS_REGION` : eu-west-3
- [ ] `S3_BUCKET_NAME` : Configuré
- [ ] `NODE_ENV` : production

---

## 🗄️ Base de données

### Prisma

- [ ] **Schema** : Validé et complet
- [ ] **Migrations** : Testées sur staging
- [ ] **Client** : Généré (`npx prisma generate`)
- [ ] **Deploy** : Migrations appliquées sur production

### Data

- [ ] **Seed** : Données initiales (si nécessaire)
- [ ] **Backup** : Premier backup manuel créé
- [ ] **Users** : Compte admin créé
- [ ] **Test data** : Données de test supprimées

---

## 🔒 Sécurité

### SSL/TLS

- [ ] **Certificat ACM** : Créé et validé
- [ ] **HTTPS** : Obligatoire partout
- [ ] **TLS version** : ≥1.2
- [ ] **HSTS** : Activé

### Secrets & Keys

- [ ] **AWS Secrets Manager** : Tous les secrets configurés
- [ ] **API Keys** : Rotées avant production
- [ ] **Database password** : Fort et unique
- [ ] **JWT secret** : Fort et unique
- [ ] **Stripe keys** : Production keys configurées

### RBAC

- [ ] **Middleware** : Protection des routes testée
- [ ] **Roles** : Tous les rôles définis
- [ ] **Permissions** : Testées pour chaque rôle
- [ ] **Admin account** : Créé et testé

### Headers

- [ ] `Strict-Transport-Security`
- [ ] `X-Frame-Options`
- [ ] `X-Content-Type-Options`
- [ ] `X-XSS-Protection`
- [ ] `Referrer-Policy`
- [ ] `Content-Security-Policy` (si applicable)

---

## 📊 Monitoring

### CloudWatch

- [ ] **Logs Groups** : Créés avec rétention 365j
- [ ] **Alarms** : CPU, Memory, RDS configurés
- [ ] **SNS Topic** : Créé pour alertes
- [ ] **Email subscriptions** : Configurées
- [ ] **Dashboard** : Créé avec métriques clés

### Application Monitoring

- [ ] **Sentry** : Configuré (optionnel)
- [ ] **Performance monitoring** : Activé
- [ ] **Error tracking** : Testé

### Alertes configurées

- [ ] ECS CPU > 80%
- [ ] ECS Memory > 80%
- [ ] RDS CPU > 80%
- [ ] RDS Storage < 20%
- [ ] ALB 5xx errors > 10
- [ ] RDS connections > 80%

---

## 🧪 Tests

### Tests automatisés

- [ ] **Unit tests** : ≥70% coverage
- [ ] **E2E tests** : Tous les parcours passent
- [ ] **API tests** : Tous les endpoints testés
- [ ] **Security tests** : Snyk scan OK

### Tests manuels

- [ ] **Inscription** : FREE_USER
- [ ] **Inscription** : PASS_USER
- [ ] **Connexion/Déconnexion**
- [ ] **Profil praticien**
- [ ] **Prise de RDV**
- [ ] **Upload documents**
- [ ] **Messagerie**
- [ ] **Précompta**
- [ ] **Admin** : Modération blog
- [ ] **Mobile** : Tests sur iOS/Android

### Performance

- [ ] **Load testing** : 100 users simultanés
- [ ] **Stress testing** : Pic de charge
- [ ] **Response time** : <200ms (p95)
- [ ] **Database queries** : Optimisées (N+1 vérifiés)

---

## 🌐 DNS & Domaine

### Domaine

- [ ] **Nom de domaine** : Acheté et configuré
- [ ] **DNS Provider** : Route 53 ou autre
- [ ] **DNSSEC** : Activé (recommandé)

### Records DNS

- [ ] **A/ALIAS record** : `spymeo.com` → CloudFront
- [ ] **CNAME record** : `www.spymeo.com` → `spymeo.com`
- [ ] **CNAME record** : `staging.spymeo.com` (si applicable)
- [ ] **MX records** : Email configurés (si applicable)
- [ ] **SPF record** : Configuré pour AWS SES
- [ ] **DKIM** : Configuré pour AWS SES
- [ ] **DMARC** : Configuré

### Vérifications

- [ ] **DNS propagation** : Vérifié (https://dnschecker.org)
- [ ] **SSL certificate** : Valide sur tous les sous-domaines
- [ ] **HTTPS redirect** : HTTP → HTTPS fonctionne

---

## ⚡ Performance

### Optimisations

- [ ] **Images** : WebP/AVIF avec Next.js Image
- [ ] **Fonts** : Optimisées et préchargées
- [ ] **CSS** : Minifié et inlined
- [ ] **JS** : Code splitting activé
- [ ] **Compression** : Gzip/Brotli activé

### Lighthouse Scores

- [ ] **Performance** : ≥90
- [ ] **Accessibility** : ≥90
- [ ] **Best Practices** : ≥90
- [ ] **SEO** : ≥90

### Cache

- [ ] **CloudFront cache** : Configuré
- [ ] **Cache headers** : Définis
- [ ] **Cache invalidation** : Testé

---

## 📚 Documentation

### Technique

- [ ] **README.md** : Complet et à jour
- [ ] **ARCHITECTURE.md** : Créé
- [ ] **API.md** : Endpoints documentés
- [ ] **SECURITY.md** : Bonnes pratiques
- [ ] **RUNBOOK.md** : Procédures ops

### Ops

- [ ] **Runbook** : Procédures de déploiement
- [ ] **Rollback plan** : Documenté
- [ ] **Incident response** : Plan défini
- [ ] **Contacts** : Liste à jour

---

## 📣 Communication

### Interne

- [ ] **Équipe** : Briefing Go-Live
- [ ] **Planning** : Date et heure communiquées
- [ ] **Astreinte** : Roulement défini

### Externe (si applicable)

- [ ] **Annonce** : Post blog/réseau sociaux
- [ ] **Email** : Utilisateurs beta prévenus
- [ ] **Press release** : Préparé

---

## 🚀 Post-déploiement

### J+0 (Jour du lancement)

- [ ] **Smoke tests** : Toutes les pages principales OK
- [ ] **Health checks** : Tous les services UP
- [ ] **Metrics** : Dashboards surveillés
- [ ] **Errors** : Aucune erreur critique
- [ ] **Team** : Disponible pendant 2-4h

### J+1 (Lendemain)

- [ ] **Metrics review** : Analyser les métriques
- [ ] **Error logs** : Vérifier CloudWatch/Sentry
- [ ] **User feedback** : Collecter les retours
- [ ] **Performance** : Vérifier temps de réponse

### J+7 (Une semaine)

- [ ] **Postmortem** : Réunion bilan
- [ ] **Incidents** : Documentation complète
- [ ] **Optimizations** : Liste des améliorations
- [ ] **Roadmap** : V1.1 planifiée

### Suivi continu

- [ ] **Daily metrics** : Review quotidienne
- [ ] **Weekly reports** : Rapport hebdomadaire
- [ ] **User feedback** : Collecte continue
- [ ] **Bug fixes** : Triés et priorisés

---

## ✅ Validation finale

### Checklist générale

- [ ] **Infrastructure** : 100% opérationnelle
- [ ] **Application** : Déployée et stable
- [ ] **Database** : Backup récent OK
- [ ] **Monitoring** : Alertes opérationnelles
- [ ] **DNS** : Propagé et vérifié
- [ ] **SSL** : Valide
- [ ] **Performance** : Lighthouse ≥90
- [ ] **Security** : Audit passé
- [ ] **Tests** : Tous passés
- [ ] **Documentation** : Complète

### Sign-off

- [ ] **Tech Lead** : ___________________
- [ ] **DevOps** : ___________________
- [ ] **Product Owner** : ___________________
- [ ] **CEO** : ___________________

**Date de Go-Live** : ___________________

---

## 🆘 Rollback Plan

En cas de problème critique :

1. **Identifier** : Nature du problème
2. **Décision** : Go/No-Go dans les 15 minutes
3. **Rollback** :
   ```bash
   # Revenir à la version précédente
   aws ecs update-service \
     --cluster spymeo-production \
     --service spymeo-app \
     --task-definition spymeo-app:PREVIOUS_VERSION
   ```
4. **Communication** : Email + Slack
5. **Postmortem** : Dans les 24h

---

## 📞 Contacts d'urgence

- **Tech Lead** : [Nom] - [Téléphone]
- **DevOps** : [Nom] - [Téléphone]
- **AWS Support** : Premium Support activé
- **Sentry** : support@sentry.io
- **Slack** : #tech-spymeo #incidents

---

**✨ Bonne chance pour le lancement de SPYMEO V1 ! ✨**
