import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/game/constants';
import { formatNumber } from '@/src/game/format';

type Props = {
  embers: number;
  embersPerSecond: number;
};

export function EmbersHeader({ embers, embersPerSecond }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{formatNumber(embers)} Embers</Text>
      <Text style={styles.subtitle}>per second: {formatNumber(embersPerSecond)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 3,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 34,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    color: COLORS.TEXT_DIM,
    fontSize: 18,
    textAlign: 'center',
  },
});
