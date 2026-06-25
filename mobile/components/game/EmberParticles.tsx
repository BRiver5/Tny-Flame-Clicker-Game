import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/src/game/constants';

type Particle = {
  id: string;
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  delay: number;
  color: string;
};

type Props = {
  trigger: number;
  originX: number;
  originY: number;
};

const COLORS_POOL = [COLORS.FLAME_CORE, COLORS.FLAME_MID, COLORS.FLAME_EDGE];
const MAX_PARTICLES = 9;
const PARTICLES_PER_TAP = 3;
const PARTICLE_LIFE_MS = 220;

function ParticleView({ particle, onExpire }: { particle: Particle; onExpire: (id: string) => void }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: PARTICLE_LIFE_MS, easing: Easing.out(Easing.quad) }),
    );
    const timer = setTimeout(() => {
      onExpire(particle.id);
    }, particle.delay + PARTICLE_LIFE_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimation(progress);
    };
  }, [onExpire, particle.delay, particle.id, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: particle.driftX * progress.value },
      { translateY: -40 * progress.value - particle.driftY * progress.value * 0.4 },
      { scale: 1 - progress.value * 0.5 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: particle.left, top: particle.top, backgroundColor: particle.color },
        style,
      ]}
    />
  );
}

export function EmberParticles({ trigger, originX, originY }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastSpawnRef = useRef(0);
  const spawnSeqRef = useRef(0);

  const expireParticle = useCallback((id: string) => {
    setParticles((current) => {
      if (!current.some((particle) => particle.id === id)) {
        return current;
      }
      return current.filter((particle) => particle.id !== id);
    });
  }, []);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }
    const now = Date.now();
    if (now - lastSpawnRef.current < 60) {
      return;
    }
    lastSpawnRef.current = now;
    spawnSeqRef.current += 1;

    const batch = Array.from({ length: PARTICLES_PER_TAP }, (_, index) => ({
      id: `ember-${spawnSeqRef.current}-${index}`,
      left: originX + (Math.random() - 0.5) * 16 - 4,
      top: originY + (Math.random() - 0.5) * 16 - 4,
      driftX: (Math.random() - 0.5) * 80,
      driftY: Math.random() * 30,
      delay: index * 15,
      color: COLORS_POOL[index % COLORS_POOL.length],
    }));

    setParticles((current) => [...current, ...batch].slice(-MAX_PARTICLES));
  }, [originX, originY, trigger]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleView key={particle.id} particle={particle} onExpire={expireParticle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
