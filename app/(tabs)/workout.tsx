import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CreateTemplateModal from "@/components/workout/CreateTemplateModal";
import TemplateCard from "@/components/workout/TemplateCard";
import TemplateDetailModal from "@/components/workout/TemplateDetailModal";
import WorkoutLoggerModal from "@/components/workout/WorkoutLoggerModal";
import { useThemeColor } from "@/hooks/use-theme-color";
import { INITIAL_TEMPLATES } from "@/src/data/mockWorkoutData";
import { useHistory } from "@/src/store/historyStore";
import { WorkoutTemplate } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

export default function WorkoutScreen() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(INITIAL_TEMPLATES);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const selectedTemplate = useRef<WorkoutTemplate | null>(null);

  const { addEntry } = useHistory();

  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );
  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );

  function openDetail(template: WorkoutTemplate) {
    selectedTemplate.current = template;
    setShowDetail(true);
  }

  function startWorkout() {
    setShowDetail(false);
    setShowLogger(true);
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Workout
        </ThemedText>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={26} color={accentColor} />
        </TouchableOpacity>
      </View>

      {/* Template list */}
      <FlatList
        data={templates}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TemplateCard template={item} onPress={() => openDetail(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={secondaryText} />
            <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
              No templates yet.{"\n"}Tap + to create one.
            </ThemedText>
          </View>
        }
      />

      {/* Modals */}
      <TemplateDetailModal
        visible={showDetail}
        template={selectedTemplate.current}
        onClose={() => setShowDetail(false)}
        onStart={startWorkout}
      />

      <CreateTemplateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(t) => setTemplates((prev) => [...prev, t])}
      />

      <WorkoutLoggerModal
        visible={showLogger}
        template={selectedTemplate.current}
        onClose={() => setShowLogger(false)}
        onFinish={(entry) => {
          addEntry(entry);
          setShowLogger(false);
        }}
      />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
  },
  addBtn: {
    padding: 4,
  },
  list: {
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
});
