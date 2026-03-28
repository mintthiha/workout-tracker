import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseHistoryRow } from '@/components/exercises/ExerciseHistoryRow';
import { ExerciseImage } from '@/components/exercises/ExerciseImage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { EXERCISE_LIBRARY, MUSCLE_GROUP_LABELS } from '@/src/data/exerciseLibrary';
import { useAppContext } from '@/src/context/AppContext';
import * as exerciseService from '@/src/services/exerciseService';
import * as workoutService from '@/src/services/workoutService';
import { Exercise, WorkoutLog } from '@/src/types/workout';

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell', dumbbell: 'Dumbbell', machine: 'Machine',
  cable: 'Cable', bodyweight: 'Bodyweight', other: 'Other',
};

export default function ExerciseDetailScreen() {
  const { userId, isLoaded } = useAppContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const heroSize = width - 32; // 16px padding each side

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);

  if (isLoaded && !userId) return <Redirect href="/login" />;

  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const tertiaryText = useThemeColor({ light: '#999999', dark: '#666666' }, 'tertiaryText');
  const goldColor = '#ffd60a';

  useEffect(() => {
    if (!id || !userId) return;
    async function load() {
      // Try local library first (fast), then custom, then Firestore
      let found: Exercise | null =
        EXERCISE_LIBRARY.find((e) => e.id === id) ?? null;
      let custom = false;

      if (!found) {
        const customs = await exerciseService.getCustomExercises(userId!);
        found = customs.find((e) => e.id === id) ?? null;
        if (found) custom = true;
      }

      if (!found) {
        // Last resort: fetch all from Firestore and find by id
        const all = await exerciseService.getExercises();
        found = all.find((e) => e.id === id) ?? null;
      }

      setExercise(found);
      setIsCustom(custom);

      const workoutLogs = await workoutService.getWorkoutLogs(userId!);
      setLogs(workoutLogs);
      setLoading(false);
    }
    load();
  }, [id, userId]);

  const history = useMemo(
    () => (exercise ? exerciseService.getExerciseHistory(exercise.id, logs) : []),
    [exercise, logs]
  );

  const prs = useMemo(
    () => (exercise ? exerciseService.getExercisePRs(exercise.id, logs) : { bestSet: null, bestVolume: 0 }),
    [exercise, logs]
  );

  function handleDelete() {
    Alert.alert('Delete Exercise', `Delete "${exercise?.name}"? This only removes it from your custom list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await exerciseService.deleteCustomExercise(userId!, id!);
          router.back();
        },
      },
    ]);
  }

  if (loading || !exercise) {
    return (
      <ThemedView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={accentColor} />
          <ThemedText style={[styles.backText, { color: accentColor }]}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.loadingText, { color: secondaryText }]}>
          {loading ? 'Loading…' : 'Exercise not found.'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={accentColor} />
          <ThemedText style={[styles.backText, { color: accentColor }]}>Back</ThemedText>
        </TouchableOpacity>
        {isCustom && (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero image / placeholder */}
        <ExerciseImage
          imageUrl={exercise.imageUrl}
          muscleGroup={exercise.muscleGroup}
          size={heroSize}
          height={220}
          borderRadius={16}
        />

        {/* Title */}
        <ThemedText type="title" style={styles.exerciseName}>
          {exercise.name}
        </ThemedText>

        {/* Meta chips */}
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <ThemedText style={[styles.metaChipText, { color: secondaryText }]}>
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
            </ThemedText>
          </View>
          <View style={[styles.metaChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <ThemedText style={[styles.metaChipText, { color: secondaryText }]}>
              {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
            </ThemedText>
          </View>
          {isCustom && (
            <View style={[styles.metaChip, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <ThemedText style={[styles.metaChipText, { color: accentColor }]}>
                Custom
              </ThemedText>
            </View>
          )}
        </View>

        {/* PRs */}
        <ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
          PERSONAL RECORDS
        </ThemedText>
        <View style={[styles.prCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.prItem}>
            <Ionicons name="trophy" size={20} color={goldColor} />
            <View style={styles.prTextCol}>
              <ThemedText style={[styles.prLabel, { color: secondaryText }]}>Best Set</ThemedText>
              <ThemedText style={styles.prValue}>
                {prs.bestSet
                  ? `${prs.bestSet.actualWeight} lb × ${prs.bestSet.actualReps}`
                  : '—'}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.prDivider, { backgroundColor: cardBorder }]} />
          <View style={styles.prItem}>
            <Ionicons name="barbell" size={20} color={goldColor} />
            <View style={styles.prTextCol}>
              <ThemedText style={[styles.prLabel, { color: secondaryText }]}>Best Volume</ThemedText>
              <ThemedText style={styles.prValue}>
                {prs.bestVolume > 0
                  ? `${Math.round(prs.bestVolume).toLocaleString()} lb`
                  : '—'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* History */}
        <ThemedText style={[styles.sectionLabel, { color: secondaryText }]}>
          RECENT SESSIONS
          <ThemedText style={[styles.historyCount, { color: tertiaryText }]}>
            {history.length > 0 ? `  (${history.length})` : ''}
          </ThemedText>
        </ThemedText>

        {history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <ThemedText style={[styles.emptyHistoryText, { color: tertiaryText }]}>
              No sessions logged yet.
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.historyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {history.slice(0, 10).map((session, idx) => (
              <ExerciseHistoryRow key={session.date} session={session} index={idx} />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 17,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  metaChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  prCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  prItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  prTextCol: {
    flex: 1,
  },
  prLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  prValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  historyCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  emptyHistory: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 15,
  },
});
