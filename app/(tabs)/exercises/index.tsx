import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { FilterChips } from '@/components/exercises/FilterChips';
import { CreateExerciseModal } from '@/components/exercises/CreateExerciseModal';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER } from '@/src/data/exerciseLibrary';
import { useAppContext } from '@/src/context/AppContext';
import * as exerciseService from '@/src/services/exerciseService';
import { Exercise, EquipmentType } from '@/src/types/workout';

const MUSCLE_CHIPS = MUSCLE_GROUP_ORDER.map((g) => ({
  key: g,
  label: MUSCLE_GROUP_LABELS[g],
}));

const EQUIPMENT_CHIPS: { key: EquipmentType; label: string }[] = [
  { key: 'barbell', label: 'Barbell' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'machine', label: 'Machine' },
  { key: 'cable', label: 'Cable' },
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'other', label: 'Other' },
];

interface Section {
  title: string;
  key: string;
  data: Exercise[];
}

export default function ExercisesScreen() {
  const { userId, isLoaded } = useAppContext();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<Set<string>>(new Set());
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#1c1c1e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#2c2c2e' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');
  const inputBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'card');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const tertiaryText = useThemeColor({ light: '#999999', dark: '#666666' }, 'tertiaryText');

  const loadExercises = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [global, custom] = await Promise.all([
      exerciseService.getExercises(),
      exerciseService.getCustomExercises(userId),
    ]);
    setAllExercises(global);
    setCustomExercises(custom);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const merged: (Exercise & { isCustom: boolean })[] = useMemo(() => [
    ...allExercises.map((e) => ({ ...e, isCustom: false })),
    ...customExercises.map((e) => ({ ...e, isCustom: true })),
  ], [allExercises, customExercises]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return merged.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      if (selectedMuscles.size > 0 && !selectedMuscles.has(e.muscleGroup)) return false;
      if (selectedEquipment.size > 0 && !selectedEquipment.has(e.equipment)) return false;
      return true;
    });
  }, [merged, search, selectedMuscles, selectedEquipment]);

  const sections: Section[] = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {};
    for (const ex of filtered) {
      if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = [];
      grouped[ex.muscleGroup].push(ex);
    }
    return MUSCLE_GROUP_ORDER
      .filter((g) => grouped[g]?.length)
      .map((g) => ({ title: MUSCLE_GROUP_LABELS[g], key: g, data: grouped[g] }));
  }, [filtered]);

  function toggleMuscle(key: string) {
    setSelectedMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleEquipment(key: string) {
    setSelectedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const customSet = useMemo(
    () => new Set(customExercises.map((e) => e.id)),
    [customExercises]
  );

  if (isLoaded && !userId) return <Redirect href="/login" />;

  // ─── Scrollable header: search + filters ───────────────────────────────────
  const ListHeader = (
    <View>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: inputBg }]}>
        <Ionicons name="search" size={16} color={secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises…"
          placeholderTextColor={secondaryText}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Muscle Group filter */}
      <ThemedText style={[styles.filterLabel, { color: secondaryText }]}>
        Muscle Group
      </ThemedText>
      <View style={styles.chipsEscape}>
        <FilterChips
          chips={MUSCLE_CHIPS}
          selected={selectedMuscles}
          onToggle={toggleMuscle}
          onClearAll={() => setSelectedMuscles(new Set())}
        />
      </View>

      {/* Equipment filter */}
      <ThemedText style={[styles.filterLabel, { color: secondaryText }]}>
        Equipment
      </ThemedText>
      <View style={styles.chipsEscape}>
        <FilterChips
          chips={EQUIPMENT_CHIPS}
          selected={selectedEquipment}
          onToggle={toggleEquipment}
          onClearAll={() => setSelectedEquipment(new Set())}
        />
      </View>

      {loading && <ActivityIndicator style={styles.loader} color={accentColor} />}

      {!loading && sections.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={tertiaryText} />
          <ThemedText style={[styles.emptyText, { color: secondaryText }]}>
            No exercises found
          </ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Fixed header — only the title + add button stay pinned */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Exercises
        </ThemedText>
        <Ionicons
          name="add-circle-outline"
          size={28}
          color={accentColor}
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={ListHeader}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionHeaderText, { color: secondaryText }]}>
              {section.title.toUpperCase()}
            </ThemedText>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1;
          return (
            <View
              style={[
                styles.cardWrapper,
                { backgroundColor: cardBg, borderColor: cardBorder },
                index === 0 && styles.cardFirst,
                isLast && styles.cardLast,
              ]}
            >
              <ExerciseCard
                exercise={item}
                isCustom={customSet.has(item.id)}
                onPress={() => router.push(`/exercises/${item.id}`)}
              />
            </View>
          );
        }}
        renderSectionFooter={() => <View style={styles.sectionGap} />}
      />

      <CreateExerciseModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadExercises}
        userId={userId!}
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
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginLeft: 0,
    marginTop: 10,
    marginBottom: -4,
  },
  loader: {
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  sectionHeader: {
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardWrapper: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'transparent',
  },
  cardFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  cardLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  sectionGap: {
    height: 4,
  },
  chipsEscape: {
    marginHorizontal: -16,
  },
});
