import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// TODO: Replace password storage here with Firebase Auth once auth flow is added.
// Storing plaintext passwords in Firestore is insecure for production.

// Move this to a folder to make it more modular 
// once multiple services uses this interface
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
} // We can add more things here

export const createUserProfile = async (
  userId: string,
  data: UserProfile
): Promise<void> => {
  await setDoc(doc(db, "users", userId), data);
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};