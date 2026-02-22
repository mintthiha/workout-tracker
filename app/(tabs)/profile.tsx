import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// 2. Map levels to GitHub-style greens
const getLevelColor = (level: number) => {
  switch (level) {
    case 1: return "#9be9a8"; // Lightest green
    case 2: return "#40c463";
    case 3: return "#30a14e";
    case 4: return "#216e39"; // Darkest green
    default: return "#ebedf0"; // Empty/Gray
  }
};

export default function ProfileScreen() {
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

          {/* Profile Section */}
          <ThemedView style={styles.profileSection}>
             <Image
               source={require("../../assets/images/deermic.webp")}
               style={styles.profileImage}
             />
            <View style={styles.profileInfo}>
              <ThemedText type="defaultSemiBold" style={styles.name}>
                Thiha Mint
              </ThemedText>
              <ThemedText style={styles.username}>@mintthers_dev</ThemedText>
            </View>
          </ThemedView>

          <View style={styles.separator} />

{/* 4. Activity Section */}
          <ThemedView style={styles.dashboardContainer}>
            <ThemedText style={styles.activityTitle}>Activity</ThemedText>
            <ThemedText style={styles.contributionCount}>
              11 workout sessions completed in the past month
            </ThemedText>

            <ThemedView style={styles.heatmapCard}>
              {/* Horizontal ScrollView makes the grid accessible on small screens */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.heatmapInternalContainer}>
                  
                  {/* Months Row */}
                  <View style={styles.monthsRow}>
                    {["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((month) => (
                      <ThemedText key={month} style={styles.monthLabel}>{month}</ThemedText>
                    ))}
                  </View>

                  <View style={styles.gridContainer}>
                    {/* Days Labels Column */}
                    <View style={styles.daysColumn}>
                      <ThemedText style={styles.dayLabel}>Mon</ThemedText>
                      <ThemedText style={styles.dayLabel}>Wed</ThemedText>
                      <ThemedText style={styles.dayLabel}>Fri</ThemedText>
                    </View>

                    {/* The Grid */}
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

              {/* Legend Footer */}
              <View style={styles.legendContainer}>
                <ThemedText style={styles.legendText}>Less</ThemedText>
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <View key={lvl} style={[styles.square, { backgroundColor: getLevelColor(lvl) }]} />
                ))}
                <ThemedText style={styles.legendText}>More</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>

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
  },
  heatmapWrapper: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  contributionCount: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 16,
  },
  heatmapCard: {
    backgroundColor: 'rgba(0,0,0,0.03)', // Subtle background like GitHub dark mode cards
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  heatmapInternalContainer: {
    paddingRight: 20, // Extra space at the end of the scroll
  },
  monthsRow: {
    flexDirection: 'row',
    marginLeft: 35, // Aligns with the grid (offset for Mon/Wed/Fri labels)
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: 'gray',
    width: 32, // Consistent spacing for the month headers
    marginRight: 4,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  daysColumn: {
    width: 35,
    justifyContent: 'space-between',
    paddingVertical: 2,
    height: 110, // Matches height of 7 squares + gaps
  },
  dayLabel: {
    fontSize: 10,
    color: 'gray',
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 3,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: 'gray',
    marginHorizontal: 4,
  }
});