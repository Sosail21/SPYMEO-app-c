# Plan d'Action - Espace Praticien SPYMEO

## 📊 Analyse de l'existant

### Structure découverte

#### Menu Commun (tous les pros)
1. 🏠 Tableau de bord (`/pro/dashboard`)
2. 🧾 Ma fiche (`/pro/commun/fiche`)
3. 💬 SPYM'Com (`/pro/commun/spymcom`)
4. 🔎 Répertoire SPYMEO (`/pro/commun/repertoire/spymeo`)
5. 📒 Répertoire perso (`/pro/commun/repertoire/perso`)
6. 📝 Notes (`/pro/commun/notes`)
7. ✉️ Messagerie (`/pro/commun/messages`)
8. 🎁 Avantages (`/pro/commun/avantages`)
9. 🔖 PASS Partenaire (`/pro/commun/pass-partenaire`)

#### Menu Spécifique Praticien
1. 📆 Agenda / RDV (`/pro/praticien/agenda`)
2. 👤 Fiches clients (`/pro/praticien/fiches-clients`)
3. 📈 Statistiques (`/pro/praticien/statistiques`)
4. 📚 Pré-compta (`/pro/praticien/precompta`)
5. 📣 Évènements (`/pro/praticien/evenements`)
6. 🎓 Académie (`/pro/praticien/academie`)
7. ✍️ Blog (proposer) (`/pro/praticien/blog-proposer`)
8. 📦 Ressources (`/pro/praticien/ressources`)
9. 🏥 Cabinet partagé (`/pro/praticien/cabinet-partage`)
10. 🌍 Impact (`/pro/praticien/impact`)

### Modèle de données Prisma

**User** (praticien)
- Relations: clients, consultations, appointments, invoices, documents, notes
- profileData JSON (données spécifiques praticien)
- status: ACTIVE, PENDING_VALIDATION, PENDING_PAYMENT, REJECTED, SUSPENDED

**Client**
- Lié au praticien
- Relations: consultations, antécédents, documents

**Consultation**
- Lié au client et praticien
- Notes, diagnostic, prescriptions

**Appointment**
- RDV avec le praticien

**Invoice**
- Factures générées

### Statuts utilisateur
- ✅ **ACTIVE**: Accès complet
- ⏳ **PENDING_VALIDATION**: En attente validation admin
- 💳 **PENDING_PAYMENT**: Validé mais doit payer (cas de cindy.chafai@gmail.com)
- ❌ **REJECTED**: Candidature refusée
- 🚫 **SUSPENDED**: Compte suspendu

---

## 🎯 Plan d'Action - Ordre d'Implémentation

### Phase 0: Préparation (MAINTENANT)
- [x] Explorer la structure
- [x] Analyser le menu
- [ ] Activer un compte test (cindy.chafai@gmail.com → ACTIVE)
- [ ] Tester l'accès

### Phase 1: Espace "Ma Fiche" (Profil Public) ⭐ PRIORITÉ 1
**Pourquoi en premier ?** C'est la base de l'identité professionnelle, nécessaire pour toutes les autres fonctionnalités.

