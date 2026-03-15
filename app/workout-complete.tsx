import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useWorkout } from '@/src/context/WorkoutContext';
import { formatDate, formatDuration, getBestSet } from '@/src/services/workoutService';
import { LoggedExercise } from '@/src/types/workout';

export default function WorkoutCompleteScreen() {
  const { completedLog, clearCompletedLog } = useWorkout();

  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const goldColor = '#ffd60a';

  function handleDone() {
    clearCompletedLog();
    router.replace('/(tabs)/workout');
  }

  if (!completedLog) {
    router.replace('/(tabs)/workout');
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Trophy */}
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={64} color={goldColor} />
        </View>

        <ThemedText style={styles.title}>Workout Complete!</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.workoutName}>
          {completedLog.templateName}
        </ThemedText>
        <ThemedText style={[styles.dateText, { color: secondaryText }]}>
          {formatDate(completedLog.completedAt)}
        </ThemedText>

        {/* Stats row */}
        <View style={[styles.statsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <StatItem
            icon="time-outline"
            label="Duration"
            value={formatDuration(completedLog.durationSeconds)}
            secondaryText={secondaryText}
          />
          <View style={[styles.statDivider, { backgroundColor: cardBorder }]} />
          <StatItem
            icon="barbell-outline"
            label="Volume"
            value={`${Math.round(completedLog.totalVolumeLbs).toLocaleString()} lb`}
            secondaryText={secondaryText}
          />
          <View style={[styles.statDivider, { backgroundColor: cardBorder }]} />
          <StatItem
            icon="trophy-outline"
            label="PRs"
            value={String(completedLog.personalRecords)}
            secondaryText={secondaryText}
            valueColor={completedLog.personalRecords > 0 ? goldColor : undefined}
          />
        </View>

        {/* Exercise breakdown */}
        <ThemedText style={[styles.sectionHeader, { color: secondaryText }]}>
          EXERCISES
        </ThemedText>
        <View style={[styles.exerciseList, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {completedLog.exercises.map((ex, idx) => (
            <ExerciseResult
              key={ex.exerciseId}
              exercise={ex}
              index={idx}
              cardBorder={cardBorder}
              secondaryText={secondaryText}
              goldColor={goldColor}
            />
          ))}
        </View>
      </ScrollView>

      {/* Done button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: accentColor }]}
          onPress={handleDone}
        >
          <ThemedText style={styles.doneBtnText}>Done</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({
  icon,
  label,
  value,
  secondaryText,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  secondaryText: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={20} color={secondaryText} />
      <ThemedText style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: secondaryText }]}>{label}</ThemedText>
    </View>
  );
}

function ExerciseResult({
  exercise,
  index,
  cardBorder,
  secondaryText,
  goldColor,
}: {
  exercise: LoggedExercise;
  index: number;
  cardBorder: string;
  secondaryText: string;
  goldColor: string;
}) {
  const completedSets = exercise.sets.filter((s) => s.completed);
  const bestSet = getBestSet(exercise.sets);
  const hasPR = exercise.sets.some((s) => s.isPersonalRecord);

  return (
    <View
      style={[
        styles.exerciseResult,
        index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cardBorder },
      ]}
    >
      <View style={styles.exerciseResultRow}>
        <ThemedText type="defaultSemiBold" style={styles.exerciseResultName}>
          {exercise.exerciseName}
        </ThemedText>
        {hasPR && (
          <View style={styles.prBadge}>
            <Ionicons name="star" size={12} color={goldColor} />
            <ThemedText style={[styles.prText, { color: goldColor }]}>PR</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={[styles.exerciseResultMeta, { color: secondaryText }]}>
        {completedSets.length} set{completedSets.length !== 1 ? 's' : ''}
        {bestSet
          ? `  ·  Best: ${bestSet.actualWeight} lb × ${bestSet.actualReps}`
          : ''}
      </ThemedText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  workoutName: {
    fontSize: 20,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 20,
    width: '100%',
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  exerciseList: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  exerciseResult: {
    paddingVertical: 14,
  },
  exerciseResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  exerciseResultName: {
    fontSize: 15,
  },
  exerciseResultMeta: {
    fontSize: 13,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  prText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
  },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
