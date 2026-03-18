import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { CachedProfile } from "./appStorage";
import { UserProfile } from "./userService";

export interface LoginResult {
  userId: string;
  profile: CachedProfile;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw { code: "auth/user-not-found" };
  }

  const userDoc = snapshot.docs[0];
  const data = userDoc.data() as UserProfile;

  if (data.password !== password) {
    throw { code: "auth/wrong-password" };
  }

  const { password: _omit, ...profile } = data;
  return { userId: userDoc.id, profile };
}

export async function signOut(): Promise<void> {
  // No Firebase Auth session to clear — auth is Firestore-based.
}
