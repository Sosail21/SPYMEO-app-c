# Configuration CloudFront pour SPYMEO Assets

## Pourquoi CloudFront ?

✅ **Avantages** :
- Fichiers servis depuis le CDN mondial (latence réduite)
- Bucket S3 reste complètement privé (meilleure sécurité)
- Cache automatique (moins de coûts S3)
- HTTPS gratuit avec certificat AWS
- Pas besoin de Bucket Policy publique

## Étape 1 : Créer une distribution CloudFront

### Dans AWS Console

1. **Aller dans CloudFront** :
   - AWS Console → CloudFront → Create Distribution

2. **Configuration Origin** :
   - **Origin domain** : Sélectionner `spymeo-production-assets.s3.eu-west-3.amazonaws.com`
   - **Origin access** : **Origin access control settings (recommended)**
   - Cliquer sur "Create new OAC" (Origin Access Control)
     - Name : `spymeo-assets-oac`
     - Signing behavior : "Sign requests (recommended)"
     - Origin type : "S3"
     - Cliquer sur "Create"
   - **Enable Origin Shield** : No (sauf si beaucoup de trafic)

3. **Default cache behavior** :
   - **Viewer protocol policy** : "Redirect HTTP to HTTPS"
   - **Allowed HTTP methods** : "GET, HEAD" (les uploads passent directement par S3)
   - **Cache policy** : "CachingOptimized"
   - **Origin request policy** : None

4. **Settings** :
   - **Price class** : "Use all edge locations (best performance)"
   - **Alternate domain name (CNAME)** : Laisser vide pour l'instant (ou ajouter `assets.spymeo.fr`)
   - **Custom SSL certificate** : Laisser "Default CloudFront Certificate" (ou créer un certificat ACM si CNAME)
   - **Default root object** : Laisser vide

5. **Cliquer sur "Create distribution"**

⏱️ **Attendre 5-10 minutes** que la distribution soit déployée (Status: "Enabled")

## Étape 2 : Copier l'URL CloudFront

Une fois déployée, tu verras quelque chose comme :
- **Distribution domain name** : `d1234567890abcd.cloudfront.net`

Copie cette URL, tu en auras besoin pour la configuration.

## Étape 3 : Mettre à jour la Bucket Policy S3

CloudFront va te proposer une Bucket Policy à copier. Sinon, voici la politique :

1. Aller dans **S3** → Bucket **spymeo-production-assets** → **Permissions** → **Bucket Policy**

2. Coller cette politique (remplacer `DISTRIBUTION-ID` par ton ID CloudFront) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spymeo-production-assets/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT-ID:distribution/DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

**Pour trouver ces valeurs** :
- **ACCOUNT-ID** : Ton compte AWS (ex: 123456789012)
- **DISTRIBUTION-ID** : ID de la distribution CloudFront (ex: E1234567890ABC)

Tu peux aussi copier directement la politique depuis CloudFront :
- Aller dans la distribution → Origins → Cliquer sur ton origin → Tu verras un bouton "Copy policy"

## Étape 4 : Ajouter la variable d'environnement

### En local (.env.local)

```env
CLOUDFRONT_DOMAIN=d1234567890abcd.cloudfront.net
```

### En production (AWS ECS Task Definition)

Ajouter la variable d'environnement dans la Task Definition :
```
Name: CLOUDFRONT_DOMAIN
Value: d1234567890abcd.cloudfront.net
```

Puis redéployer le service ECS.

## Étape 5 : Vérifier le code

Le code a été mis à jour pour utiliser CloudFront automatiquement si `CLOUDFRONT_DOMAIN` est défini.

Les URLs retournées seront maintenant :
```
https://d1234567890abcd.cloudfront.net/blog/admin/123456_image.png
```

Au lieu de :
```
https://spymeo-production-assets.s3.eu-west-3.amazonaws.com/blog/admin/123456_image.png
```

## Étape 6 : Tester

1. Uploader une nouvelle image de blog
2. L'URL retournée devrait être une URL CloudFront
3. L'image devrait s'afficher instantanément (pas de 403)
4. Les anciennes URLs S3 ne fonctionneront plus (sauf si tu gardes une Bucket Policy publique)

## Configuration avancée (optionnel)

### Ajouter un domaine personnalisé

Si tu veux utiliser `assets.spymeo.fr` au lieu de `d1234567890abcd.cloudfront.net` :

1. **Créer un certificat SSL dans ACM** (AWS Certificate Manager) :
   - Région : **US East (N. Virginia)** (obligatoire pour CloudFront)
   - Domaine : `assets.spymeo.fr`
   - Valider via DNS (ajouter un CNAME dans Route53 ou ton DNS)

2. **Modifier la distribution CloudFront** :
   - Alternate domain names : `assets.spymeo.fr`
   - Custom SSL certificate : Sélectionner le certificat ACM créé

3. **Ajouter un CNAME DNS** :
   - Type : CNAME
   - Name : `assets`
   - Value : `d1234567890abcd.cloudfront.net`

4. **Mettre à jour la variable d'environnement** :
   ```
   CLOUDFRONT_DOMAIN=assets.spymeo.fr
   ```

### Invalider le cache

Si tu modifies un fichier déjà en cache :

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/blog/*"
```

Ou via la console : CloudFront → Distribution → Invalidations → Create invalidation

## Coûts

CloudFront est **très peu cher** pour un usage normal :
- Premiers 10 TB/mois : ~$0.085/GB
- Requêtes HTTPS : $0.01 par 10,000 requêtes
- Cache gratuit

Exemple : 1000 images de 500KB chaque = 500MB = ~$0.04/mois

## Dépannage

### Les images ne s'affichent pas (404)

- Vérifie que la distribution est "Enabled" et déployée
- Vérifie que `CLOUDFRONT_DOMAIN` est correctement configuré
- Vérifie les logs CloudFront

### 403 Forbidden

- Vérifie la Bucket Policy S3 (elle doit autoriser CloudFront)
- Vérifie que l'OAC est bien configuré

### Cache trop agressif

- Créer une invalidation CloudFront pour forcer la mise à jour
- Ou attendre l'expiration du cache (24h par défaut)
