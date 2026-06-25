import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { FlameFaceSvg } from '@/components/game/FlameFace';
import { TapKindlingPopup, type TapPopup } from '@/components/game/TapKindlingPopup';
import { COLORS, MAX_KINDLING_POPUPS } from '@/src/game/constants';
import { useFlameFlicker } from '@/src/game/useFlameFlicker';

type Props = {
  intensity: number;
  onTap: () => void;
  onTapAnim?: (pageX: number, pageY: number) => void;
};

const W = 260;
const H = 280;
const PIVOT_X = 130;
const PIVOT_Y = 210;

const PATHS = {
  outer:
    'M95 210 L165 210 C178 165 168 95 130 38 C92 95 82 165 95 210 Z',
  leftTongue:
    'M88 210 L118 210 C112 168 98 125 92 92 C88 72 86 82 88 210 Z',
  rightTongue:
    'M142 210 L172 210 C168 168 162 125 168 92 C172 72 174 82 172 210 Z',
  mid:
    'M108 210 L152 210 C160 168 152 118 130 52 C108 118 100 168 108 210 Z',
  core:
    'M116 205 L144 205 C148 168 142 128 130 72 C118 128 112 168 116 205 Z',
};

function getFlameScale(intensity: number): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100;
  return 0.22 + t * 0.78;
}

function flameScaleTransform(scale: number): string {
  return `translate(${PIVOT_X} ${PIVOT_Y}) scale(1 ${scale}) translate(${-PIVOT_X} ${-PIVOT_Y})`;
}

function LogsSvg() {
  return (
    <Svg width={W} height={H} viewBox="0 0 260 280">
      <Ellipse cx="130" cy="252" rx="88" ry="12" fill="#F7941D" opacity={0.12} />
      <Path
        d="M42 220 L90 208 L130 198 L170 208 L218 220 L202 254 L58 254 Z"
        fill={COLORS.WOOD_DARK}
      />
      <Path
        d="M62 226 C84 206 104 240 118 228 C130 216 142 240 156 228 C170 216 190 240 200 228 L192 258 L68 258 Z"
        fill={COLORS.WOOD}
      />
      <Circle cx="88" cy="242" r="10" fill={COLORS.WOOD_DARK} opacity={0.5} />
      <Circle cx="88" cy="242" r="4.5" fill="none" stroke={COLORS.WOOD} strokeWidth="1" />
      <Circle cx="172" cy="242" r="10" fill={COLORS.WOOD_DARK} opacity={0.5} />
      <Circle cx="172" cy="242" r="4.5" fill="none" stroke={COLORS.WOOD} strokeWidth="1" />
    </Svg>
  );
}

function EmberSvg({ intensity }: { intensity: number }) {
  return (
    <Svg width={W} height={H} viewBox="0 0 260 280">
      <Ellipse cx="118" cy="214" rx="12" ry="7" fill={COLORS.FLAME_MID} opacity={0.8} />
      <Ellipse cx="142" cy="212" rx="10" ry="6" fill={COLORS.FLAME_EDGE} opacity={0.65} />
      <Circle cx="130" cy="210" r="6" fill={COLORS.FLAME_CORE} opacity={0.75} />
      <FlameFaceSvg intensity={intensity} cx={130} cy={208} />
    </Svg>
  );
}

type FlameLayerProps = {
  d: string;
  fill: string;
  flameScale: number;
  children?: React.ReactNode;
};

function FlameLayerSvg({ d, fill, flameScale, children }: FlameLayerProps) {
  return (
    <Svg width={W} height={H} viewBox="0 0 260 280">
      <Defs>
        <LinearGradient id="flameOuterGrad" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0" stopColor={COLORS.FLAME_EDGE} />
          <Stop offset="0.5" stopColor={COLORS.FLAME_MID} />
          <Stop offset="1" stopColor={COLORS.FLAME_CORE} />
        </LinearGradient>
        <LinearGradient id="flameMidGrad" x1="0.5" y1="1" x2="0.5" y2="0">
          <Stop offset="0" stopColor={COLORS.FLAME_MID} />
          <Stop offset="1" stopColor={COLORS.FLAME_CORE} />
        </LinearGradient>
      </Defs>
      <G transform={flameScaleTransform(flameScale)}>
        <Path d={d} fill={fill} />
        {children}
      </G>
    </Svg>
  );
}

