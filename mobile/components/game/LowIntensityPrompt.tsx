import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/src/game/constants';

type Props = {
  visible: boolean;
};

export function LowIntensityPrompt({ visible }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>The fire is fading… tap the flame to add kindling!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    padding: 10,
    zIndex: 7,
  },
  text: {
    color: COLORS.TEXT_DIM,
    textAlign: 'center',
    fontSize: 13,
  },
});
