import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ExerciseSession } from '@/src/services/exerciseService';

interface Props {
  session: ExerciseSession;
  index: number;
}

function formatShortDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function ExerciseHistoryRow({ session, index }: Props) {
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const goldColor = '#ffd60a';

  const completedSets = session.sets.filter((s) => s.completed);
  const hasPR = session.sets.some((s) => s.isPersonalRecord);

  return (
    <View
      style={[
        styles.row,
        index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cardBorder },
      ]}
    >
      <View style={styles.dateCol}>
        <ThemedText style={[styles.date, { color: secondaryText }]}>
          {formatShortDate(session.date)}
        </ThemedText>
      </View>

      <View style={styles.details}>
        <ThemedText style={styles.setsText}>
          {completedSets.length} set{completedSets.length !== 1 ? 's' : ''}
          {session.bestSet
            ? `  ·  ${session.bestSet.actualWeight} lb × ${session.bestSet.actualReps}`
            : ''}
        </ThemedText>
      </View>

      {hasPR && (
        <ThemedText style={[styles.prBadge, { color: goldColor }]}>PR</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dateCol: {
    width: 52,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
  },
  details: {
    flex: 1,
  },
  setsText: {
    fontSize: 15,
  },
  prBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
