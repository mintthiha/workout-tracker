import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppContext } from "@/src/context/AppContext";
import { register } from "@/src/lib/authService";
import { ErrorBanner } from "./ErrorBanner";

const USERNAME_REGEX = /^[a-zA-Z0-9._]+$/;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 24;
const MIN_PASSWORD_LENGTH = 6;

interface RegisterFormProps {
	onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
	const { setAccount } = useAppContext();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const textColor = useThemeColor({}, "text");
	const cardColor = useThemeColor({}, "card");
	const cardBorderColor = useThemeColor({}, "cardBorder");
	const secondaryTextColor = useThemeColor({}, "secondaryText");

	function validate(): string | null {
		if (!firstName.trim() || !lastName.trim()) {
			return "Please enter your first and last name.";
		}
		if (!email.trim()) {
			return "Please enter your email address.";
		}
		const trimmedUsername = username.trim();
		if (!trimmedUsername) {
			return "Please choose a username.";
		}
		if (
			trimmedUsername.length < MIN_USERNAME_LENGTH ||
			trimmedUsername.length > MAX_USERNAME_LENGTH
		) {
			return `Username must be ${MIN_USERNAME_LENGTH}–${MAX_USERNAME_LENGTH} characters.`;
		}
		if (!USERNAME_REGEX.test(trimmedUsername)) {
			return "Username can only contain letters, numbers, dots, and underscores.";
		}
		if (password.length < MIN_PASSWORD_LENGTH) {
			return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
		}
		if (password !== confirmPassword) {
			return "Passwords do not match.";
		}
		return null;
	}

	async function handleRegister() {
		setError(null);
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);
		try {
			const result = await register({
				email: email.trim(),
				username: username.trim(),
				password,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
			});
			await setAccount(result.userId, result.profile);
		} catch (err: any) {
			const code = err?.code;
			if (code === "auth/username-taken") {
				setError("That username is already taken.");
			} else if (code === "auth/email-already-in-use") {
				setError("An account with that email already exists.");
			} else if (code === "auth/invalid-email") {
				setError("Please enter a valid email address.");
			} else if (code === "auth/weak-password") {
				setError("Password is too weak. Use at least 6 characters.");
			} else {
				setError(err?.message ?? "Registration failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	}

	const inputStyle = [
		styles.input,
		{
			color: textColor,
			backgroundColor: cardColor,
			borderColor: cardBorderColor,
		},
	];

	return (
		<View style={styles.container}>
			<Ionicons
				name="person-add-outline"
				size={64}
				color={secondaryTextColor}
				style={{ alignSelf: "center", marginBottom: 24 }}
			/>

			<ThemedText style={styles.subtitle}>Create an account to start tracking</ThemedText>

			{error && <ErrorBanner message={error} />}

			<View style={styles.nameRow}>
				<TextInput
					style={[inputStyle, styles.nameInput]}
					placeholder="First name"
					placeholderTextColor={secondaryTextColor}
					value={firstName}
					onChangeText={setFirstName}
					autoCapitalize="words"
					textContentType="givenName"
					autoComplete="given-name"
					editable={!loading}
				/>
				<TextInput
					style={[inputStyle, styles.nameInput]}
					placeholder="Last name"
					placeholderTextColor={secondaryTextColor}
					value={lastName}
					onChangeText={setLastName}
					autoCapitalize="words"
					textContentType="familyName"
					autoComplete="family-name"
					editable={!loading}
				/>
			</View>

			<TextInput
				style={inputStyle}
				placeholder="Email"
				placeholderTextColor={secondaryTextColor}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				textContentType="emailAddress"
				autoComplete="email"
				editable={!loading}
			/>

			<TextInput
				style={inputStyle}
				placeholder="Username"
				placeholderTextColor={secondaryTextColor}
				value={username}
				onChangeText={setUsername}
				autoCapitalize="none"
				autoCorrect={false}
				textContentType="username"
				autoComplete="username-new"
				editable={!loading}
			/>

			<TextInput
				style={inputStyle}
				placeholder="Password"
				placeholderTextColor={secondaryTextColor}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				textContentType="newPassword"
				autoComplete="new-password"
				editable={!loading}
			/>

			<TextInput
				style={inputStyle}
				placeholder="Confirm password"
				placeholderTextColor={secondaryTextColor}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				textContentType="newPassword"
				autoComplete="new-password"
				editable={!loading}
				onSubmitEditing={handleRegister}
			/>

			<TouchableOpacity
				style={[styles.button, loading && styles.buttonDisabled]}
				onPress={handleRegister}
				disabled={loading}
				activeOpacity={0.7}
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<ThemedText style={styles.buttonText}>Create Account</ThemedText>
				)}
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.switchLink}
				onPress={onSwitchToLogin}
				disabled={loading}
			>
				<ThemedText style={[styles.switchText, { color: secondaryTextColor }]}>
					Already have an account?{" "}
				</ThemedText>
				<ThemedText style={styles.switchAction}>Sign In</ThemedText>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
		paddingTop: 20,
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
		marginBottom: 32,
	},
	nameRow: {
		flexDirection: "row",
		gap: 12,
	},
	nameInput: {
		flex: 1,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 16,
		fontSize: 16,
		marginBottom: 16,
	},
	button: {
		backgroundColor: "#0a7ea4",
		height: 50,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 8,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontSize: 17,
		fontWeight: "600",
	},
	switchLink: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 20,
	},
	switchText: {
		fontSize: 15,
	},
	switchAction: {
		fontSize: 15,
		color: "#0a7ea4",
		fontWeight: "600",
	},
});
