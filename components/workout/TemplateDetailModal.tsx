import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { WorkoutTemplate } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  template: WorkoutTemplate | null;
  onClose: () => void;
  onStart: () => void;
}

export default function TemplateDetailModal({
  visible,
  template,
  onClose,
  onStart,
}: Props) {
  const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
  const cardBorder = useThemeColor(
    { light: "#e0e0e0", dark: "#2c2c2e" },
    "cardBorder",
  );
  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );
  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );

  if (!template) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={secondaryText} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>{template.name}</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
            EXERCISES
          </ThemedText>

          {template.exercises.map((ex, index) => (
            <View
              key={ex.id}
              style={[
                styles.exerciseRow,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={styles.exerciseIndex}>
                <ThemedText style={[styles.indexText, { color: accentColor }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>{ex.name}</ThemedText>
                <ThemedText style={[styles.setCount, { color: secondaryText }]}>
                  {ex.defaultSets} sets
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Start Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: accentColor }]}
            onPress={onStart}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <ThemedText style={styles.startBtnText}>Start Workout</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  placeholder: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 14,
    fontWeight: "700",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  setCount: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
