import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseListItem } from '@/components/workout/ExerciseListItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as workoutService from '@/src/services/workoutService';
import { WorkoutTemplate } from '@/src/types/workout';
import { useWorkout } from '@/src/context/WorkoutContext';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const { startWorkout } = useWorkout();

  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');

  useEffect(() => {
    if (!id) return;
    workoutService.getTemplate(id).then((t) => {
      if (!t) {
        Alert.alert('Not Found', 'This template no longer exists.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      setTemplate(t);
    });
  }, [id]);

  function handleStartWorkout() {
    if (!template) return;
    startWorkout(template);
    router.push('/active-workout');
  }

  if (!template) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.loadingText, { color: secondaryText }]}>Loading…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={accentColor} />
          <ThemedText style={[styles.backText, { color: accentColor }]}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/workout/create?id=${template.id}`)}>
          <ThemedText style={[styles.editBtn, { color: accentColor }]}>Edit</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.templateName}>
          {template.name}
        </ThemedText>
        <ThemedText style={[styles.exerciseCount, { color: secondaryText }]}>
          {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
        </ThemedText>

        {/* Exercise list */}
        <View
          style={[styles.exerciseList, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          {template.exercises.map((ex, idx) => (
            <ExerciseListItem key={ex.exerciseId} exercise={ex} index={idx} />
          ))}
        </View>

        {/* Spacer for sticky button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky start button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: accentColor }]}
          onPress={handleStartWorkout}
        >
          <ThemedText style={styles.startBtnText}>Start Workout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 17,
  },
  editBtn: {
    fontSize: 17,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  templateName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 15,
    marginBottom: 20,
  },
  exerciseList: {
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
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
  startBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
