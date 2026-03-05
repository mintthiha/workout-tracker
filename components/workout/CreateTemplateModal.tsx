import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TemplateExercise, WorkoutTemplate } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ExercisePickerModal from "./ExercisePickerModal";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (template: WorkoutTemplate) => void;
}

export default function CreateTemplateModal({
  visible,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const nextId = useRef(Date.now());

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
  const textColor = useThemeColor(
    { light: "#161d22", dark: "#ECEDEE" },
    "text",
  );
  const inputBg = useThemeColor(
    { light: "#ffffff", dark: "#2c2c2e" },
    "card",
  );

  function handleToggleExercise(id: string, exName: string) {
    setExercises((prev) => {
      const exists = prev.find((e) => e.id === id);
      if (exists) return prev.filter((e) => e.id !== id);
      return [...prev, { id, name: exName, defaultSets: 3 }];
    });
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a template name.");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("No exercises", "Add at least one exercise.");
      return;
    }
    onCreate({
      id: String(nextId.current++),
      name: name.trim(),
      exercises,
    });
    setName("");
    setExercises([]);
    onClose();
  }

  function handleClose() {
    setName("");
    setExercises([]);
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={secondaryText} />
            </TouchableOpacity>
            <ThemedText style={styles.title}>New Template</ThemedText>
            <TouchableOpacity onPress={handleSave}>
              <ThemedText style={[styles.saveBtn, { color: accentColor }]}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: inputBg,
                  borderColor: cardBorder,
                  color: textColor,
                },
              ]}
              placeholder="Template name"
              placeholderTextColor={secondaryText}
              value={name}
              onChangeText={setName}
            />

            {exercises.length > 0 && (
              <>
                <ThemedText
                  style={[styles.sectionLabel, { color: secondaryText }]}
                >
                  EXERCISES
                </ThemedText>
                {exercises.map((ex, index) => (
                  <View
                    key={ex.id}
                    style={[
                      styles.exerciseRow,
                      { backgroundColor: cardBg, borderColor: cardBorder },
                    ]}
                  >
                    <ThemedText
                      style={[styles.indexText, { color: accentColor }]}
                    >
                      {index + 1}
                    </ThemedText>
                    <ThemedText style={styles.exerciseName} numberOfLines={1}>
                      {ex.name}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() =>
                        setExercises((prev) =>
                          prev.filter((e) => e.id !== ex.id),
                        )
                      }
                    >
                      <Ionicons
                        name="remove-circle"
                        size={22}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <TouchableOpacity
              style={[
                styles.addExerciseBtn,
                { borderColor: accentColor },
              ]}
              onPress={() => setShowPicker(true)}
            >
              <Ionicons name="add" size={20} color={accentColor} />
              <ThemedText style={[styles.addExerciseText, { color: accentColor }]}>
                Add Exercise
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>

      <ExercisePickerModal
        visible={showPicker}
        selectedIds={exercises.map((e) => e.id)}
        onClose={() => setShowPicker(false)}
        onToggle={handleToggleExercise}
      />
    </>
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
  saveBtn: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nameInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  indexText: {
    fontSize: 14,
    fontWeight: "700",
    width: 20,
    textAlign: "center",
  },
  exerciseName: {
    flex: 1,
    fontSize: 15,
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 14,
    gap: 6,
    marginTop: 8,
  },
  addExerciseText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