**Fonctionnalités:**
- Affichage du profil public du praticien
- Édition des informations:
  * Informations professionnelles (spécialités, diplômes, années d'expérience)
  * Photo de profil
  * Bio / présentation
  * Tarifs et modes de paiement
  * Horaires d'ouverture
  * Coordonnées (adresse cabinet, téléphone, email)
  * Services proposés
- Upload de documents professionnels
- Prévisualisation de la fiche publique

**API à créer:**
- GET `/api/pro/profile` - Récupérer le profil
- PATCH `/api/pro/profile` - Mettre à jour le profil
- POST `/api/pro/profile/photo` - Upload photo

**Pages:**
- `/pro/commun/fiche` - Édition du profil

---

### Phase 2: Fiches Clients ⭐ PRIORITÉ 2
**Pourquoi ?** Core business d'un praticien - gestion de sa patientèle.

**Fonctionnalités:**
- Liste des clients (avec recherche, filtres)
- Créer un nouveau client
- Voir/éditer une fiche client:
  * Informations personnelles
  * Coordonnées
  * Antécédents médicaux
  * Notes générales
  * Historique des consultations
- Archiver un client
- Export de données (RGPD)

**API à créer:**
- GET `/api/pro/clients` - Liste des clients
- POST `/api/pro/clients` - Créer un client
- GET `/api/pro/clients/[id]` - Détails client
- PATCH `/api/pro/clients/[id]` - Mettre à jour
- DELETE `/api/pro/clients/[id]` - Supprimer/archiver
- POST `/api/pro/clients/[id]/antecedents` - Ajouter antécédent
- GET `/api/pro/clients/[id]/consultations` - Historique

**Pages:**
- `/pro/praticien/fiches-clients` - Liste
- `/pro/praticien/fiches-clients/[id]` - Détails/Édition

---

### Phase 3: Agenda / RDV ⭐ PRIORITÉ 3
**Pourquoi ?** Gestion des rendez-vous, essentiel pour l'organisation.

**Fonctionnalités:**
- Vue calendrier (jour, semaine, mois)
- Créer un RDV
- Modifier/annuler un RDV
- Associer un RDV à un client
- Notifications (email/SMS)
- Disponibilités / plages horaires
- Gestion des récurrences
- Synchronisation (Google Calendar, Outlook)

**API à créer:**
- GET `/api/pro/agenda/events` - Liste des RDV
- POST `/api/pro/agenda/events` - Créer RDV
- PATCH `/api/pro/agenda/events/[id]` - Modifier
- DELETE `/api/pro/agenda/events/[id]` - Supprimer
- GET `/api/pro/agenda/settings` - Paramètres agenda
- PATCH `/api/pro/agenda/settings` - Mettre à jour paramètres

**Pages:**
- `/pro/praticien/agenda` - Calendrier principal
- `/pro/praticien/agenda/settings` - Paramètres

**Note:** L'agenda semble déjà avancé (fichier volumineux vu dans la structure)

---

### Phase 4: Consultations (lié aux clients) ⭐ PRIORITÉ 4
**Pourquoi ?** Traçabilité des soins, dossier médical.

**Fonctionnalités:**
- Créer une consultation (depuis une fiche client)
- Notes de consultation
- Diagnostic
- Prescriptions
- Documents attachés
- Historique par client

**API à créer:**
- POST `/api/pro/consultations` - Créer
- GET `/api/pro/consultations/[id]` - Détails
- PATCH `/api/pro/consultations/[id]` - Modifier
- DELETE `/api/pro/consultations/[id]` - Supprimer

**Pages:**
- Intégré dans `/pro/praticien/fiches-clients/[id]`
- Modal ou sous-page pour créer/éditer

---

### Phase 5: Pré-compta (Facturation) ⭐ PRIORITÉ 5
**Pourquoi ?** Génération de factures, suivi financier.

**Fonctionnalités:**
- Liste des factures
- Créer une facture (manuelle ou depuis consultation)
- Générer PDF
- Statuts: brouillon, envoyée, payée, annulée
- Récapitulatif mensuel/annuel
- Export comptable
- Configuration (SIRET, TVA, coordonnées bancaires)

**API à créer:**
- GET `/api/pro/invoices` - Liste
- POST `/api/pro/invoices` - Créer
- GET `/api/pro/invoices/[id]` - Détails
- GET `/api/pro/invoices/[id]/pdf` - Générer PDF
- PATCH `/api/pro/invoices/[id]` - Mettre à jour
- GET `/api/pro/precompta/config` - Configuration
- PATCH `/api/pro/precompta/config` - Mettre à jour config

**Pages:**
- `/pro/praticien/precompta` - Liste factures
- `/pro/praticien/precompta/config` - Configuration

---

### Phase 6: Statistiques ⭐ PRIORITÉ 6
**Pourquoi ?** Vue d'ensemble de l'activité.

**Fonctionnalités:**
- Nombre de clients total
- Nouveaux clients ce mois
- Nombre de consultations
- Chiffre d'affaires
- Taux de remplissage agenda
- Graphiques évolution
- Export données

**API à créer:**
- GET `/api/pro/stats` - Statistiques générales
- GET `/api/pro/stats/revenue` - CA par période
- GET `/api/pro/stats/clients` - Évolution clients
- GET `/api/pro/stats/consultations` - Consultations

**Pages:**
- `/pro/praticien/statistiques` - Dashboard stats

---

### Phase 7: Espaces Secondaires

#### 7.1 Ressources
- Bibliothèque de documents
- Modèles (ordonnances, certificats)
- Partage avec clients

#### 7.2 Notes
- Prise de notes rapide
- Catégories
- Recherche

#### 7.3 SPYM'Com
- Feed/actualités SPYMEO
- Annonces
- Communication entre pros

#### 7.4 Répertoires
- Répertoire SPYMEO: annuaire des pros
- Répertoire perso: contacts personnels

#### 7.5 Messagerie
- Messages entre praticiens
- Messages avec clients

#### 7.6 Avantages
- Liste des avantages partenaires
- Codes promo

#### 7.7 PASS Partenaire
- Programme de fidélité
- Réductions pour clients

#### 7.8 Évènements
- Webinaires
- Formations
- Salons

#### 7.9 Académie
- Cours de formation
- Vidéos
- Progression

#### 7.10 Blog (proposer)
- Proposer des articles
- Suivi des soumissions

#### 7.11 Cabinet partagé
- Gestion de cabinet collectif
- Partage d'agenda
- Comptabilité partagée

#### 7.12 Impact
- Mesure d'impact social/environnemental
- Reporting RSE

---

### Phase 8: Dashboard (DERNIÈRE ÉTAPE)
**Pourquoi à la fin ?** Regroupe les données de toutes les autres sections.

**Fonctionnalités:**
- Prochains RDV (de l'agenda)
- Clients récents (des fiches clients)
- CA du mois (de la pré-compta)
- Statistiques clés
- Tâches/notifications
- Raccourcis vers actions fréquentes

**API:**
- GET `/api/pro/dashboard` - Données agrégées

**Pages:**
- `/pro/dashboard`

---

## 🔧 Compte de Test

### Option 1: Utiliser cindy.chafai@gmail.com
**Status actuel:** PENDING_PAYMENT
**Action:** Changer le status en ACTIVE via la DB

### Option 2: Créer un nouveau compte
**Email:** `test.praticien@spymeo.fr`
**Mot de passe:** À définir
**Status:** ACTIVE directement

---

## 📝 Recommandations

### Architecture
- ✅ Utiliser les API routes Next.js existantes
- ✅ Prisma pour toutes les opérations DB
- ✅ Validation Zod sur les formulaires
- ✅ Upload S3 pour les documents/photos
- ✅ Composants réutilisables dans `/components/pro`

### UX
- Formulaires avec feedback immédiat
- Confirmation avant suppressions
- Loading states
- Messages de succès/erreur
- Navigation breadcrumb

### Sécurité
- Vérification du rôle sur chaque API
- Vérification que le praticien accède UNIQUEMENT à ses données
- Sanitisation des inputs
- RGPD: export/suppression données

---

## 🚀 Prochaines Étapes Immédiates

1. **Activer le compte test**
   - Script SQL pour passer cindy.chafai@gmail.com en ACTIVE

2. **Commencer par "Ma Fiche"**
   - Créer l'API GET `/api/pro/profile`
   - Créer l'API PATCH `/api/pro/profile`
   - Implémenter la page `/pro/commun/fiche`
   - Upload photo de profil

3. **Tester le flux complet**
   - Se connecter avec le compte test
   - Remplir le profil
   - Vérifier l'affichage public

---

## ✅ Validation par Phase

Chaque phase doit être:
- ✅ **Fonctionnelle** - Toutes les fonctionnalités marchent
- ✅ **Testée** - Avec le compte test
- ✅ **Sécurisée** - Vérifications de rôle et propriété
- ✅ **UX** - Messages de feedback, loading states
- ✅ **Responsive** - Mobile-friendly
- ✅ **Documentée** - Commentaires dans le code
