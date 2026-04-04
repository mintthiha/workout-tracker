import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_ORDER } from '@/src/data/exerciseLibrary';
import * as exerciseService from '@/src/services/exerciseService';
import { EquipmentType, MuscleGroup } from '@/src/types/workout';

const EQUIPMENT_OPTIONS: { key: EquipmentType; label: string }[] = [
  { key: 'barbell', label: 'Barbell' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'machine', label: 'Machine' },
  { key: 'cable', label: 'Cable' },
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'other', label: 'Other' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}

export function CreateExerciseModal({ visible, onClose, onCreated, userId }: Props) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState<EquipmentType>('barbell');
  const [saving, setSaving] = useState(false);

  const bgColor = useThemeColor({ light: '#fff', dark: '#151718' }, 'background');
  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const cardBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'card');
  const cardBorder = useThemeColor({ light: '#e0e0e0', dark: '#3a3a3c' }, 'cardBorder');
  const secondaryText = useThemeColor({ light: '#666', dark: '#8e8e93' }, 'secondaryText');
  const textColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');

  function reset() {
    setName('');
    setMuscleGroup('chest');
    setEquipment('barbell');
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter an exercise name.');
      return;
    }
    setSaving(true);
    await exerciseService.createCustomExercise(userId, {
      name: name.trim(),
      muscleGroup,
      equipment,
    });
    setSaving(false);
    reset();
    onCreated();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <ThemedText style={[styles.headerBtn, { color: accentColor }]}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            Custom Exercise
          </ThemedText>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <ThemedText style={[styles.headerBtn, { color: accentColor, fontWeight: '700' }]}>
              {saving ? 'Saving…' : 'Save'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <ThemedText style={[styles.label, { color: secondaryText }]}>EXERCISE NAME</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: cardBg, color: textColor, borderColor: cardBorder }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Landmine Press"
            placeholderTextColor={secondaryText}
            autoFocus
            returnKeyType="done"
          />

          {/* Muscle group */}
          <ThemedText style={[styles.label, { color: secondaryText }]}>MUSCLE GROUP</ThemedText>
          <View style={styles.optionGrid}>
            {MUSCLE_GROUP_ORDER.map((g) => {
              const active = muscleGroup === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: active ? accentColor : cardBg,
                      borderColor: active ? accentColor : cardBorder,
                    },
                  ]}
                  onPress={() => setMuscleGroup(g as MuscleGroup)}
                >
                  <ThemedText
                    style={[styles.optionText, { color: active ? '#fff' : textColor }]}
                  >
                    {MUSCLE_GROUP_LABELS[g]}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Equipment */}
          <ThemedText style={[styles.label, { color: secondaryText }]}>EQUIPMENT</ThemedText>
          <View style={styles.optionGrid}>
            {EQUIPMENT_OPTIONS.map(({ key, label }) => {
              const active = equipment === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: active ? accentColor : cardBg,
                      borderColor: active ? accentColor : cardBorder,
                    },
                  ]}
                  onPress={() => setEquipment(key)}
                >
                  <ThemedText
                    style={[styles.optionText, { color: active ? '#fff' : textColor }]}
                  >
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerBtn: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
