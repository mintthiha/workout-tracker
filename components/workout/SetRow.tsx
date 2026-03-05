import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SetType, WorkoutSet } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SET_BADGE: Record<SetType, string> = {
  normal: "",
  warmup: "W",
  dropset: "D",
  failure: "F",
};

const SET_BADGE_COLOR: Record<SetType, string> = {
  normal: "#3498db",
  warmup: "#f39c12",
  dropset: "#9b59b6",
  failure: "#e74c3c",
};

interface Props {
  set: WorkoutSet;
  setNumber: number;
  onUpdate: (field: "weight" | "reps", value: string) => void;
  onComplete: () => void;
  onRemove: () => void;
  onTypePress: () => void;
}

export default function SetRow({
  set,
  setNumber,
  onUpdate,
  onComplete,
  onRemove,
  onTypePress,
}: Props) {
  const secondaryText = useThemeColor(
    { light: "#666666", dark: "#8e8e93" },
    "secondaryText",
  );
  const inputBg = useThemeColor(
    { light: "#f0f0f0", dark: "#2c2c2e" },
    "card",
  );
  const completedBg = useThemeColor(
    { light: "#e8f8f0", dark: "#1a3a2a" },
    "card",
  );
  const textColor = useThemeColor(
    { light: "#161d22", dark: "#ECEDEE" },
    "text",
  );

  const badgeColor = SET_BADGE_COLOR[set.type];
  const badgeLabel =
    set.type === "normal" ? String(setNumber) : SET_BADGE[set.type];
  const rowBg = set.completed ? completedBg : "transparent";
  const borderColor = set.completed ? "#27ae60" : "transparent";

  function handleLongPressComplete() {
    Alert.alert("Remove Set", "Remove this set?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onRemove },
    ]);
  }

  function renderRightActions() {
    return (
      <TouchableOpacity style={styles.swipeDelete} onPress={onRemove}>
        <ThemedText style={styles.swipeDeleteText}>Remove</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View
        style={[
          styles.row,
          { backgroundColor: rowBg, borderColor, borderWidth: 1 },
        ]}
      >
        {/* Set type badge */}
        <TouchableOpacity
          onPress={onTypePress}
          style={[styles.badge, { backgroundColor: badgeColor }]}
        >
          <ThemedText style={styles.badgeText}>{badgeLabel}</ThemedText>
        </TouchableOpacity>

        {/* Previous */}
        <ThemedText
          style={[styles.prevText, { color: secondaryText }]}
          numberOfLines={1}
        >
          {set.previousWeight && set.previousReps
            ? `${set.previousWeight}×${set.previousReps}`
            : "—"}
        </ThemedText>

        {/* Weight input */}
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={secondaryText}
          value={set.weight}
          onChangeText={(v) => onUpdate("weight", v)}
        />

        {/* Reps input */}
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={secondaryText}
          value={set.reps}
          onChangeText={(v) => onUpdate("reps", v)}
        />

        {/* Complete button */}
        <TouchableOpacity
          onPress={onComplete}
          onLongPress={handleLongPressComplete}
          style={[
            styles.completeBtn,
            set.completed && styles.completeBtnActive,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={18}
            color={set.completed ? "#fff" : secondaryText}
          />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 8,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  prevText: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  completeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnActive: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  swipeDelete: {
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
    width: 85,
    borderRadius: 8,
    marginVertical: 3,
  },
  swipeDeleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
