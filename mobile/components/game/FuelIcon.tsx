import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/src/game/constants';

type Props = {
  slug: string;
  size?: number;
};

export function FuelIcon({ slug, size = 44 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 44 44">
        <Defs>
          <LinearGradient id="fuelFlame" x1="0.5" y1="1" x2="0.5" y2="0">
            <Stop offset="0" stopColor={COLORS.FLAME_EDGE} />
            <Stop offset="0.5" stopColor={COLORS.FLAME_MID} />
            <Stop offset="1" stopColor={COLORS.FLAME_CORE} />
          </LinearGradient>
        </Defs>
        {slug === 'paper' && <PaperIcon />}
        {slug === 'twigs' && <TwigsIcon />}
        {slug === 'planks' && <PlanksIcon />}
        {slug === 'logs' && <LogsIcon />}
        {slug === 'bonfire_bundle' && <BonfireBundleIcon />}
      </Svg>
    </View>
  );
}

function PaperIcon() {
  return (
    <>
      <Path
        d="M10 8 L30 6 L34 34 L12 38 Z"
        fill="#F5F5F5"
        stroke="#D0D0D0"
        strokeWidth="1"
      />
      <Path d="M14 12 L28 10" stroke="#C8C8C8" strokeWidth="1.2" />
      <Path d="M14 17 L26 15" stroke="#C8C8C8" strokeWidth="1.2" />
      <Path d="M14 22 L24 20" stroke="#C8C8C8" strokeWidth="1.2" />
      <Path d="M10 8 L18 8 L18 14 L10 16 Z" fill="#E8E8E8" />
    </>
  );
}

function TwigsIcon() {
  return (
    <>
      <Path d="M8 32 L28 14" stroke={COLORS.WOOD} strokeWidth="3" strokeLinecap="round" />
      <Path d="M12 34 L32 18" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M6 26 L24 10" stroke="#A0662F" strokeWidth="2" strokeLinecap="round" />
      <Path d="M16 36 L34 22" stroke={COLORS.WOOD_DARK} strokeWidth="2" strokeLinecap="round" />
      <Ellipse cx="22" cy="32" rx="8" ry="4" fill={COLORS.WOOD_DARK} opacity={0.25} />
    </>
  );
}

function PlanksIcon() {
  return (
    <>
      <Rect x="6" y="12" width="32" height="9" rx="2" fill="#8B5A2B" stroke={COLORS.WOOD_DARK} strokeWidth="0.8" />
      <Rect x="6" y="24" width="32" height="9" rx="2" fill={COLORS.WOOD} stroke={COLORS.WOOD_DARK} strokeWidth="0.8" />
      <Line x1="10" y1="14" x2="34" y2="14" stroke={COLORS.WOOD_DARK} strokeWidth="0.6" opacity={0.5} />
      <Line x1="10" y1="17" x2="34" y2="17" stroke={COLORS.WOOD_DARK} strokeWidth="0.6" opacity={0.35} />
      <Line x1="10" y1="26" x2="34" y2="26" stroke={COLORS.WOOD_DARK} strokeWidth="0.6" opacity={0.5} />
      <Line x1="10" y1="29" x2="34" y2="29" stroke={COLORS.WOOD_DARK} strokeWidth="0.6" opacity={0.35} />
    </>
  );
}

function LogsIcon() {
  return (
    <>
      <Rect x="8" y="18" width="28" height="14" rx="7" fill={COLORS.WOOD} stroke={COLORS.WOOD_DARK} strokeWidth="0.8" />
      <Circle cx="14" cy="25" r="6" fill="#8B5A2B" stroke={COLORS.WOOD_DARK} strokeWidth="0.8" />
      <Circle cx="14" cy="25" r="3.5" fill="none" stroke={COLORS.WOOD_DARK} strokeWidth="0.6" opacity={0.6} />
      <Circle cx="14" cy="25" r="1.5" fill={COLORS.WOOD_DARK} opacity={0.4} />
      <Rect x="18" y="20" width="16" height="10" rx="3" fill="#8B5A2B" opacity={0.5} />
    </>
  );
}

function BonfireBundleIcon() {
  return (
    <>
      <Path d="M10 30 L18 22 L26 30 Z" fill={COLORS.WOOD_DARK} />
      <Path d="M16 32 L22 24 L30 32 Z" fill={COLORS.WOOD} />
      <Path d="M8 32 H34 V34 H8 Z" fill={COLORS.WOOD_DARK} />
      <Path
        d="M22 22 C18 16 16 10 18 6 C19 4 20 5 22 2 C24 5 25 4 26 6 C28 10 26 16 22 22 Z"
        fill="url(#fuelFlame)"
      />
      <Path
        d="M22 19 C20 15 19 12 20 9 C21 7 22 8 22 6 C22 8 23 7 24 9 C25 12 24 15 22 19 Z"
        fill={COLORS.FLAME_CORE}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
