import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Exercise } from '@/src/types/workout';

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  machine: 'Machine',
  cable: 'Cable',
  bodyweight: 'Bodyweight',
  other: 'Other',
};

interface Props {
  exercise: Exercise;
  isCustom?: boolean;
  onPress: () => void;
}

export function ExerciseCard({ exercise, isCustom = false, onPress }: Props) {
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const chipBg = useThemeColor({ light: '#e8f4fd', dark: '#1a2f40' }, 'card');

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.info}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {exercise.name}
          {isCustom && (
            <ThemedText style={[styles.customTag, { color: accentColor }]}>  Custom</ThemedText>
          )}
        </ThemedText>
      </View>

      <View style={[styles.chip, { backgroundColor: chipBg }]}>
        <ThemedText style={[styles.chipText, { color: accentColor }]}>
          {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
        </ThemedText>
      </View>

      <Ionicons name="chevron-forward" size={16} color={secondaryText} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
  },
  customTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    flexShrink: 0,
  },
});
