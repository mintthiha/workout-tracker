import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  visible: boolean;
  seconds: number; // initial countdown value
  onDismiss: () => void;
}

function formatCountdown(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function RestTimerModal({ visible, seconds, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(seconds);

  const bgColor = useThemeColor({ light: 'rgba(0,0,0,0.6)', dark: 'rgba(0,0,0,0.75)' }, 'background');
  const cardBg = useThemeColor({ light: '#fff', dark: '#1c1c1e' }, 'card');
  const accentColor = useThemeColor({ light: '#3498db', dark: '#3498db' }, 'accent');
  const secondaryText = useThemeColor({ light: '#666666', dark: '#8e8e93' }, 'secondaryText');

  // Reset and start countdown whenever the modal becomes visible
  useEffect(() => {
    if (!visible) return;
    setRemaining(seconds);

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [visible, seconds]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={[styles.overlay, { backgroundColor: bgColor }]}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <ThemedText style={[styles.label, { color: secondaryText }]}>Rest</ThemedText>
          <ThemedText style={styles.countdown}>{formatCountdown(remaining)}</ThemedText>

          <TouchableOpacity
            style={[styles.skipBtn, { borderColor: accentColor }]}
            onPress={onDismiss}
          >
            <ThemedText style={[styles.skipBtnText, { color: accentColor }]}>
              Skip Rest
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 220,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdown: {
    fontSize: 52,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  skipBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  skipBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
