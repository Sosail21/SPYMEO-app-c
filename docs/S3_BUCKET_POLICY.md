# Configuration S3 pour les uploads publics

## Problème
Les fichiers uploadés (images de blog, etc.) doivent être accessibles publiquement, mais le bucket `spymeo-production-assets` a "Object Ownership: Bucket owner enforced" activé, ce qui désactive les ACLs.

## Solution : Bucket Policy

Aller dans AWS Console → S3 → Bucket `spymeo-production-assets` → Permissions → Bucket Policy

Ajouter cette politique (remplacer `spymeo-production-assets` par le nom réel du bucket si différent) :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::spymeo-production-assets/*"
    }
  ]
}
```

Cette politique permet à tous les utilisateurs de lire (télécharger) n'importe quel fichier du bucket, tout en gardant les uploads sécurisés (seule l'application avec les credentials IAM peut uploader).

## Alternative : CloudFront (recommandé pour la production)

Pour de meilleures performances et une meilleure sécurité, il est recommandé d'utiliser CloudFront :

1. Créer une distribution CloudFront pointant vers le bucket S3
2. Configurer une Origin Access Identity (OAI) ou Origin Access Control (OAC)
3. Garder le bucket S3 privé
4. CloudFront servira les fichiers avec cache et CDN
5. Modifier `src/lib/s3.ts` pour retourner l'URL CloudFront au lieu de l'URL S3 directe

Exemple d'URL CloudFront : `https://d1234567890.cloudfront.net/blog/admin/123456_image.png`

## Vérifier la configuration

Après avoir appliqué la Bucket Policy, tester en uploadant une nouvelle image de blog et vérifier qu'elle s'affiche correctement dans le navigateur.
