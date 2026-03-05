import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { HistoryEntry } from "@/src/store/historyStore";
import { ActiveExercise, SetType, WorkoutTemplate } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ExerciseLogger from "./ExerciseLogger";

interface Props {
  visible: boolean;
  template: WorkoutTemplate | null;
  onClose: () => void;
  onFinish: (entry: HistoryEntry) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMonthYear(d: Date): string {
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

function makeInitialExercises(template: WorkoutTemplate): ActiveExercise[] {
  return template.exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    sets: Array.from({ length: ex.defaultSets }, (_, i) => ({
      id: `${ex.id}-set-${i}`,
      type: "normal" as const,
      weight: "",
      reps: "",
      completed: false,
    })),
  }));
}

export default function WorkoutLoggerModal({
  visible,
  template,
  onClose,
  onFinish,
}: Props) {
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );
  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );
  const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#1c1c1e" }, "card");
  const cardBorder = useThemeColor(
    { light: "#e0e0e0", dark: "#2c2c2e" },
    "cardBorder",
  );

  // Init exercises + timer when modal opens
  useEffect(() => {
    if (visible && template) {
      setExercises(makeInitialExercises(template));
      setElapsed(0);
      startTime.current = new Date();
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, template]);

  function updateSet(
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: string,
  ) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s,
              ),
            },
      ),
    );
  }

  function completeSet(exerciseId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, completed: !s.completed } : s,
              ),
            },
      ),
    );
  }

  function removeSet(exerciseId: string, setId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) },
      ),
    );
  }

  function addSet(exerciseId: string) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: `${exerciseId}-set-${Date.now()}`,
                  type: "normal" as const,
                  weight: "",
                  reps: "",
                  completed: false,
                },
              ],
            },
      ),
    );
  }

  function changeSetType(exerciseId: string, setId: string, type: SetType) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, type } : s,
              ),
            },
      ),
    );
  }

  function handleFinish() {
    if (!template || !startTime.current) return;

    const now = new Date();
    const durationSec = Math.floor(
      (now.getTime() - startTime.current.getTime()) / 1000,
    );

    // Compute total volume
    let totalVolume = 0;
    const summaryExercises = exercises.map((ex) => {
      let bestVol = 0;
      let bestSet = { weight: "0", reps: "0" };
      let completedSets = 0;

      ex.sets.forEach((s) => {
        if (s.completed) {
          completedSets++;
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps) || 0;
          const vol = w * r;
          totalVolume += vol;
          if (vol > bestVol) {
            bestVol = vol;
            bestSet = { weight: s.weight || "0", reps: s.reps || "0" };
          }
        }
      });

      return {
        name: ex.name,
        sets: completedSets,
        best: `${bestSet.weight} lb × ${bestSet.reps}`,
      };
    });

    const entry: HistoryEntry = {
      id: String(Date.now()),
      title: template.name,
      date: formatDate(now),
      monthYear: formatMonthYear(now),
      duration: formatDuration(durationSec),
      weight: `${Math.round(totalVolume).toLocaleString()} lb`,
      prs: 0,
      exercises: summaryExercises,
    };

    if (timerRef.current) clearInterval(timerRef.current);
    onFinish(entry);
  }

  function handleDiscard() {
    Alert.alert("Discard Workout", "Are you sure? All progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          onClose();
        },
      },
    ]);
  }

  if (!template) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleDiscard}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDiscard} style={styles.discardBtn}>
            <Ionicons name="close" size={24} color="#e74c3c" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <ThemedText style={styles.templateName}>{template.name}</ThemedText>
            <ThemedText style={[styles.timer, { color: accentColor }]}>
              {formatDuration(elapsed)}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: accentColor }]}
            onPress={handleFinish}
          >
            <ThemedText style={styles.finishBtnText}>Finish</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Exercise list */}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {exercises.map((ex) => (
            <ExerciseLogger
              key={ex.id}
              exercise={ex}
              onUpdateSet={(setId, field, value) =>
                updateSet(ex.id, setId, field, value)
              }
              onCompleteSet={(setId) => completeSet(ex.id, setId)}
              onRemoveSet={(setId) => removeSet(ex.id, setId)}
              onAddSet={() => addSet(ex.id)}
              onChangeSetType={(setId, type) =>
                changeSetType(ex.id, setId, type)
              }
            />
          ))}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  discardBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "700",
  },
  timer: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  finishBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  finishBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
});
