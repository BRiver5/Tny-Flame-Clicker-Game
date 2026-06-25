import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FuelIcon } from '@/components/game/FuelIcon';
import { COLORS } from '@/src/game/constants';
import { useGame } from '@/src/game/GameContext';
import { formatNumber } from '@/src/game/format';

export default function ShopScreen() {
  const { loading, state, buy } = useGame();
  const [message, setMessage] = useState<string | null>(null);
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null);

  if (loading || !state) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.ACCENT} />
      </View>
    );
  }

  const handleBuy = async (slug: string) => {
    setBuyingSlug(slug);
    const result = await buy(slug);
    setMessage(result.message);
    setBuyingSlug(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fuel Shop</Text>
      <Text style={styles.subtitle}>Buy fuel for passive Embers. Tap the flame to add kindling.</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        data={state.upgrades}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const affordable = state.embers >= item.next_cost;
          return (
            <View style={styles.card}>
              <FuelIcon slug={item.slug} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardMeta}>Owned: {item.owned_count}</Text>
                <Text style={styles.cardMeta}>
                  +{formatNumber(item.eps)} embers/sec
                </Text>
                <Text style={styles.cardCost}>Cost: {formatNumber(item.next_cost)} Embers</Text>
              </View>
              <Pressable
                style={[styles.buyButton, !affordable && styles.buyDisabled]}
                disabled={!affordable || buyingSlug === item.slug}
                onPress={() => handleBuy(item.slug)}>
                <Text style={styles.buyText}>{buyingSlug === item.slug ? '…' : 'Buy'}</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SKY,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SKY,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.TEXT_DIM,
    marginTop: 4,
    marginBottom: 12,
  },
  message: {
    color: COLORS.FLAME_CORE,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PANEL,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    color: COLORS.TEXT_DIM,
    fontSize: 13,
    marginTop: 2,
  },
  cardCost: {
    color: COLORS.FLAME_MID,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: COLORS.FLAME_MID,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buyDisabled: {
    opacity: 0.45,
  },
  buyText: {
    color: COLORS.TEXT,
    fontWeight: '700',
  },
});
