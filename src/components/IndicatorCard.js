import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { useSettings } from '../state/AppContext';
import { colors, highContrast, radius, shadow, spacing } from '../theme';

/**
 * Indicador numerico (KPI) com variacao em relacao ao periodo anterior.
 * `trend` positivo = aumento. `goodWhenUp` define se aumentar e bom ou ruim.
 */
export default function IndicatorCard({ icon, label, value, unit, trend, goodWhenUp = false, color = colors.primary }) {
  const { highContrast: hc } = useSettings();
  const hasTrend = typeof trend === 'number' && !Number.isNaN(trend);
  const up = hasTrend && trend > 0;
  const good = hasTrend && (up === goodWhenUp || trend === 0);
  const trendColor = !hasTrend ? colors.textMuted : good ? colors.riskLow : colors.riskHigh;
  const trendBg = !hasTrend ? colors.background : good ? colors.riskLowBg : colors.riskHighBg;
  const trendText = hasTrend ? `${up ? '+' : ''}${trend.toFixed(1).replace('.', ',')}%` : '--';

  const a11y = `${label}: ${value} ${unit ?? ''}. ${
    hasTrend ? `Variação de ${trendText} em relação à semana anterior.` : ''
  }`;

  return (
    <View style={[styles.card, hc && styles.contrast]} accessible accessibilityLabel={a11y}>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={[styles.trendPill, { backgroundColor: trendBg }]}>
          {hasTrend && trend !== 0 ? (
            <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={12} color={trendColor} />
          ) : null}
          <AppText variant="caption" color={trendColor} style={styles.trend}>
            {trendText}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
        {label}
      </AppText>
      <AppText variant="number">{value}</AppText>
      {unit ? (
        <AppText variant="caption" color={colors.textMuted}>
          {unit}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    paddingTop: spacing.md + 4,
    margin: spacing.xs,
    overflow: 'hidden',
    ...shadow.card,
  },
  contrast: { borderColor: highContrast.border, borderWidth: 2 },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  trend: { marginLeft: 2, fontWeight: '700' },
});
