import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/src/game/constants';

type Props = {
  intensity: number;
};

const TRACK_TOP = 20;
const TRACK_HEIGHT = 180;
const TRACK_BOTTOM = TRACK_TOP + TRACK_HEIGHT;

export function IntensityGauge({ intensity }: Props) {
  const clamped = Math.max(0, Math.min(100, intensity));
  const fillHeight = (clamped / 100) * TRACK_HEIGHT;
  const fillY = TRACK_BOTTOM - fillHeight;
  const isLow = clamped <= 25;

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={44} height={220} viewBox="0 0 44 220">
        <Rect
          x="16"
          y={TRACK_TOP}
          width="12"
          height={TRACK_HEIGHT}
          rx="6"
          fill="rgba(255,255,255,0.12)"
        />
        <Path d="M22 8 L28 18 H16 Z" fill={COLORS.TEXT_DIM} />
        <Path d="M22 212 L16 202 H28 Z" fill={COLORS.TEXT_DIM} />
      </Svg>

      {fillHeight > 0 ? (
        <View style={[styles.fillWrap, { top: fillY, height: fillHeight }]}>
          <Svg width={44} height={fillHeight + 16} viewBox={`0 0 44 ${fillHeight + 16}`}>
            <Defs>
              <LinearGradient id="gaugeFill" x1="0.5" y1="1" x2="0.5" y2="0">
                <Stop offset="0" stopColor={isLow ? '#666666' : COLORS.FLAME_EDGE} />
                <Stop offset="0.5" stopColor={isLow ? '#888888' : COLORS.FLAME_MID} />
                <Stop offset="1" stopColor={isLow ? '#AAAAAA' : COLORS.FLAME_CORE} />
              </LinearGradient>
            </Defs>
            <Rect
              x="16"
              y="8"
              width="12"
              height={Math.max(fillHeight - 8, 4)}
              rx="6"
              fill="url(#gaugeFill)"
            />
          </Svg>
        </View>
      ) : null}

      {fillHeight > 8 && !isLow ? (
        <View style={[styles.tipWrap, { top: fillY - 10 }]}>
          <Svg width={28} height={22} viewBox="0 0 28 22">
            <Path
              d="M14 20 C8 14 4 8 7 4 C9 1 11 3 14 0 C17 3 19 1 21 4 C24 8 20 14 14 20 Z"
              fill={COLORS.FLAME_MID}
            />
            <Path
              d="M14 17 C11 13 10 9 12 7 C13 5 14 6 14 4 C14 6 15 5 16 7 C18 9 17 13 14 17 Z"
              fill={COLORS.FLAME_CORE}
            />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: '28%',
    width: 44,
    height: 220,
    zIndex: 5,
  },
  fillWrap: {
    position: 'absolute',
    left: 0,
    width: 44,
    overflow: 'hidden',
  },
  tipWrap: {
    position: 'absolute',
    left: 8,
    width: 28,
    height: 22,
  },
});
