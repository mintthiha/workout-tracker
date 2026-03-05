import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ActiveExercise, SetType, WorkoutSet } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import SetRow from "./SetRow";
import SetTypePicker from "./SetTypePicker";

interface Props {
  exercise: ActiveExercise;
  onUpdateSet: (setId: string, field: "weight" | "reps", value: string) => void;
  onCompleteSet: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
  onAddSet: () => void;
  onChangeSetType: (setId: string, type: SetType) => void;
}

export default function ExerciseLogger({
  exercise,
  onUpdateSet,
  onCompleteSet,
  onRemoveSet,
  onAddSet,
  onChangeSetType,
}: Props) {
  const [pickerSetId, setPickerSetId] = useState<string | null>(null);

  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );
  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );

  const activePickerSet = exercise.sets.find((s) => s.id === pickerSetId);

  // Count normal sets only (for numbering)
  let normalSetCounter = 0;

  return (
    <View style={styles.container}>
      {/* Exercise header */}
      <ThemedText style={[styles.exerciseName, { color: accentColor }]}>
        {exercise.name}
      </ThemedText>

      {/* Column headers */}
      <View style={styles.columnHeaders}>
        <ThemedText style={[styles.colHeader, styles.colSet, { color: secondaryText }]}>
          SET
        </ThemedText>
        <ThemedText style={[styles.colHeader, styles.colPrev, { color: secondaryText }]}>
          PREVIOUS
        </ThemedText>
        <ThemedText style={[styles.colHeader, styles.colInput, { color: secondaryText }]}>
          LBS
        </ThemedText>
        <ThemedText style={[styles.colHeader, styles.colInput, { color: secondaryText }]}>
          REPS
        </ThemedText>
        <View style={styles.colCheck} />
      </View>

      {/* Set rows */}
      {exercise.sets.map((set) => {
        if (set.type === "normal") normalSetCounter++;
        const displayNumber = set.type === "normal" ? normalSetCounter : 0;
        return (
          <SetRow
            key={set.id}
            set={set}
            setNumber={displayNumber}
            onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
            onComplete={() => onCompleteSet(set.id)}
            onRemove={() => onRemoveSet(set.id)}
            onTypePress={() => setPickerSetId(set.id)}
          />
        );
      })}

      {/* Add Set */}
      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={accentColor} />
        <ThemedText style={[styles.addSetText, { color: accentColor }]}>
          Add Set
        </ThemedText>
      </TouchableOpacity>

      {/* Set type picker */}
      {activePickerSet && (
        <SetTypePicker
          visible={pickerSetId !== null}
          currentType={activePickerSet.type}
          onClose={() => setPickerSetId(null)}
          onSelect={(type) => {
            if (pickerSetId) onChangeSetType(pickerSetId, type);
            setPickerSetId(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  columnHeaders: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  colSet: {
    width: 30,
  },
  colPrev: {
    flex: 1,
  },
  colInput: {
    flex: 1,
  },
  colCheck: {
    width: 32,
  },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    marginTop: 4,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
