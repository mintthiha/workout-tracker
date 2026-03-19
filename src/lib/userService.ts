import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
	firstName: string;
	lastName: string;
	email: string;
	username: string;
}

export const createUserProfile = async (userId: string, data: UserProfile): Promise<void> => {
	await setDoc(doc(db, "users", userId), data);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
	const snap = await getDoc(doc(db, "users", userId));
	return snap.exists() ? (snap.data() as UserProfile) : null;
};

/** Returns true if a Firestore profile already uses this username. */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
	const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
	const snap = await getDocs(q);
	return !snap.empty;
};

/**
 * Look up the email address associated with a username.
 * Returns null if no user has that username.
 */
export const getEmailByUsername = async (username: string): Promise<string | null> => {
	const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
	const snap = await getDocs(q);
	if (snap.empty) return null;
	const data = snap.docs[0].data() as UserProfile;
	return data.email;
};
