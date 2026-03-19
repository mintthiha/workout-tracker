import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile } from "./userService";
import { CachedProfile } from "./appStorage";

export interface LoginResult {
  userId: string;
  profile: CachedProfile;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  const profile = await getUserProfile(uid);
  if (!profile) {
    throw { code: "auth/user-not-found" };
  }

  return { userId: uid, profile };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
