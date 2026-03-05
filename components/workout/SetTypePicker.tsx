import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SetType } from "@/src/types/workout";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

const SET_TYPES: { type: SetType; label: string; description: string }[] = [
  { type: "normal", label: "Normal", description: "Standard working set" },
  { type: "warmup", label: "Warm Up", description: "Lower weight, higher reps" },
  { type: "dropset", label: "Drop Set", description: "Reduce weight each set" },
  { type: "failure", label: "To Failure", description: "Last reps to failure" },
];

interface Props {
  visible: boolean;
  currentType: SetType;
  onClose: () => void;
  onSelect: (type: SetType) => void;
}

export default function SetTypePicker({
  visible,
  currentType,
  onClose,
  onSelect,
}: Props) {
  const cardBg = useThemeColor({ light: "#ffffff", dark: "#2c2c2e" }, "card");
  const cardBorder = useThemeColor(
    { light: "#e0e0e0", dark: "#3a3a3c" },
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
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <ThemedText style={[styles.title, { color: secondaryText }]}>
            SET TYPE
          </ThemedText>
          {SET_TYPES.map((item, index) => {
            const isSelected = currentType === item.type;
            const isLast = index === SET_TYPES.length - 1;
            return (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.option,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: cardBorder,
                  },
                  isSelected && styles.selectedOption,
                ]}
                onPress={() => {
                  onSelect(item.type);
                  onClose();
                }}
              >
                <View style={styles.optionContent}>
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      isSelected && { color: accentColor },
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  <ThemedText
                    style={[styles.optionDesc, { color: secondaryText }]}
                  >
                    {item.description}
                  </ThemedText>
                </View>
                {isSelected && (
                  <View
                    style={[styles.selectedDot, { backgroundColor: accentColor }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
    paddingVertical: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  selectedOption: {
    // highlight applied via text color only
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 12,
  },
});
