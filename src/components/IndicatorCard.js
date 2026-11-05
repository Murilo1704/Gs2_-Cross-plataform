import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';

/**
 * Indicador numerico (KPI) com variacao em relacao ao periodo anterior.
 * `trend` positivo = aumento. `goodWhenUp` define se aumentar e bom ou ruim.
 */
export default function IndicatorCard({ icon, label, value, unit, trend, goodWhenUp = false, color = colors.primary }) {
  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const up = hasTrend && trend > 0;
  const good = hasTrend && (up === goodWhenUp || trend === 0);
  const trendColor = !hasTrend ? colors.textMuted : good ? colors.riskLow : colors.riskHigh;
  const trendText = hasTrend ? `${up ? '+' : ''}${trend.toFixed(1)}%` : '--';

  const a11y = `${label}: ${value} ${unit ?? ''}. ${
    hasTrend ? `Variacao de ${trendText} em relacao a semana anterior.` : ''
  }`;

  return (
    <View style={styles.card} accessible accessibilityLabel={a11y}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
        {label}
      </AppText>
      <View style={styles.row}>
        <AppText variant="number">{value}</AppText>
        {unit ? (
          <AppText variant="caption" color={colors.textMuted} style={styles.unit}>
            {unit}
          </AppText>
        ) : null}
      </View>
      <View style={styles.row}>
        {hasTrend && trend !== 0 ? (
          <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={14} color={trendColor} />
        ) : null}
        <AppText variant="caption" color={trendColor} style={styles.trend}>
          {trendText}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    margin: spacing.xs,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  unit: { marginLeft: spacing.xs },
  trend: { marginLeft: 2, fontWeight: '700' },
});
