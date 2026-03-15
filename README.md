# LiftUp 💪

A cross-platform mobile app for tracking workouts, setting fitness goals, and sharing progress with friends. Built with Expo and Firebase.

---

## Tech Stack

- **Frontend:** React Native (Expo)
- **Routing:** Expo Router (file-based)
- **Backend / Database:** Firebase Firestore
- **Authentication:** Firebase Auth

---

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- A Firebase project with Firestore enabled

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/mintthiha/workout-tracker
   cd workout-tracker
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Add your Firebase config — create a `.env` file in the root with your Firebase credentials:

   ```
      EXPO_PUBLIC_FIREBASE_API_KEY=...
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
      EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
      EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

4. Start the app

   ```bash
   npx expo start
   ```

You can then open the app in different ways, I use the web (option s)

---

## Schema & Architecture (TO DISCUSS)

The app uses Firebase Firestore with the following collections. See [`/docs/diagrams`](/docs/diagrams) for the full schema diagram.

| Collection  | Description                                      |
|-------------|--------------------------------------------------|
| `users`     | User profiles, followers/following               |
| `exercises` | Global + user-created exercise library           |
| `workouts`  | Logged workout sessions                          |
| `plans`     | Reusable workout programs                        |
| `goals`     | User fitness goals and progress                  |
| `feed`      | Social feed items (shared workouts, achievements)|

---

## Project Structure

```
/app          → Screens and routing (file-based via Expo Router)
/components   → Reusable UI components
/services     → Firebase queries and data logic
/docs
  /diagrams   → Schema diagrams (.drawio + .png)
```