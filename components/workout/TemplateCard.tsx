import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MUSCLE_GROUP_LABELS } from '@/src/data/exerciseLibrary';
import { WorkoutTemplate } from '@/src/types/workout';

interface Props {
  template: WorkoutTemplate;
  onPress: () => void;
  onLongPress: () => void;
}

export function TemplateCard({ template, onPress, onLongPress }: Props) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');

  const muscleGroups = [
    ...new Set(template.exercises.map((e) => e.muscleGroup)),
  ]
    .map((g) => MUSCLE_GROUP_LABELS[g] ?? g)
    .join(', ');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {template.name}
        </ThemedText>
        <Ionicons name="chevron-forward" size={18} color={secondaryText} />
      </View>

      <ThemedText style={[styles.meta, { color: secondaryText }]}>
        {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
        {muscleGroups ? `  ·  ${muscleGroups}` : ''}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    flex: 1,
  },
  meta: {
    fontSize: 14,
  },
});
