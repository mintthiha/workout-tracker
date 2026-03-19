import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={18} color="#d32f2f" />
      <ThemedText style={styles.text}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdecea",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  text: {
    color: "#d32f2f",
    fontSize: 14,
    flex: 1,
  },
});
