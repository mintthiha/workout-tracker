import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MuscleGroup } from '@/src/types/workout';

// ─── Muscle-group accent colours ─────────────────────────────────────────────
// When a real imageUrl is provided these won't show.
// When absent, a coloured gradient-style placeholder is rendered.

const MUSCLE_COLORS: Record<MuscleGroup | string, { bg: string; icon: string }> = {
  chest:      { bg: '#2d3a6b', icon: '#5b7cff' },
  back:       { bg: '#1e4d3a', icon: '#34c759' },
  shoulders:  { bg: '#4a2d6b', icon: '#af52de' },
  biceps:     { bg: '#3a2110', icon: '#ff9500' },
  triceps:    { bg: '#6b1e3a', icon: '#ff375f' },
  legs:       { bg: '#1e3a4d', icon: '#32ade6' },
  core:       { bg: '#4d3a1e', icon: '#ffd60a' },
  full_body:  { bg: '#1e2d3a', icon: '#64d2ff' },
};

const FALLBACK = { bg: '#2c2c2e', icon: '#8e8e93' };

interface Props {
  imageUrl?: string;
  muscleGroup: MuscleGroup | string;
  /** Width of the container. Defaults to 56. */
  size?: number;
  /** Height — defaults to `size` (square). Use for hero banners. */
  height?: number;
  borderRadius?: number;
}

export function ExerciseImage({
  imageUrl,
  muscleGroup,
  size = 56,
  height,
  borderRadius = 10,
}: Props) {
  const colors = MUSCLE_COLORS[muscleGroup] ?? FALLBACK;
  const h = height ?? size;
  const iconSize = Math.round(Math.min(size, h) * 0.45);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: h, borderRadius }]}
        contentFit="cover"
        placeholder={{ color: colors.bg }}
        transition={200}
      />
    );
  }

  // ── Placeholder ───────────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: h, borderRadius, backgroundColor: colors.bg },
      ]}
    >
      <Ionicons name="barbell" size={iconSize} color={colors.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    flexShrink: 0,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
