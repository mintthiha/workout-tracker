import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { useAppContext } from "@/src/context/AppContext";
import { AppPreferences } from "@/src/lib/appStorage";
import { getUserProfile } from "../../src/lib/userService";
import { login } from "../../src/lib/authService";
import { useThemeColor } from "@/hooks/use-theme-color";

type ColorScheme = AppPreferences["colorScheme"];

const THEME_CYCLE: ColorScheme[] = ["system", "light", "dark"];

const THEME_ICON: Record<ColorScheme, React.ComponentProps<typeof Ionicons>["name"]> = {
  system: "contrast-outline",
  light: "sunny-outline",
  dark: "moon-outline",
};

const getLevelColor = (level: number) => {
  switch (level) {
    case 1: return "#9be9a8";
    case 2: return "#40c463";
    case 3: return "#30a14e";
    case 4: return "#216e39";
    default: return "#ebedf0";
  }
};

export default function ProfileScreen() {
  const {
    userId,
    userProfile,
    isLoaded,
    setAccount,
    preferences,
    updatePreferences,
    signOut,
  } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const cardBorderColor = useThemeColor({}, "cardBorder");
  const secondaryTextColor = useThemeColor({}, "secondaryText");

  const isLoggedIn = !!userId && !!userProfile;

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(preferences.colorScheme) + 1) % THEME_CYCLE.length];
    updatePreferences({ colorScheme: next });
  }

  // Refresh profile from Firestore when logged in.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const fresh = await getUserProfile(userId);
      if (fresh) {
        const { password: _omit, ...profile } = fresh;
        await setAccount(userId, profile);
      }
    })();
  }, [userId, setAccount]);

  async function handleLogin() {
    setLoginError(null);
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setLoginLoading(true);
    try {
      const result = await login(email.trim(), password);
      await setAccount(result.userId, result.profile);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setLoginError("Invalid email or password.");
      } else if (code === "auth/invalid-email") {
        setLoginError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setLoginError("Too many attempts. Please try again later.");
      } else {
        setLoginError(err?.message ?? "Login failed. Please try again.");
      }
    } finally {
      setLoginLoading(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  }

  const loading = !isLoaded;

  if (loading) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  // ── Not logged in: show login form ──
  if (!isLoggedIn) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Top Action Bar */}
            <ThemedView style={styles.topActions}>
              <View />
              <TouchableOpacity onPress={cycleTheme} style={styles.themeButton}>
                <Ionicons name={THEME_ICON[preferences.colorScheme]} size={28} color="gray" />
              </TouchableOpacity>
            </ThemedView>

            {/* Title */}
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={{ fontSize: 36 }}>Login</ThemedText>
            </ThemedView>

            {/* Login Form */}
            <View style={styles.loginContainer}>
              <Ionicons
                name="fitness-outline"
                size={72}
                color={secondaryTextColor}
                style={{ alignSelf: "center", marginBottom: 24 }}
              />

              <ThemedText style={styles.loginSubtitle}>
                Sign in to access your workout data
              </ThemedText>

              {loginError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#d32f2f" />
                  <ThemedText style={styles.errorText}>{loginError}</ThemedText>
                </View>
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    color: textColor,
                    backgroundColor: cardColor,
                    borderColor: cardBorderColor,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={secondaryTextColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                editable={!loginLoading}
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
                editable={!loginLoading}
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loginLoading}
                activeOpacity={0.7}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.loginButtonText}>Sign In</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // ── Logged in: show profile ──
  const user = userProfile;

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Top Action Bar */}
          <ThemedView style={styles.topActions}>
            <TouchableOpacity onPress={() => console.log("Settings pressed")}>
              <Ionicons name="settings-outline" size={28} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={cycleTheme} style={styles.themeButton}>
              <Ionicons name={THEME_ICON[preferences.colorScheme]} size={28} color="gray" />
            </TouchableOpacity>
          </ThemedView>

          {/* Profile Title */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={{ fontSize: 36 }}>Profile</ThemedText>
          </ThemedView>

          {/* Profile Display */}
          <ThemedView style={styles.profileSection}>
            <Image
              source={require("../../assets/images/deermic.webp")}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.name}>
                {user.firstName} {user.lastName}
              </ThemedText>
              <ThemedText style={styles.username}>@{user.username}</ThemedText>
              <ThemedText style={styles.email}>{user.email}</ThemedText>
            </View>
          </ThemedView>

          <View style={styles.separator} />

          {/* Activity Section */}
          <ThemedView style={styles.dashboardContainer}>
            <ThemedText style={styles.activityTitle}>Activity</ThemedText>
            <ThemedText style={styles.contributionCount}>
              11 workout sessions completed in the past month
            </ThemedText>

            <ThemedView style={styles.heatmapCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.heatmapInternalContainer}>
                  <View style={styles.monthsRow}>
                    {["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((month) => (
                      <ThemedText key={month} style={styles.monthLabel}>{month}</ThemedText>
                    ))}
                  </View>

                  <View style={styles.gridContainer}>
                    <View style={styles.daysColumn}>
                      <ThemedText style={styles.dayLabel}>Mon</ThemedText>
                      <ThemedText style={styles.dayLabel}>Wed</ThemedText>
                      <ThemedText style={styles.dayLabel}>Fri</ThemedText>
                    </View>

                    <View style={styles.grid}>
                      {Array.from({ length: 53 }).map((_, colIndex) => (
                        <View key={colIndex} style={styles.weekColumn}>
                          {Array.from({ length: 7 }).map((_, rowIndex) => {
                            const dayIndex = colIndex * 7 + rowIndex;
                            const contribution = contributionData.find(d => d.day === dayIndex);
                            const level = contribution ? contribution.level : 0;
                            return (
                              <View
                                key={rowIndex}
                                style={[styles.square, { backgroundColor: getLevelColor(level) }]}
                              />
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.legendContainer}>
                <ThemedText style={styles.legendText}>Less</ThemedText>
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <View key={lvl} style={[styles.square, { backgroundColor: getLevelColor(lvl) }]} />
                ))}
                <ThemedText style={styles.legendText}>More</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>

          <View style={styles.separator} />

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color="#d32f2f" />
              <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

interface Contribution {
  day: number;
  level: number;
}

const contributionData: Contribution[] = [
  { day: 1, level: 4 },
  { day: 8, level: 3 },
];

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 15,
  },
  themeButton: {
    padding: 4,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  // ── Login Section ──
  loginContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loginSubtitle: {
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
  loginButton: {
    backgroundColor: "#0a7ea4",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    flex: 1,
  },
  // ── Profile Section ──
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  profileImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
    backgroundColor: "#eee",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
  },
  username: {
    fontSize: 18,
    color: "gray",
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
  separator: {
    height: 1.5,
    backgroundColor: "#e1e1e1",
    marginVertical: 32,
    marginHorizontal: 24,
  },
  dashboardContainer: {
    paddingHorizontal: 24,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  contributionCount: {
    fontSize: 14,
    color: "gray",
    marginBottom: 16,
  },
  heatmapCard: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  heatmapInternalContainer: {
    paddingRight: 20,
  },
  monthsRow: {
    flexDirection: "row",
    marginLeft: 35,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: "gray",
    width: 32,
    marginRight: 4,
  },
  gridContainer: {
    flexDirection: "row",
  },
  daysColumn: {
    width: 35,
    justifyContent: "space-between",
    paddingVertical: 2,
    height: 110,
  },
  dayLabel: {
    fontSize: 10,
    color: "gray",
  },
  grid: {
    flexDirection: "row",
    gap: 3,
  },
  weekColumn: {
    flexDirection: "column",
    gap: 3,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: "gray",
    marginHorizontal: 4,
  },
  // ── Sign Out ──
  signOutContainer: {
    paddingHorizontal: 24,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  signOutText: {
    color: "#d32f2f",
    fontSize: 16,
    fontWeight: "600",
  },
});
