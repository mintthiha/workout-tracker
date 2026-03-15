import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActiveExerciseCard } from '@/components/workout/ActiveExerciseCard';
import { RestTimerModal } from '@/components/workout/RestTimerModal';
import { WorkoutTimer } from '@/components/workout/WorkoutTimer';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useWorkout } from '@/src/context/WorkoutContext';

export default function ActiveWorkoutScreen() {
  const { session, finishWorkout, discardWorkout } = useWorkout();
  const [restVisible, setRestVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [finishing, setFinishing] = useState(false);

  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const dangerColor = '#ff3b30';
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');

  // Guard: if somehow we land here with no session, go back
  if (!session) {
    router.replace('/(tabs)/workout');
    return null;
  }

  function handleSetCompleted(seconds: number) {
    setRestSeconds(seconds);
    setRestVisible(true);
  }

  async function handleFinish() {
    const completedSets = session.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0
    );

    if (completedSets === 0) {
      Alert.alert(
        'No Sets Completed',
        'Complete at least one set before finishing.',
        [{ text: 'OK' }]
      );
      return;
    }

    setFinishing(true);
    await finishWorkout();
    setFinishing(false);
    router.replace('/workout-complete');
  }

  function handleDiscard() {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            discardWorkout();
            router.replace('/(tabs)/workout');
          },
        },
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: cardBorder }]}>
        <View style={styles.headerLeft}>
          <ThemedText type="defaultSemiBold" style={styles.workoutName} numberOfLines={1}>
            {session.templateName}
          </ThemedText>
          <WorkoutTimer startedAt={session.startedAt} />
        </View>
        <TouchableOpacity onPress={handleDiscard} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Exercise list */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {session.exercises.map((exercise, idx) => (
          <ActiveExerciseCard
            key={exercise.exerciseId}
            exercise={exercise}
            exerciseIdx={idx}
            onSetCompleted={handleSetCompleted}
          />
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky finish button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.finishBtn, { backgroundColor: accentColor }, finishing && styles.finishBtnDisabled]}
          onPress={handleFinish}
          disabled={finishing}
        >
          <ThemedText style={styles.finishBtnText}>
            {finishing ? 'Saving…' : 'Finish Workout'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Rest Timer overlay */}
      <RestTimerModal
        visible={restVisible}
        seconds={restSeconds}
        onDismiss={() => setRestVisible(false)}
      />
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  workoutName: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
  },
  finishBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  finishBtnDisabled: {
    opacity: 0.6,
  },
  finishBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
