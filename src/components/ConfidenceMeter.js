import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';
import { formatPercent } from '../utils/format';

const LABEL_COLOR = { alta: colors.riskLow, moderada: colors.riskMedium, baixa: colors.riskHigh };

function Meter({ value, color, height = 10 }) {
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

/**
 * Nivel de confianca de um alerta, com os fatores que o compoem
 * (para o gestor entender POR QUE a confianca e alta ou baixa).
 * confidence: { value, label, factors: [{ name, value }] }
 */
export default function ConfidenceMeter({ confidence, showFactors = true }) {
  const color = LABEL_COLOR[confidence.label] ?? colors.primary;
  return (
    <View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Confiança ${confidence.label}`}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(confidence.value * 100) }}
      >
        <View style={styles.head}>
          <AppText variant="label">Confiança {confidence.label}</AppText>
          <AppText variant="label" color={color}>
            {formatPercent(confidence.value)}
          </AppText>
        </View>
        <Meter value={confidence.value} color={color} />
      </View>

      {showFactors && confidence.factors?.length ? (
        <View style={styles.factors}>
          {confidence.factors.map((f) => (
            <View key={f.name} style={styles.factor} accessible accessibilityLabel={`${f.name}: ${formatPercent(f.value)}`}>
              <View style={styles.head}>
                <AppText variant="caption" color={colors.textMuted}>
                  {f.name}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {formatPercent(f.value)}
                </AppText>
              </View>
              <Meter value={f.value} color={colors.chartAxis} height={6} />
            </View>
          ))}
          <AppText variant="caption" color={colors.textMuted} style={styles.note}>
            A confiança é limitada a 95%: nenhuma previsão é tratada como certeza.
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  track: { backgroundColor: colors.chartGrid, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  factors: { marginTop: spacing.md },
  factor: { marginBottom: spacing.sm },
  note: { marginTop: spacing.xs },
});
