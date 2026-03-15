import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  startedAt: number; // Unix ms
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function WorkoutTimer({ startedAt }: Props) {
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');

  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - startedAt) / 1000)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <ThemedText style={[styles.timer, { color: secondaryText }]}>
      {formatElapsed(elapsed)}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
