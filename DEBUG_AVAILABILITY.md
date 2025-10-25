# 🔍 DEBUG GUIDE - Système de Disponibilités

## 📊 Logs de Debug Activés

J'ai ajouté des logs détaillés pour diagnostiquer pourquoi les créneaux ne s'affichent pas.

---

## 🧪 TESTS À EFFECTUER

### Test 1: Vérifier les Logs Backend

1. **Déployez** l'application (le commit avec les logs vient d'être poussé)
2. **Ouvrez** la page d'un praticien : `/praticien/[slug]`
3. **Ouvrez les logs du serveur** (GitHub Actions, Vercel, ou votre provider)
4. **Cherchez** les logs préfixés par `[AVAILABILITY DEBUG]`

**Logs attendus :**
```
[AVAILABILITY DEBUG] Starting slot generation: {
  startDate: "2025-10-25T00:00:00.000Z",
  endDate: "2025-11-08T00:00:00.000Z",
  now: "2025-10-25T14:30:00.000Z",
  appointmentTypesCount: 2,
  availabilitiesKeys: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}

[AVAILABILITY DEBUG] Checking monday: {
  enabled: true,
  start: "09:00",
  end: "18:00"
}
... (pour chaque jour)

[AVAILABILITY DEBUG] Slot generation complete: {
  totalSlots: 42,
  firstSlot: { start: "...", consultationType: "Consultation initiale" },
  lastSlot: { ... }
}
```

---

### Test 2: Vérifier les Logs Frontend

1. **Ouvrez** la page praticien
2. **Ouvrez la Console** du navigateur (F12 → Console)
3. **Cherchez** les logs `[AVAILABILITY PICKER DEBUG]`

**Logs attendus :**
```
[AVAILABILITY PICKER DEBUG] Data received: {
  totalAvailabilities: 42,
  selectedConsultationType: null,
  error: undefined,
  isLoading: false
}

[AVAILABILITY PICKER DEBUG] Filtered slots: {
  filteredCount: 21,
  selectedType: "Consultation initiale"
}
```

---

## 🔎 DIAGNOSTICS POSSIBLES

### Scénario A: `totalSlots: 0` dans les logs backend

**Cause possible :**
- Tous les créneaux sont dans le passé
- Configuration agenda incorrecte
- Dates de début/fin mal calculées

**Cherchez :**
```
[AVAILABILITY DEBUG] Slot filtered: {
  time: "2025-10-25T09:00:00.000Z",
  isBooked: false,
  isPast: true,  ← PROBLÈME ICI
  now: "2025-10-25T14:30:00.000Z"
}
```

**Solution :**
- Si tous les slots sont `isPast: true`, c'est un problème de timezone
- Vérifiez que `now` n'est pas dans le futur par rapport aux slots

---

### Scénario B: `totalSlots > 0` mais `totalAvailabilities: 0` frontend

**Cause :**
- L'API retourne des slots mais le frontend ne les reçoit pas
- Erreur de fetch
- Problème de CORS

**Cherchez dans la console :**
```
Failed to fetch
CORS error
404 Not Found
```

**Vérifiez :**
- L'URL de l'API dans la requête SWR
- Que le slug du praticien est correct

---

### Scénario C: `totalAvailabilities > 0` mais `filteredCount: 0`

**Cause :**
- Le filtrage par type de consultation ne trouve rien
- Mismatch entre le nom du type dans les slots et le type sélectionné

**Cherchez :**
```
[AVAILABILITY PICKER DEBUG] Data received: {
  totalAvailabilities: 42,
  selectedConsultationType: "Consultation Initiale",  ← Majuscule?
  ...
}
```

**Vérifiez :**
- Que `consultationType` dans les slots match exactement le type sélectionné
- Attention à la casse (majuscules/minuscules)

---

### Scénario D: Pas de logs du tout

**Causes possibles :**
1. Le build n'a pas encore déployé
2. L'API n'est pas appelée
3. Le composant `AvailabilityPicker` ne se monte pas

**Vérifiez :**
- Que le build GitHub Actions a réussi
- Que vous êtes bien sur une page praticien
- Que vous êtes connecté (requis pour voir le picker)

---

## 🛠️ COMMANDES DE DEBUG

### Tester l'API directement (depuis le navigateur)

1. **Ouvrez la Console** (F12)
2. **Récupérez le slug** d'un praticien
3. **Exécutez :**
```javascript
const slug = "votre-praticien-slug";
const startDate = new Date().toISOString();
const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

fetch(`/api/public/practitioners/${slug}/availabilities?startDate=${startDate}&endDate=${endDate}`)
  .then(r => r.json())
  .then(data => {
    console.log('API Response:', data);
    console.log('Total slots:', data.availabilities?.length);
    console.log('First slot:', data.availabilities?.[0]);
  });
```

**Résultat attendu :**
```json
{
  "success": true,
  "availabilities": [
    {
      "start": "2025-10-26T09:00:00.000Z",
      "end": "2025-10-26T10:00:00.000Z",
      "consultationType": "Consultation initiale",
      "duration": 60,
      "price": 60
    },
    ...
  ],
  "practitionerId": "..."
}
```

---

## 📋 CHECKLIST DE VÉRIFICATION

Avant de me recontacter, vérifiez :

- [ ] Le build a terminé avec succès
- [ ] Vous êtes sur la bonne page praticien
- [ ] Vous êtes connecté
- [ ] Le praticien a un profil vérifié
- [ ] Les logs backend s'affichent
- [ ] Les logs frontend s'affichent
- [ ] L'API retourne des slots (testée manuellement)
- [ ] Vous avez copié les logs pour me les envoyer

---

## 📤 INFORMATIONS À ME FOURNIR

Si le problème persiste, envoyez-moi :

1. **Les logs backend** (complets, depuis "[AVAILABILITY DEBUG] Starting...")
2. **Les logs frontend** (depuis la console navigateur)
3. **Le résultat** du test API manuel ci-dessus
4. **L'URL** de la page praticien testée
5. **Screenshot** de la page (si possible)

Avec ces informations, je pourrai identifier le problème exact ! 🎯
