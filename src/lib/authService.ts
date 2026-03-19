import {
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { CachedProfile } from "./appStorage";
import { auth } from "./firebase";
import {
	createUserProfile,
	getEmailByUsername,
	getUserProfile,
	isUsernameTaken,
	UserProfile,
} from "./userService";

export interface LoginResult {
	userId: string;
	profile: CachedProfile;
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
	let email: string;

	if (identifier.includes("@")) {
		email = identifier;
	} else {
		const resolved = await getEmailByUsername(identifier);
		if (!resolved) {
			throw { code: "auth/user-not-found" };
		}
		email = resolved;
	}

	const credential = await signInWithEmailAndPassword(auth, email, password);
	const uid = credential.user.uid;

	const profile = await getUserProfile(uid);
	if (!profile) {
		throw { code: "auth/user-not-found" };
	}

	return { userId: uid, profile };
}

export interface RegisterData {
	email: string;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
}

export async function register(data: RegisterData): Promise<LoginResult> {
	const usernameLower = data.username.toLowerCase();

	if (await isUsernameTaken(usernameLower)) {
		throw { code: "auth/username-taken" };
	}

	const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
	const uid = credential.user.uid;

	const profile: UserProfile = {
		firstName: data.firstName.trim(),
		lastName: data.lastName.trim(),
		email: data.email.toLowerCase().trim(),
		username: usernameLower,
	};

	await createUserProfile(uid, profile);
	return { userId: uid, profile };
}

export async function signOut(): Promise<void> {
	await firebaseSignOut(auth);
}
