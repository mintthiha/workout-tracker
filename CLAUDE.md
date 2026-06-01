# LiftUp — Claude Instructions

## Modularity

Never add new feature logic directly to screen files in `/app` or to existing components if it can live in its own module. Screens in `/app` should be thin — they wire data and compose components, they don't define complex UI inline.

When implementing a new feature or UI section:

- Create a dedicated file for the component, hook, or utility
- Place it in the appropriate folder under `/components/<feature>/`, `/src/lib/`, or `/src/services/`
- Group by feature (e.g. `components/workout/`, `components/profile/`, `components/feed/`)

**File length:** If a component file exceeds ~250 lines or a screen exceeds ~150 lines, split it. Common patterns:

- Extract sub-components (a row, a card, a header) into siblings in the same folder
- Extract handlers and data transforms into a `.ts` utility next to the component
- Extract pure data shaping (aggregations, formatters) into `/src/lib/<feature>.ts`

A component or utility belongs in its own file when it has its own state, makes a Firestore call, or contains more than trivial JSX.

**Co-location rule:** Place a file in the most specific folder that covers all its consumers. If a component is only used inside `components/workout/`, it lives there — not at the root of `/components/`. Only promote to a shared location when a second, distinct feature needs it.

## Project Structure

```
/app                   → Screens & routing (Expo Router file-based)
  /(tabs)              → Tab routes
/components            → Reusable UI components, grouped by feature
  /workout
  /exercises
  /feed
  /profile
  /settings
  /login
  /ui                  → Cross-feature primitives
  themed-text.tsx      → Theme-aware primitives at root
  themed-view.tsx
/src
  /services            → Firestore CRUD + business logic per domain
  /lib                 → Cross-cutting infrastructure (firebase, auth, cloudinary, app storage)
  /context             → React contexts (app-wide state)
  /types               → Shared TypeScript types
  /storage             → Local storage adapters
  /data                → Static data (exercise library)
/utils                 → Standalone utilities (audio, notifications, timer logic)
/hooks                 → Reusable hooks
/constants             → App-wide constants (theme colors, etc.)
```

**Service/lib boundary:**
- `src/services/` — domain logic backed by Firestore (workouts, posts, exercises, etc.). One file per domain.
- `src/lib/` — lower-level infrastructure (firebase config, auth wrappers, cloudinary uploader, app-storage cache).

## UI Primitives — Use Themed Components

Before writing raw `<Text>` or `<View>`, use the project's themed primitives. Hardcoded colors break dark mode.

- **Text** → `ThemedText` from `@/components/themed-text`
- **Containers** → `ThemedView` from `@/components/themed-view`
- **Colors** → `useThemeColor({}, "primary")` — never hardcode `#fff`, `#000`, or hex values in styles
- **Icons** → `Ionicons` from `@expo/vector-icons`
- **Confirmations** → React Native `Alert.alert` on native. For web compatibility branch on `Platform.OS === "web"` and use `window.alert` / `window.confirm` (see `ProfileHeader.tsx` for the pattern)

## Naming

Use full, descriptive names for all identifiers — functions, constants, variables, components, and types. Abbreviations are not acceptable unless they are universally understood (`id`, `url`, `uid`, `db`, `lbs`, `kg`).

- **Functions** — name what they do: `handleAvatarPress`, not `onPress2`; `calculateTotalVolume`, not `calcVol`; `bucketLogsByDay`, not `bucket`
- **Variables** — spell out intent: `isUploading`, not `loading`; `selectedExerciseId`, not `selId`; `restSecondsRemaining`, not `t`
- **Constants** — name what they represent: `DEFAULT_AVATAR`, not `IMG`; `MUSCLE_GROUP_COLORS`, not `COLORS`
- **Components** — PascalCase, named for what they render: `ExerciseProgressChart`, not `Chart`
- **Files** — PascalCase for components (`PostCard.tsx`), camelCase for utilities (`workoutService.ts`)
- **Types/interfaces** — PascalCase: `WorkoutTemplate`, `LoggedSet`

If a name needs a comment to explain what it refers to, the name is wrong — rename it instead.

## Comments

Add a JSDoc comment above every exported function and React component. One line. Explain the **why** or **what** — do not restate the function name.

```ts
/** Computes per-day workout intensity buckets for the activity heatmap. */
export function bucketLogsByDay(logs: WorkoutLog[]): DayBucket[] { ... }

/** Refreshes the user's avatar from Firestore once the upload completes. */
useEffect(() => { ... }, [userId]);
```

Do not write multi-paragraph doc blocks. Do not restate the code. One short line is enough.

Use the existing section-divider style inside larger files to group related code:

```ts
// ─── Templates ────────────────────────────────────────────────────────────────
```

## State Ownership (Controlled Components)

When a child component needs to change state that the parent also reads, the state belongs in the parent. Pass the value and a setter callback as props.

