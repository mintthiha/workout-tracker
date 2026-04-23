/**
 * scripts/seedExercises.ts
 *
 * One-time script to populate the Firestore `exercises` collection with the
 * full exercise library bundled in the app.
 *
 * Run with:
 *   npx tsx scripts/seedExercises.ts
 *
 * Requires:
 *   - firebase-admin installed as a dev dependency
 *   - scripts/serviceAccountKey.json (download from Firebase Console)
 *   - See scripts/README.md for full setup instructions
 *
 * Safe to re-run — uses batch set() which is idempotent.
 */

import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// ─── Load service account ─────────────────────────────────────────────────────

let serviceAccount: ServiceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json') as ServiceAccount;
} catch {
  console.error(
    '\n❌  scripts/serviceAccountKey.json not found.\n' +
    '    Download it from:\n' +
    '    Firebase Console → Project Settings → Service accounts → Generate new private key\n' +
    '    Save as scripts/serviceAccountKey.json  (it is already in .gitignore)\n'
  );
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

// ─── Exercise data ────────────────────────────────────────────────────────────
// Inlined here so this script has zero dependency on the app's module resolver.
// Keep in sync with src/data/exerciseLibrary.ts.

interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
}

const EXERCISES: ExerciseData[] = [
  // Chest
  { id: 'bench-press-barbell', name: 'Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 'bench-press-dumbbell', name: 'Bench Press (Dumbbell)', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: 'incline-bench-barbell', name: 'Incline Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 'incline-bench-dumbbell', name: 'Incline Bench Press (Dumbbell)', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: 'decline-bench-barbell', name: 'Decline Bench Press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 'pec-deck', name: 'Pec Deck', muscleGroup: 'chest', equipment: 'machine' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroup: 'chest', equipment: 'cable' },
  { id: 'push-up', name: 'Push-Up', muscleGroup: 'chest', equipment: 'bodyweight' },
  { id: 'chest-dip', name: 'Chest Dip', muscleGroup: 'chest', equipment: 'bodyweight' },
  // Back
  { id: 'pull-up', name: 'Pull-Up', muscleGroup: 'back', equipment: 'bodyweight' },
  { id: 'chin-up', name: 'Chin-Up', muscleGroup: 'back', equipment: 'bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'cable' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscleGroup: 'back', equipment: 'cable' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', equipment: 'barbell' },
  { id: 'dumbbell-row', name: 'Dumbbell Row', muscleGroup: 'back', equipment: 'dumbbell' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', equipment: 'barbell' },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'back', equipment: 'cable' },
  { id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', muscleGroup: 'back', equipment: 'cable' },
  // Shoulders
  { id: 'overhead-press-barbell', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'barbell' },
  { id: 'overhead-press-dumbbell', name: 'Overhead Press (Dumbbell)', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'front-raise', name: 'Front Raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', equipment: 'cable' },
  { id: 'upright-row', name: 'Upright Row', muscleGroup: 'shoulders', equipment: 'barbell' },
  // Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'cable-curl', name: 'Cable Curl', muscleGroup: 'biceps', equipment: 'cable' },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  // Triceps
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'skullcrusher', name: 'Skullcrusher', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: 'tricep-dip', name: 'Tricep Dip', muscleGroup: 'triceps', equipment: 'bodyweight' },
  { id: 'cable-overhead-tricep', name: 'Cable Overhead Tricep Extension', muscleGroup: 'triceps', equipment: 'cable' },
  { id: 'diamond-push-up', name: 'Diamond Push-Up', muscleGroup: 'triceps', equipment: 'bodyweight' },
  // Legs
  { id: 'squat', name: 'Squat', muscleGroup: 'legs', equipment: 'barbell' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'legs', equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', equipment: 'machine' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'legs', equipment: 'barbell' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'legs', equipment: 'machine' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'legs', equipment: 'machine' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'legs', equipment: 'machine' },
  { id: 'walking-lunges', name: 'Walking Lunges', muscleGroup: 'legs', equipment: 'dumbbell' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'legs', equipment: 'barbell' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroup: 'legs', equipment: 'dumbbell' },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroup: 'legs', equipment: 'machine' },
  // Core
  { id: 'plank', name: 'Plank', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'crunches', name: 'Crunches', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'leg-raise', name: 'Leg Raise', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'ab-rollout', name: 'Ab Rollout', muscleGroup: 'core', equipment: 'other' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'core', equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'core', equipment: 'cable' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'core', equipment: 'bodyweight' },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\nSeeding ${EXERCISES.length} exercises to Firestore...\n`);

  // Firestore batch limit is 500 ops; split if needed
  const BATCH_SIZE = 400;
  let written = 0;

  for (let i = 0; i < EXERCISES.length; i += BATCH_SIZE) {
    const chunk = EXERCISES.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const exercise of chunk) {
      const { id, ...data } = exercise;
      const ref = db.collection('exercises').doc(id);
      batch.set(ref, { ...data, isCustom: false, createdBy: null });
    }

    await batch.commit();
    written += chunk.length;
    console.log(`  ✓ ${written} / ${EXERCISES.length} written`);
  }

  console.log('\n✅  Done. Firestore exercises collection is ready.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
