import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

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
