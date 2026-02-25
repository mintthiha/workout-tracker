import { Image } from "expo-image";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { getUserProfile, UserProfile } from "../../src/lib/userService";

// TODO: Replace with real auth user ID once Firebase Auth is wired up, and 
// implementing the login page.
const TEMP_USER_ID = "default_user";

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await getUserProfile(TEMP_USER_ID);
      setUser(profile);
      setLoading(false);
    })();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Top Left Settings Button */}
          <ThemedView style={styles.topActions}>
            <TouchableOpacity onPress={() => console.log("Settings pressed")}>
              <Ionicons name="settings-outline" size={28} color="gray" />
            </TouchableOpacity>
          </ThemedView>

          {/* Profile Title */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={{ fontSize: 36 }}>Profile</ThemedText>
          </ThemedView>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : !user ? (
            /* ── No User Warning ── */
            <ThemedView style={styles.noUserContainer}>
              <Ionicons name="person-circle-outline" size={56} color="gray" />
              <ThemedText style={styles.noUserText}>No profile found.</ThemedText>
              <ThemedText style={styles.noUserSubtext}>
                Make sure a user document exists in Firestore under{" "}
                <ThemedText style={styles.noUserCode}>users/default_user</ThemedText>.
              </ThemedText>
            </ThemedView>
          ) : (
            /* ── Profile Display ── */
            <>
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
            </>
          )}

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
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 15,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  // ── No User Warning Section ──
  noUserContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 12,
  },
  noUserText: {
    fontSize: 20,
    fontWeight: "600",
  },
  noUserSubtext: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    lineHeight: 20,
  },
  noUserCode: {
    fontFamily: "monospace",
    color: "gray",
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
});