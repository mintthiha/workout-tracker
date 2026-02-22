import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Mock data to keep the component clean
const WORKOUT_HISTORY = [
  {
    id: "1",
    title: "pull",
    date: "Monday, Feb 20 2026",
    duration: "55min",
    weight: "1970 lb",
    prs: 5,
    exercises: [
      { name: "Chest Press (M...", sets: 1, best: "180 lb x 8" },
      { name: "Incline Bench P...", sets: 2, best: "75 lb x 7" },
      { name: "Pec Deck (Mac...", sets: 2, best: "120 lb x 10" },
      { name: "Skullcrusher (B...", sets: 2, best: "40 lb x 9" },
    ],
  },
  {
    id: "2",
    title: "push",
    date: "Tuesday, Feb 21 2026",
    duration: "1h 1min",
    weight: "8600 lb",
    prs: 21,
    exercises: [
      { name: "Chest Press (M...", sets: 3, best: "150 lb x 8" },
      { name: "Incline Bench P...", sets: 2, best: "45 lb x 8" },
      { name: "Pec Deck (Mac...", sets: 2, best: "110 lb x 10" },
      { name: "Skullcrusher (B...", sets: 2, best: "40 lb x 14" },
    ],
  },
];
export default function HistoryScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          History
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.calendarLink}>Calendar</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.monthHeader}>FEBRUARY 2026</ThemedText>

        {WORKOUT_HISTORY.map((workout) => (
          <View key={workout.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="defaultSemiBold" style={styles.workoutTitle}>
                {workout.title}
              </ThemedText>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.dateText}>{workout.date}</ThemedText>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#999" />
                <ThemedText style={styles.statText}>
                  {workout.duration}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={16} color="#999" />
                <ThemedText style={styles.statText}>
                  {workout.weight}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trophy-outline" size={16} color="#999" />
                <ThemedText style={styles.statText}>
                  {workout.prs} PRs
                </ThemedText>
              </View>
            </View>

            <View style={styles.exerciseHeaderRow}>
              <ThemedText style={styles.columnLabel}>Exercise</ThemedText>
              <ThemedText style={styles.columnLabel}>Best Set</ThemedText>
            </View>

            {workout.exercises.map((ex, index) => (
              <View key={index} style={styles.exerciseRow}>
                <ThemedText style={styles.exerciseText}>
                  {ex.sets} × {ex.name}
                </ThemedText>
                <ThemedText style={styles.exerciseText}>{ex.best}</ThemedText>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
  },
  calendarLink: {
    color: "#3498db",
    fontSize: 17,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  monthHeader: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2c2c2e",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 20,
    color: "#fff",
  },
  dateText: {
    color: "#8e8e93",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#8e8e93",
    fontSize: 14,
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  columnLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  exerciseText: {
    color: "#8e8e93",
    fontSize: 15,
  },
});
