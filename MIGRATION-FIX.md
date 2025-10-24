# Fix Migration échouée en Production

## Problème
La migration `20251024140000_add_client_to_appointments` a échoué en production car l'ordre des opérations était incorrect (création d'index avant l'ajout de la colonne).

## Solution

### Option 1: Via AWS ECS Exec (Recommandé)

1. Connectez-vous au conteneur ECS en cours d'exécution:
```bash
aws ecs execute-command \
  --cluster spymeo-cluster \
  --task <TASK-ID> \
  --container spymeo-app \
  --interactive \
  --command "/bin/sh"
```

2. Une fois dans le conteneur, exécutez:
```bash
npx prisma migrate resolve --rolled-back 20251024140000_add_client_to_appointments
npx prisma migrate deploy
```

3. Redémarrez le service ECS

### Option 2: Modifier l'entrypoint (Automatique)

Le script d'entrypoint peut être modifié pour résoudre automatiquement les migrations échouées.

### Option 3: Directement depuis la base de données

Connectez-vous à la base PostgreSQL et exécutez:

```sql
-- Supprimer l'entrée de migration échouée
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251024140000_add_client_to_appointments';

-- Vérifier que la colonne n'existe pas
SELECT column_name FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'clientId';

-- Si la colonne existe déjà, la migration a partiellement réussi
-- Dans ce cas, marquer manuellement la migration comme appliquée:
INSERT INTO "_prisma_migrations" (
  id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
) VALUES (
  gen_random_uuid(),
  '...',  -- checksum du fichier migration.sql
  NOW(),
  '20251024140000_add_client_to_appointments',
  NULL,
  NULL,
  NOW(),
  1
);
```

## Changements effectués

1. **Ordre des opérations corrigé**:
   - ✅ D'abord: Ajouter la colonne `clientId`
   - ✅ Ensuite: Créer l'index
   - ✅ Enfin: Ajouter la foreign key

2. **Protection IF NOT EXISTS ajoutée partout** pour permettre la réexécution

## Après résolution

Une fois la migration résolue, le déploiement devrait réussir automatiquement.
