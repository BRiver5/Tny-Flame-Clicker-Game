import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, TAP_INTENSITY_GAIN } from '@/src/game/constants';

export type TapPopup = {
  id: string;
  x: number;
  y: number;
};

type Props = {
  popups: TapPopup[];
};

const POPUP_LIFE_MS = 500;

function KindlingPopup({ popup }: { popup: TapPopup }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: POPUP_LIFE_MS,
      easing: Easing.out(Easing.quad),
    });
    return () => {
      cancelAnimation(progress);
    };
  }, [popup.id]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -50 * progress.value },
      { scale: 0.85 + (1 - progress.value) * 0.2 },
    ],
  }));

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.label,
        { left: popup.x - 16, top: popup.y - 28 },
        style,
      ]}
    >
      +{TAP_INTENSITY_GAIN}
    </Animated.Text>
  );
}

export function TapKindlingPopup({ popups }: Props) {
  return (
    <>
      {popups.map((popup) => (
        <KindlingPopup key={popup.id} popup={popup} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    color: COLORS.FLAME_CORE,
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
