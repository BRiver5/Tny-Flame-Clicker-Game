import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  active: boolean;
};

function RainDrop({ left, delay, height }: { left: number; delay: number; height: number }) {
  const translateY = useSharedValue(-20);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height + 40, { duration: 900 + delay, easing: Easing.linear }),
      -1,
      false,
    );
  }, [delay, height, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.drop, { left: `${left}%`, height: 14 + (delay % 8) }, style]}
    />
  );
}

export function RainOverlay({ active }: Props) {
  if (!active) {
    return null;
  }

  const drops = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: (index * 7) % 100,
    delay: (index * 37) % 300,
    height: 700,
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      {drops.map((drop) => (
        <RainDrop key={drop.id} left={drop.left} delay={drop.delay} height={drop.height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
  },
  drop: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: 'rgba(173, 205, 255, 0.45)',
    borderRadius: 1,
  },
});
