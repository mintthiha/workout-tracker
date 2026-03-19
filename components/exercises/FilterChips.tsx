import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface Chip {
  key: string;
  label: string;
}

interface Props {
  chips: Chip[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  onClearAll: () => void;
}

export function FilterChips({ chips, selected, onToggle, onClearAll }: Props) {
  const accentColor = useThemeColor(
    { light: "#3498db", dark: "#3498db" },
    "accent",
  );
  const inactiveBg = useThemeColor(
    { light: "#f0f0f0", dark: "#2c2c2e" },
    "card",
  );
  const inactiveText = useThemeColor(
    { light: "#555", dark: "#aaa" },
    "secondaryText",
  );

  const hasSelection = selected.size > 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        flexGrow: 0,
      }} /* <-- ADD THIS: Prevents the scroll view from expanding vertically */
      contentContainerStyle={styles.row}
    >
      {/* "All" clears filter */}
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: !hasSelection ? accentColor : inactiveBg },
        ]}
        onPress={onClearAll}
      >
        <ThemedText
          style={[
            styles.chipText,
            { color: !hasSelection ? "#fff" : inactiveText },
          ]}
        >
          All
        </ThemedText>
      </TouchableOpacity>

      {chips.map((chip) => {
        const active = selected.has(chip.key);
        return (
          <TouchableOpacity
            key={chip.key}
            style={[
              styles.chip,
              { backgroundColor: active ? accentColor : inactiveBg },
            ]}
            onPress={() => onToggle(chip.key)}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: active ? "#fff" : inactiveText },
              ]}
            >
              {chip.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems:
      "center" /* <-- ADD THIS: Stops the chips from stretching to fill vertical space */,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
