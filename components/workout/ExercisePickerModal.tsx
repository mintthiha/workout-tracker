import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { MOCK_EXERCISES } from "@/src/data/mockWorkoutData";
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
  selectedIds: string[];
  onClose: () => void;
  onToggle: (id: string, name: string) => void;
}

export default function ExercisePickerModal({
  visible,
  selectedIds,
  onClose,
  onToggle,
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={secondaryText} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Add Exercise</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
          ALL EXERCISES
        </ThemedText>

        <ScrollView contentContainerStyle={styles.list}>
          {MOCK_EXERCISES.map((ex) => {
            const selected = selectedIds.includes(ex.id);
            return (
              <TouchableOpacity
                key={ex.id}
                style={[
                  styles.row,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                  selected && { borderColor: accentColor },
                ]}
                onPress={() => onToggle(ex.id, ex.name)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.exerciseName}>{ex.name}</ThemedText>
                {selected && (
                  <Ionicons name="checkmark-circle" size={22} color={accentColor} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    paddingBottom: 12,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  exerciseName: {
    fontSize: 16,
    flex: 1,
  },
});
