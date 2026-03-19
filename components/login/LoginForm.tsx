import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { login } from "@/src/lib/authService";
import { useAppContext } from "@/src/context/AppContext";
import { ErrorBanner } from "./ErrorBanner";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { setAccount } = useAppContext();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const cardBorderColor = useThemeColor({}, "cardBorder");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  async function handleLogin() {
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email or username and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      await setAccount(result.userId, result.profile);
      setIdentifier("");
      setPassword("");
    } catch (err: any) {
      const code = err?.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email/username or password.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err?.message ?? "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="fitness-outline"
        size={72}
        color={secondaryTextColor}
        style={{ alignSelf: "center", marginBottom: 24 }}
      />

      <ThemedText style={styles.subtitle}>
        Sign in to access your workout data
      </ThemedText>

      {error && <ErrorBanner message={error} />}

      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: cardColor,
            borderColor: cardBorderColor,
          },
        ]}
        placeholder="Email or username"
        placeholderTextColor={secondaryTextColor}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        editable={!loading}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: cardColor,
            borderColor: cardBorderColor,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={secondaryTextColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        editable={!loading}
        onSubmitEditing={handleLogin}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>Sign In</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchLink}
        onPress={onSwitchToRegister}
        disabled={loading}
      >
        <ThemedText style={[styles.switchText, { color: secondaryTextColor }]}>
          Don't have an account?{" "}
        </ThemedText>
        <ThemedText style={styles.switchAction}>Create Account</ThemedText>
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
