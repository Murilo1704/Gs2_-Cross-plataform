import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { radius, risk, spacing } from '../theme';

/**
 * Selo de nivel de risco. Usa cor + icone + texto (nao depende so de cor).
 */
export default function RiskBadge({ level = 'baixo', compact = false }) {
  const r = risk[level] ?? risk.baixo;
  return (
    <View
      style={[styles.badge, { backgroundColor: r.bg }]}
      accessible
      accessibilityLabel={r.label}
    >
      <Ionicons name={r.icon} size={16} color={r.color} />
      {!compact && (
        <AppText variant="caption" color={r.color} style={styles.text}>
          {r.label}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  text: { marginLeft: spacing.xs, fontWeight: '700' },
});
