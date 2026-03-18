import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useAppContext } from "@/src/context/AppContext";
import { LoginForm } from "@/components/login/LoginForm";
import { ThemeToggle } from "@/components/login/ThemeToggle";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function LoginScreen() {
  const { userId, userProfile, isLoaded } = useAppContext();
  const isLoggedIn = !!userId && !!userProfile;

  if (!isLoaded) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/profile" />;
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topActions}>
            <View />
            <ThemeToggle />
          </View>

          <View style={styles.titleContainer}>
            <ThemedText type="title" style={{ fontSize: 36 }}>Login</ThemedText>
          </View>

          <LoginForm />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

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
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
});