```tsx
// Parent owns the state
const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

// Child receives value + callback
<ExerciseList
  selectedExerciseId={selectedExerciseId}
  onSelectionChange={setSelectedExerciseId}
/>
```

Do not define state inside a child if a sibling or parent also needs to read or set it.

## Firestore Service Pattern

When adding a new domain (e.g. body weight logs, plans, friends):

1. Define types in `src/types/workout.ts` (split into separate type files if a domain grows large)
2. Create `src/services/<domain>Service.ts` with CRUD operations and real-time subscribers
3. Use the path convention `users/{uid}/<collection>/{id}` for user-scoped data
4. Strip `undefined` values before writing — Firestore rejects them. Follow the existing pattern: `JSON.parse(JSON.stringify(data))` (see `workoutService.saveWorkoutLog`)
5. Return an unsubscribe function from `subscribeTo*` helpers; call it in the `useEffect` cleanup
6. Use `useFocusEffect` (not `useEffect`) when you want a screen to refetch each time the tab is focused — see `app/(tabs)/history.tsx` for the pattern

## Testing

Every new feature ships with unit tests. The project uses Jest (`jest-expo` preset) and `@testing-library/react-native`. Run with `npm test` (or `npm run test:watch` for TDD).

**Where tests live:** `/tests/` mirrors the source tree.

```
src/lib/heatmap.ts                    →  tests/lib/heatmap.test.ts
src/services/workoutService.ts        →  tests/services/workoutService.test.ts
utils/timer/timerConstants.ts         →  tests/utils/timerConstants.test.ts
components/profile/ActivityHeatmap.tsx → tests/components/activity-heatmap.test.tsx
app/(tabs)/explore.tsx                →  tests/screens/explore.test.tsx
```

Name the test file after the source file with `.test` inserted (`.test.ts` for pure logic, `.test.tsx` for anything that renders JSX). Match the source filename's casing.

**What to test, by file type:**

- **Pure utilities** (`/src/lib/`, `/utils/`) — every exported function. Cover the happy path, edge cases (empty arrays, zero values, missing fields), and any branching logic. These are the highest-value tests because they have no mocks.
- **Services** (`/src/services/`) — pure helpers like `calculateTotalVolume`, `detectPersonalRecords`, `formatDuration`. Firestore CRUD wrappers are not unit-tested (they're thin wrappers around the SDK); cover them via screen tests instead.
- **Components** (`/components/`) — render output for each meaningful prop variant, user interactions (taps, long-presses, input changes), and conditional rendering (loading / empty / error states).
- **Screens** (`/app/`) — data loading states, empty states, the primary user flow with mocked services. Don't try to integration-test Firestore; mock the service module.

**Mocking patterns** — follow what's already in `tests/screens/explore.test.tsx`:

```tsx
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("@/hooks/use-theme-color", () => ({ useThemeColor: jest.fn(() => "#123456") }));
jest.mock("@/src/context/AppContext", () => ({ useAppContext: jest.fn() }));
jest.mock("@/src/services/postService", () => ({
  createPost: jest.fn(),
  subscribeToPosts: jest.fn(),
}));
```

Mock heavy child components when the screen test only needs to verify wiring:

```tsx
jest.mock("@/components/feed/PostCard", () => ({
  PostCard: ({ post, username }) => {
    const { Text } = require("react-native");
    return <Text>{`${username}: ${post.content}`}</Text>;
  },
}));
```

**Test structure conventions:**
- One top-level `describe` per module, named after the module
- Use `it("does X when Y")` — full sentences, not `test("...")`
- Arrange / Act / Assert with blank lines separating them
- Don't test implementation details — test observable behavior (rendered output, called mocks)

**Coverage rule:** A feature isn't done until its tests pass. If you add a new pure utility, it needs tests in the same change. If you add a screen, it needs at least loading-state, empty-state, and happy-path coverage.

## Cross-Platform

This app runs on iOS, Android, and web (Expo). Whenever you touch a platform-sensitive API:

- File pickers, alerts, permissions, haptics — branch on `Platform.OS === "web"` when behavior differs
- Don't import iOS-only or Android-only APIs without a platform guard
- Test the web build before declaring a feature done — `npx expo start` then press `s`

## Path Aliases

Use `@/` for absolute imports from the project root. Don't write relative paths that escape a folder.

```ts
// Good
import { ThemedText } from "@/components/themed-text";
import { useAppContext } from "@/src/context/AppContext";

// Bad
import { ThemedText } from "../../../components/themed-text";
```

## Implementation Summary

At the end of every feature implementation, provide a short summary in this format:

**Files touched:**
- `path/to/file.tsx` — what was added or removed

**Example:**
```
Files touched:
- components/profile/ActivityHeatmap.tsx — replaced hardcoded array with derived data from props
- src/lib/heatmap.ts — created; bucketLogsByDay utility
- app/(tabs)/profile.tsx — fetched logs and passed them to ActivityHeatmap
```
