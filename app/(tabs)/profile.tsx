import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ProfileScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* 1. Top Left Settings Button */}
          <ThemedView style={styles.topActions}>
            <TouchableOpacity onPress={() => console.log("Settings pressed")}>
              <Ionicons name="settings-outline" size={24} color="gray" />
            </TouchableOpacity>
          </ThemedView>

          {/* 2. H1 Profile Title */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Profile</ThemedText>
          </ThemedView>

          {/* 3. Profile Section */}
          <ThemedView style={styles.profileSection}>
             <Image
               source={require("../../assets/images/deermic.webp")}
               style={styles.profileImage}
             />
            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.name}>
                Thiha Mint
              </ThemedText>
              <ThemedText style={styles.username}>@mintthers_dev</ThemedText> //hard coded for now
            </View>
          </ThemedView>

          <View style={styles.separator} />

          {/* 4. Dashboard Header */}
          <ThemedView style={styles.dashboardContainer}>
            <ThemedText type="subtitle">Dashboard</ThemedText>
            <ThemedText style={{ color: 'gray', marginTop: 4 }}>
              Your activity and statistics will appear here.
            </ThemedText>
          </ThemedView>

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
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 15,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
  },
  username: {
    fontSize: 18,
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
    gap: 8,
  },
});