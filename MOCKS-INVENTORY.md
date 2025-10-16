# 📦 Inventaire des fichiers MOCK - SPYMEO

## Vue d'ensemble

**Total identifié : 36+ fichiers mock**

Ces fichiers contiennent des données de test en mémoire qui doivent être remplacés par des routes API réelles connectées à Prisma/PostgreSQL.

## Fichiers mock identifiés

### src/lib/mockdb/ (principales sources)

1. `agenda.ts` - Mock calendrier/événements
2. `agendaSettings.ts` - Mock paramètres agenda
3. `appointments.ts` - Mock rendez-vous utilisateurs
4. `clients.ts` - Mock clients praticiens
5. `clients-artisan.ts` - Mock clients artisans
6. `clients-commercant.ts` - Mock clients commerçants
7. `documents.ts` - Mock documents/fichiers
8. `messages.ts` - Mock messagerie/conversations
9. `orders-artisan.ts` - Mock commandes artisan
10. `orders-commercant.ts` - Mock commandes commerçant
11. `pass.ts` - Mock abonnements PASS
12. `precompta-artisan.ts` - Mock pré-comptabilité artisan
13. `precompta-commercant.ts` - Mock pré-comptabilité commerçant
14. `products-commercant.ts` - Mock produits commerçant
15. `resources.ts` - Mock ressources/académie
16. `services-artisan.ts` - Mock services artisan
17. `stats.ts` - Mock statistiques générales
18. `stats-artisan.ts` - Mock stats artisan
19. `stats-commercant.ts` - Mock stats commerçant
20. `stock-commercant.ts` - Mock stocks commerçant
21. `user-favorites.ts` - Mock favoris utilisateur
22. `user-practitioners.ts` - Mock praticiens suivis

### src/lib/db/ (mocks anciens/mixtes)

23. `mockAntecedents.ts`
24. `mockClients.ts`
25. `mockConsultations.ts`
26. `mockDocs.ts`
27. `mockInvoices.ts`

## Plan de remplacement par API réelles

### Phase 1 : Core User & Auth (priorité haute)
- [ ] Remplacer mocks user-practitioners → API `/api/user/practitioners`
- [ ] Remplacer mocks user-favorites → API `/api/user/favorites`
- [ ] Remplacer mocks appointments → API `/api/user/appointments` (déjà existe partiellement)

### Phase 2 : Praticien
- [ ] Remplacer mockClients → API `/api/clients` (déjà existe partiellement)
- [ ] Remplacer mockConsultations → API `/api/consultations`
- [ ] Remplacer mockAntecedents → API `/api/clients/[id]/antecedents`
- [ ] Remplacer mockInvoices → API `/api/invoices`
- [ ] Remplacer mockDocs → API `/api/documents`
- [ ] Remplacer agenda/agendaSettings → API `/api/agenda/*` (déjà existe partiellement)
- [ ] Remplacer resources → API `/api/resources` (déjà existe)
- [ ] Remplacer stats → API `/api/stats` (déjà existe)

### Phase 3 : Artisan
- [ ] Remplacer services-artisan → API `/api/artisan/services`
- [ ] Remplacer clients-artisan → API `/api/artisan/clients`
- [ ] Remplacer orders-artisan → API `/api/artisan/orders`
- [ ] Remplacer precompta-artisan → API `/api/artisan/precompta`
- [ ] Remplacer stats-artisan → API `/api/artisan/stats`

### Phase 4 : Commerçant
- [ ] Remplacer products-commercant → API `/api/merchant/products`
- [ ] Remplacer stock-commercant → API `/api/merchant/stock`
- [ ] Remplacer clients-commercant → API `/api/merchant/clients`
- [ ] Remplacer orders-commercant → API `/api/merchant/orders`
- [ ] Remplacer precompta-commercant → API `/api/merchant/precompta`
- [ ] Remplacer stats-commercant → API `/api/merchant/stats`

### Phase 5 : PASS & Messaging
- [ ] Remplacer pass → API `/api/user/pass` (déjà existe partiellement)
- [ ] Remplacer messages → API `/api/user/conversations` (déjà existe partiellement)

## Stratégie de migration

### Pour chaque mock :

1. **Analyser le type de données**
   - Vérifier si le modèle Prisma existe
   - Créer/ajuster le modèle si nécessaire

2. **Créer la route API**
   - File: `src/app/api/[domain]/[resource]/route.ts`
   - Méthodes: GET, POST, PATCH, DELETE selon besoins
   - Validation: utiliser Zod pour valider les payloads

3. **Migrer les composants**
   - Remplacer les imports de mocks par des calls API (fetch/SWR)
   - Tester en dev local avec DB

4. **Supprimer le mock**
   - Une fois testé, supprimer le fichier mock
   - Vérifier qu'aucune référence ne subsiste

## Exemple de migration (agenda.ts)

### Avant (mock)
```ts
// src/lib/mockdb/agenda.ts
export const MOCK_EVENTS = [...]
```

### Après (API)
```ts
// src/app/api/agenda/events/route.ts
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(req: Request) {
  const userId = getCurrentUserId(req);
  const events = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startAt: 'asc' }
  });
  return NextResponse.json(events);
}
```

## Estimation

- **Effort total** : ~40-60h développement
- **Par mock** : 1-2h (simple) à 4-6h (complexe avec relations)
- **Tests** : +30% temps
- **Documentation** : +10% temps

## Risques

- Schéma Prisma incomplet → nécessite migrations additionnelles
- Logique métier complexe dans les mocks → nécessite reverse engineering
- Dépendances croisées entre mocks → migration séquentielle

## Recommandation

**Migration progressive par phase**, avec tests E2E entre chaque phase pour garantir la non-régression.

Priorité : Phase 1 (User/Auth) → Phase 2 (Praticien) car ce sont les flux les plus critiques.
