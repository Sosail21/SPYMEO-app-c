# Prisma Migrations

## État actuel

Aucune migration n'existe encore. Le schéma Prisma (`schema.prisma`) est défini et complet.

## Première migration (à exécuter en production)

Pour créer la migration initiale et appliquer le schéma à la base de données :

```bash
# Depuis un environnement avec accès à la DB de production
npx prisma migrate dev --name init

# OU en production directement (push le schéma sans créer de fichier de migration)
npx prisma db push
```

## Migrations futures

Pour toute modification du schéma :

1. Modifier `prisma/schema.prisma`
2. Créer une migration : `npx prisma migrate dev --name nom_de_la_migration`
3. La migration sera automatiquement appliquée au démarrage du conteneur Docker (via `entrypoint.sh`)

## Déploiement

Les migrations sont appliquées automatiquement au démarrage du conteneur via :
```bash
npx prisma migrate deploy
```

Ceci est exécuté dans `docker/entrypoint.sh` avant le démarrage de l'application.
