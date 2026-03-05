import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useHistory } from "@/src/store/historyStore";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

function groupByMonth(entries: ReturnType<typeof useHistory>["entries"]) {
  const map = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = map.get(entry.monthYear) ?? [];
    list.push(entry);
    map.set(entry.monthYear, list);
  }
  return map;
}

export default function HistoryScreen() {
  const { entries, deleteEntry } = useHistory();

  const grouped = useMemo(() => groupByMonth(entries), [entries]);
  const months = Array.from(grouped.keys());

  const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
  const cardBorder = useThemeColor(
    { light: "#e0e0e0", dark: "#2c2c2e" },
    "cardBorder",
  );
  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );
  const tertiaryText = useThemeColor(
    { light: "#999999", dark: "#666666" },
    "tertiaryText",
  );
  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          History
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.calendarLink, { color: accentColor }]}>
            Calendar
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {months.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={secondaryText} />
            <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
              No workouts yet.{"\n"}Finish a workout to see it here.
            </ThemedText>
          </View>
        )}

        {months.map((month) => (
          <View key={month}>
            <ThemedText
              style={[styles.monthHeader, { color: secondaryText }]}
            >
              {month}
            </ThemedText>

            {grouped.get(month)!.map((workout) => (
              <View
                key={workout.id}
                style={[
                  styles.card,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={styles.workoutTitle}
                  >
                    {workout.title}
                  </ThemedText>
                  <TouchableOpacity onPress={() => deleteEntry(workout.id)}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={secondaryText}
                    />
                  </TouchableOpacity>
                </View>

                <ThemedText
                  style={[styles.dateText, { color: secondaryText }]}
                >
                  {workout.date}
                </ThemedText>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={tertiaryText}
                    />
                    <ThemedText
                      style={[styles.statText, { color: secondaryText }]}
                    >
                      {workout.duration}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={tertiaryText}
                    />
                    <ThemedText
                      style={[styles.statText, { color: secondaryText }]}
                    >
                      {workout.weight}
                    </ThemedText>
                  </View>
                  {workout.prs > 0 && (
                    <View style={styles.statItem}>
                      <Ionicons
                        name="trophy-outline"
                        size={16}
                        color={tertiaryText}
                      />
                      <ThemedText
                        style={[styles.statText, { color: secondaryText }]}
                      >
                        {workout.prs} PRs
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.exerciseHeaderRow}>
                  <ThemedText
                    style={[styles.columnLabel, { color: secondaryText }]}
                  >
                    Exercise
                  </ThemedText>
                  <ThemedText
                    style={[styles.columnLabel, { color: secondaryText }]}
                  >
                    Best Set
                  </ThemedText>
                </View>

                {workout.exercises.map((ex, index) => (
                  <View key={index} style={styles.exerciseRow}>
                    <ThemedText
                      style={[styles.exerciseText, { color: secondaryText }]}
                    >
                      {ex.sets} × {ex.name}
                    </ThemedText>
                    <ThemedText
                      style={[styles.exerciseText, { color: secondaryText }]}
                    >
                      {ex.best}
                    </ThemedText>
                  </View>
                ))}
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
    fontSize: 17,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  monthHeader: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 20,
  },
  dateText: {
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
    fontSize: 14,
  },
  exerciseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  columnLabel: {
    fontWeight: "700",
    fontSize: 16,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  exerciseText: {
    fontSize: 15,
  },
});