const POPUP_LIFE_MS = 500;

export function CampfireFlame({ intensity, onTap, onTapAnim }: Props) {
  const tapScale = useSharedValue(1);
  const [popups, setPopups] = useState<TapPopup[]>([]);
  const popupIdRef = useRef(0);
  const popupTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removePopup = useCallback((id: string) => {
    const timer = popupTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      popupTimersRef.current.delete(id);
    }
    setPopups((current) => {
      if (!current.some((popup) => popup.id === id)) {
        return current;
      }
      return current.filter((popup) => popup.id !== id);
    });
  }, []);

  useEffect(
    () => () => {
      popupTimersRef.current.forEach(clearTimeout);
      popupTimersRef.current.clear();
    },
    [],
  );
  const flameScale = getFlameScale(intensity);
  const isEmber = intensity <= 8 && intensity > 0;

  const {
    outerStyle,
    midStyle,
    coreStyle,
    leftTongueStyle,
    rightTongueStyle,
    glowStyle,
  } = useFlameFlicker({ intensity });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const handlePress = (event: GestureResponderEvent) => {
    const { locationX, locationY, pageX, pageY } = event.nativeEvent;
    tapScale.value = withSequence(
      withTiming(1.08, { duration: 90 }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
    );
    popupIdRef.current += 1;
    const popupId = `kindling-${Date.now()}-${popupIdRef.current}`;
    setPopups((current) => {
      const next = [...current, { id: popupId, x: locationX, y: locationY }];
      if (next.length <= MAX_KINDLING_POPUPS) {
        return next;
      }
      const dropped = next.slice(0, next.length - MAX_KINDLING_POPUPS);
      dropped.forEach((popup) => {
        const existing = popupTimersRef.current.get(popup.id);
        if (existing) {
          clearTimeout(existing);
          popupTimersRef.current.delete(popup.id);
        }
      });
      return next.slice(-MAX_KINDLING_POPUPS);
    });

    const timer = setTimeout(() => {
      removePopup(popupId);
    }, POPUP_LIFE_MS);
    popupTimersRef.current.set(popupId, timer);
    onTapAnim?.(pageX, pageY);
    onTap();
  };

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress} style={styles.pressable}>
        <TapKindlingPopup popups={popups} />
        <Animated.View style={[styles.campfire, containerStyle]}>
          <Animated.View style={[styles.layer, glowStyle]}>
            <Svg width={W} height={H} viewBox="0 0 260 280">
              <Ellipse cx="130" cy="252" rx="92" ry="16" fill="#F7941D" opacity={0.22} />
            </Svg>
          </Animated.View>

          <View style={styles.layer}>
            <LogsSvg />
          </View>

          {isEmber ? (
            <Animated.View style={[styles.layer, outerStyle]}>
              <EmberSvg intensity={intensity} />
            </Animated.View>
          ) : (
            <>
              <Animated.View style={[styles.flameLayer, outerStyle]}>
                <FlameLayerSvg d={PATHS.outer} fill="url(#flameOuterGrad)" flameScale={flameScale} />
              </Animated.View>

              <Animated.View style={[styles.flameLayer, leftTongueStyle]}>
                <FlameLayerSvg
                  d={PATHS.leftTongue}
                  fill="url(#flameOuterGrad)"
                  flameScale={flameScale}
                />
              </Animated.View>

              <Animated.View style={[styles.flameLayer, rightTongueStyle]}>
                <FlameLayerSvg
                  d={PATHS.rightTongue}
                  fill="url(#flameOuterGrad)"
                  flameScale={flameScale}
                />
              </Animated.View>

              <Animated.View style={[styles.flameLayer, midStyle]}>
                <FlameLayerSvg d={PATHS.mid} fill="url(#flameMidGrad)" flameScale={flameScale} />
              </Animated.View>

              <Animated.View style={[styles.flameLayer, coreStyle]}>
                <FlameLayerSvg d={PATHS.core} fill={COLORS.FLAME_CORE} flameScale={flameScale}>
                  <FlameFaceSvg intensity={intensity} cx={130} cy={118} />
                </FlameLayerSvg>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: W,
    height: H,
  },
  campfire: {
    width: W,
    height: H,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  flameLayer: {
    ...StyleSheet.absoluteFillObject,
    transformOrigin: 'bottom',
  },
});
