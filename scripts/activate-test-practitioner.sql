-- Script pour activer un compte praticien de test
-- Utilisation: Exécuter dans pgAdmin ou via psql

-- 1. Vérifier le compte actuel
SELECT id, email, role, status, "firstName", "lastName"
FROM users
WHERE email = 'cindy.chafai@gmail.com';

-- 2. Activer le compte (passer de PENDING_PAYMENT à ACTIVE)
UPDATE users
SET
  status = 'ACTIVE',
  "subscriptionStart" = NOW(),
  "subscriptionEnd" = NOW() + INTERVAL '1 year',
  "updatedAt" = NOW()
WHERE email = 'cindy.chafai@gmail.com';

-- 3. Vérifier que c'est bien mis à jour
SELECT id, email, role, status, "subscriptionStart", "subscriptionEnd"
FROM users
WHERE email = 'cindy.chafai@gmail.com';

-- 4. (Optionnel) Créer un nouveau compte praticien test si besoin
/*
INSERT INTO users (
  id,
  email,
  password,
  role,
  status,
  "firstName",
  "lastName",
  phone,
  city,
  "postalCode",
  siret,
  "subscriptionStart",
  "subscriptionEnd",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'test.praticien@spymeo.fr',
  '$2a$10$HASH_HERE', -- Générer avec bcrypt
  'PRACTITIONER',
  'ACTIVE',
  'Test',
  'Praticien',
  '0612345678',
  'Paris',
  '75001',
  '12345678901234',
  NOW(),
  NOW() + INTERVAL '1 year',
  true,
  NOW(),
  NOW()
);
*/
