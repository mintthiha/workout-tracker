# Scripts

## seedExercises.ts

Populates the Firestore `exercises` collection with the full exercise library.
Run this **once** after creating your Firebase project. Safe to re-run (idempotent).

### Prerequisites

1. **Install dev dependencies** (one-time):

```bash
npm install --save-dev firebase-admin tsx
```

2. **Get a service account key:**
   - Open [Firebase Console](https://console.firebase.google.com)
   - Go to **Project Settings → Service accounts**
   - Click **Generate new private key**
   - Save the downloaded JSON as `scripts/serviceAccountKey.json`
   - This file is already in `.gitignore` — never commit it

### Run

```bash
npx tsx scripts/seedExercises.ts
```

Expected output:
```
Seeding 58 exercises to Firestore...

  ✓ 58 / 58 written

✅  Done. Firestore exercises collection is ready.
```

### After seeding

The app's `exerciseService.getExercises()` will automatically read from Firestore instead of the local bundled library. The local library (`src/data/exerciseLibrary.ts`) remains as an offline fallback.

### Firestore structure created

```
exercises/
  bench-press-barbell/   { name, muscleGroup, equipment, isCustom: false, createdBy: null }
  bench-press-dumbbell/  { ... }
  pull-up/               { ... }
  squat/                 { ... }
  ...
```

---

## reset-project.js

Built-in Expo script — resets the project to a fresh state. Not related to Firebase.
