import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { WorkoutTemplate } from "@/src/types/workout";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  template: WorkoutTemplate;
  onPress: () => void;
}

export default function TemplateCard({ template, onPress }: Props) {
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
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <ThemedText style={styles.name}>{template.name}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
            {template.exercises.length} exercise
            {template.exercises.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={accentColor} />
      </View>

      <View style={styles.exerciseList}>
        {template.exercises.map((ex) => (
          <ThemedText
            key={ex.id}
            style={[styles.exerciseItem, { color: secondaryText }]}
            numberOfLines={1}
          >
            · {ex.defaultSets} × {ex.name}
          </ThemedText>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  exerciseList: {
    gap: 3,
  },
  exerciseItem: {
    fontSize: 14,
  },
});
