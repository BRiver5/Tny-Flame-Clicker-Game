import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { APP_VERSION } from '@/src/api/client';
import { COLORS, SOUND_KEY } from '@/src/game/constants';
import { useGame } from '@/src/game/GameContext';

export default function SettingsScreen() {
  const { resetProgress } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY).then((value) => {
      if (value != null) {
        setSoundEnabled(value === 'true');
      }
    });
  }, []);

  const toggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await AsyncStorage.setItem(SOUND_KEY, String(value));
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'This creates a new anonymous session. Your current campfire progress will be lost on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <View>
          <Text style={styles.rowTitle}>Sound effects</Text>
          <Text style={styles.rowSubtitle}>Toggle campfire sounds (reserved for future SFX)</Text>
        </View>
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: '#334155', true: COLORS.FLAME_MID }}
          thumbColor={soundEnabled ? COLORS.FLAME_CORE : '#CBD5E1'}
        />
      </View>

      <Pressable style={styles.resetButton} onPress={confirmReset}>
        <Text style={styles.resetText}>Reset progress</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tiny Flame: Clicker Game v{APP_VERSION}</Text>
        <Text style={styles.footerText}>Tap the spark, light up the dark!</Text>
        <Text style={styles.footerText}>No accounts · progress saved by session id</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SKY,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  row: {
    backgroundColor: COLORS.PANEL,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: COLORS.TEXT_DIM,
    fontSize: 12,
    marginTop: 4,
    maxWidth: 240,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.TEXT,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
    gap: 4,
  },
  footerText: {
    color: COLORS.TEXT_DIM,
    fontSize: 13,
  },
});
