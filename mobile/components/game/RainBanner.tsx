import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/src/game/constants';

type Props = {
  visible: boolean;
  secondsLeft: number;
  active: boolean;
};

export function RainBanner({ visible, secondsLeft, active }: Props) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    if (!visible && !active) {
      pulse.value = 1;
      glow.value = 0.6;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(active ? 1.03 : 1.015, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.45, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, [active, glow, pulse, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.92 + glow.value * 0.08,
  }));

  if (!visible && !active) {
    return null;
  }

  const countdown = Math.max(0, Math.ceil(secondsLeft));

  return (
    <Animated.View
      style={[
        styles.banner,
        active ? styles.bannerActive : styles.bannerWarning,
        cardStyle,
      ]}
    >
      <View style={styles.iconRow}>
        <Text style={styles.icon}>{active ? '🌧️' : '⛈️'}</Text>
        <View style={styles.textBlock}>
          <Text style={[styles.title, active && styles.titleActive]}>
            {active ? 'Rain is falling!' : 'Rain incoming!'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {active
              ? 'Tap the flame — keep it burning!'
              : `Starts in ${countdown}s — prepare kindling`}
          </Text>
        </View>
      </View>
      {!active && visible ? (
        <View style={styles.countdownTrack}>
          <View
            style={[
              styles.countdownFill,
              { width: `${Math.min(100, Math.max(8, (1 - secondsLeft / 3) * 100))}%` },
            ]}
          />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerWarning: {
    backgroundColor: 'rgba(15, 35, 70, 0.96)',
    borderColor: '#60A5FA',
  },
  bannerActive: {
    backgroundColor: 'rgba(25, 20, 55, 0.96)',
    borderColor: '#818CF8',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 26,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#BFDBFE',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  titleActive: {
    color: '#E0E7FF',
  },
  subtitle: {
    color: COLORS.TEXT,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  countdownTrack: {
    marginTop: 8,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  countdownFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
});
