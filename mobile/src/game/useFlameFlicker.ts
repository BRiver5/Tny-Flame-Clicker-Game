import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type FlameFlickerOptions = {
  intensity?: number;
};

export function useFlameFlicker({ intensity = 100 }: FlameFlickerOptions = {}) {
  const swayX = useSharedValue(0);
  const flickerA = useSharedValue(1);
  const flickerB = useSharedValue(1);
  const corePulse = useSharedValue(1);
  const glow = useSharedValue(0.6);
  const minOpacity = useSharedValue(0.7);
  const emberMode = useSharedValue(0);

  const isEmber = intensity <= 8;
  const isLow = intensity <= 25;

  useEffect(() => {
    minOpacity.value = isEmber ? 0.55 : isLow ? 0.65 : 0.7;
    emberMode.value = isEmber ? 1 : 0;
  }, [emberMode, isEmber, isLow, minOpacity]);

  useEffect(() => {
    cancelAnimation(swayX);
    cancelAnimation(flickerA);
    cancelAnimation(flickerB);
    cancelAnimation(corePulse);
    cancelAnimation(glow);

    if (isEmber) {
      swayX.value = 0;
      flickerA.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.45, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
      flickerB.value = flickerA.value;
      corePulse.value = 1;
      glow.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1500 }),
          withTiming(0.25, { duration: 1500 }),
        ),
        -1,
        true,
      );
      return () => {
        cancelAnimation(swayX);
        cancelAnimation(flickerA);
        cancelAnimation(flickerB);
        cancelAnimation(corePulse);
        cancelAnimation(glow);
      };
    }

    swayX.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(7, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    flickerA.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.65, { duration: 380, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.9, { duration: 520, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    flickerB.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 520, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 410, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.68, { duration: 490, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    corePulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 320, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.92, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.5, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(swayX);
      cancelAnimation(flickerA);
      cancelAnimation(flickerB);
      cancelAnimation(corePulse);
      cancelAnimation(glow);
    };
  }, [isEmber]);

  const outerStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value, 0.65 + flickerA.value * 0.35),
    transform: [{ translateX: swayX.value }],
  }));

  const midStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value, 0.7 + flickerB.value * 0.3),
    transform: [
      { translateX: -swayX.value * 0.45 },
      { scaleY: 0.94 + flickerB.value * 0.08 },
    ],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value + 0.1, 0.9 + corePulse.value * 0.1),
    transform: [{ scaleY: 0.96 + corePulse.value * 0.06 }],
  }));

  const leftTongueStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value * 0.95, 0.6 + flickerB.value * 0.4),
    transform: [{ translateX: swayX.value * 0.75 }],
  }));

  const rightTongueStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value * 0.95, 0.6 + flickerA.value * 0.4),
    transform: [{ translateX: -swayX.value * 0.75 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0.15, (0.2 + glow.value * 0.25) * (emberMode.value > 0.5 ? 0.65 : 1)),
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value, 0.7 + flickerA.value * 0.3),
  }));

  const tipStyle = useAnimatedStyle(() => ({
    opacity: Math.max(minOpacity.value, 0.65 + corePulse.value * 0.35),
    transform: [{ translateX: swayX.value * 0.5 }],
  }));

  return {
    outerStyle,
    midStyle,
    coreStyle,
    leftTongueStyle,
    rightTongueStyle,
    glowStyle,
    fillStyle,
    tipStyle,
  };
}
