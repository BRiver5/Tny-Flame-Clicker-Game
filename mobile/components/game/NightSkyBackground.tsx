import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

import { COLORS } from '@/src/game/constants';

const STAR_POSITIONS = [
  { x: 30, y: 40, r: 1.5 },
  { x: 80, y: 90, r: 1 },
  { x: 140, y: 55, r: 1.2 },
  { x: 220, y: 70, r: 1.4 },
  { x: 300, y: 35, r: 1 },
  { x: 350, y: 110, r: 1.3 },
  { x: 60, y: 160, r: 1.1 },
  { x: 180, y: 130, r: 1.2 },
  { x: 260, y: 150, r: 1 },
  { x: 320, y: 180, r: 1.5 },
];

export function NightSkyBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.SKY} />
            <Stop offset="1" stopColor={COLORS.SKY_LIGHT} />
          </LinearGradient>
        </Defs>
        <Path d="M0 0 H400 V800 H0 Z" fill="url(#sky)" />
        {STAR_POSITIONS.map((star, index) => (
          <Circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#FFFFFF" opacity={0.85} />
        ))}
        <Circle cx="70" cy="90" r="34" fill={COLORS.MOON} opacity={0.95} />
        <Circle cx="82" cy="82" r="6" fill="#C9CCD0" opacity={0.5} />
        <Circle cx="64" cy="98" r="4" fill="#C9CCD0" opacity={0.35} />
        <Path
          d="M0 520 Q60 500 120 530 T240 520 T360 540 T400 530 V800 H0 Z"
          fill={COLORS.TREES}
        />
        <Path
          d="M0 560 Q80 540 160 570 T320 560 T400 570 V800 H0 Z"
          fill="#08111F"
          opacity={0.85}
        />
        <Ellipse cx="200" cy="760" rx="180" ry="40" fill="#F7941D" opacity={0.08} />
      </Svg>
    </View>
  );
}
