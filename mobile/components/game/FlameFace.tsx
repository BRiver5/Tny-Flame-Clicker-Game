import { useEffect, useRef, useState } from 'react';
import { Ellipse, Path } from 'react-native-svg';

import { HIGH_INTENSITY_THRESHOLD } from '@/src/game/constants';

type Props = {
  intensity: number;
  cx?: number;
  cy?: number;
};

const FACE = '#5C3317';
const PUPIL = '#2A1608';
const MOOD_STEPS = 6;

export function getMoodFromIntensity(intensity: number): number {
  if (intensity <= 8) {
    return 0;
  }
  if (intensity >= HIGH_INTENSITY_THRESHOLD) {
    return 1;
  }
  return (intensity - 8) / (HIGH_INTENSITY_THRESHOLD - 8);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function FaceFeatures({ mood, cx, cy }: { mood: number; cx: number; cy: number }) {
  const t = clamp01(mood);
  const closedEyeOpacity = clamp01(1 - t / 0.4);
  const openEyeOpacity = clamp01((t - 0.12) / 0.88);

  const eyeRy = 2.5 + 3.5 * t;
  const pupilY = cy - 2 - 1.5 * t;
  const mouthCornerY = cy + 11 - 3 * t;
  const mouthControlY = cy + 5 + 9 * t;
  const browDrop = 4 * (1 - t);

  return (
    <>
      {closedEyeOpacity > 0.02 ? (
        <>
          <Path
            d={`M${cx - 16} ${cy + browDrop} Q${cx - 12} ${cy - 6 + browDrop} ${cx - 8} ${cy + browDrop}`}
            stroke={FACE}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity={closedEyeOpacity * 0.75}
          />
          <Path
            d={`M${cx + 8} ${cy + browDrop} Q${cx + 12} ${cy - 6 + browDrop} ${cx + 16} ${cy + browDrop}`}
            stroke={FACE}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity={closedEyeOpacity * 0.75}
          />
        </>
      ) : null}

      {openEyeOpacity > 0.02 ? (
        <>
          <Ellipse
            cx={cx - 12}
            cy={cy - 1}
            rx="5"
            ry={eyeRy}
            fill={FACE}
            opacity={openEyeOpacity}
          />
          <Ellipse
            cx={cx + 12}
            cy={cy - 1}
            rx="5"
            ry={eyeRy}
            fill={FACE}
            opacity={openEyeOpacity}
          />
          <Ellipse
            cx={cx - 11}
            cy={pupilY}
            rx="2"
            ry="2.5"
            fill={PUPIL}
            opacity={openEyeOpacity}
          />
          <Ellipse
            cx={cx + 13}
            cy={pupilY}
            rx="2"
            ry="2.5"
            fill={PUPIL}
            opacity={openEyeOpacity}
          />
        </>
      ) : null}

      <Path
        d={`M${cx - 10} ${mouthCornerY} Q${cx} ${mouthControlY} ${cx + 10} ${mouthCornerY}`}
        stroke={FACE}
        strokeWidth={2 + t * 0.6}
        fill="none"
        strokeLinecap="round"
      />

      {t < 0.35 ? (
        <Path
          d={`M${cx - 5} ${cy + 16} Q${cx - 2} ${cy + 19} ${cx} ${cy + 18}`}
          stroke={FACE}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={1 - t / 0.35}
        />
      ) : null}
    </>
  );
}

export function FlameFaceSvg({ intensity, cx = 130, cy = 118 }: Props) {
  const moodRef = useRef(getMoodFromIntensity(intensity));
  const prevIntensityRef = useRef(intensity);
  const [renderMood, setRenderMood] = useState(() => moodRef.current);

  useEffect(() => {
    const target = getMoodFromIntensity(intensity);
    const rising = intensity >= prevIntensityRef.current;
    prevIntensityRef.current = intensity;

    const start = moodRef.current;
    const duration = rising ? 380 : 900;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let step = 1; step <= MOOD_STEPS; step += 1) {
      timers.push(
        setTimeout(() => {
          const progress = step / MOOD_STEPS;
          const value = start + (target - start) * easeInOut(progress);
          moodRef.current = value;
          setRenderMood(value);
        }, (duration / MOOD_STEPS) * step),
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [intensity]);

  return <FaceFeatures mood={renderMood} cx={cx} cy={cy} />;
}
