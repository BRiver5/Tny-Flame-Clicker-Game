import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CampfireFlame } from '@/components/game/CampfireFlame';
import { EmberParticles } from '@/components/game/EmberParticles';
import { EmbersHeader } from '@/components/game/EmbersHeader';
import { IntensityGauge } from '@/components/game/IntensityGauge';
import { LowIntensityPrompt } from '@/components/game/LowIntensityPrompt';
import { NightSkyBackground } from '@/components/game/NightSkyBackground';
import { RainBanner } from '@/components/game/RainBanner';
import { RainOverlay } from '@/components/game/RainOverlay';
import { COLORS } from '@/src/game/constants';
import { useGame } from '@/src/game/GameContext';

export default function GameScreen() {
  const { loading, error, state, displayEmbers, displayIntensity, tap } = useGame();
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });

  const handleTapAnim = useCallback((pageX: number, pageY: number) => {
    setParticleOrigin({ x: pageX, y: pageY });
    setParticleTrigger((value) => value + 1);
  }, []);

  if (loading || !state) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.ACCENT} size="large" />
        <Text style={styles.loadingText}>Lighting the campfire…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NightSkyBackground />
      <View style={styles.topHud} pointerEvents="box-none">
        <EmbersHeader embers={displayEmbers} embersPerSecond={state.embers_per_second} />
        <RainBanner
          visible={state.rain_warning}
          secondsLeft={state.rain_warning_seconds_left}
          active={state.rain_active}
        />
      </View>
      <IntensityGauge intensity={displayIntensity} />
      <CampfireFlame
        intensity={displayIntensity}
        onTap={tap}
        onTapAnim={handleTapAnim}
      />
      <EmberParticles
        trigger={particleTrigger}
        originX={particleOrigin.x}
        originY={particleOrigin.y}
      />
      <RainOverlay active={state.rain_active} />
      <LowIntensityPrompt visible={displayIntensity <= 8} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.bottomPeek} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SKY,
  },
  topHud: {
    zIndex: 4,
    paddingTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SKY,
    gap: 12,
  },
  loadingText: {
    color: COLORS.TEXT_DIM,
  },
  error: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    color: '#FCA5A5',
    fontSize: 12,
  },
  bottomPeek: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: COLORS.PANEL,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    opacity: 0.95,
  },
});
