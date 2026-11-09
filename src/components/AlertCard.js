import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import Card from './Card';
import RiskBadge from './RiskBadge';
import { DOMAINS } from '../data/domains';
import { colors, risk, spacing } from '../theme';
import { formatPercent } from '../utils/format';

/** Resumo de um alerta preditivo. Toque abre o detalhe. */
export default function AlertCard({ alert, onPress }) {
  const domain = DOMAINS[alert.domain];
  const r = risk[alert.level];

  return (
    <Card
      onPress={onPress}
      style={[styles.card, { borderLeftColor: r.color }]}
      accessibilityLabel={`${r.label}. ${domain.label}: ${alert.title}. ${alert.summary} Confiança ${alert.confidence.label}.${
        alert.requiresHumanDecision ? ' Requer decisão humana.' : ''
      }`}
      accessibilityHint="Abre a justificativa, a confiança e as limitações do alerta"
    >
      <View style={styles.head}>
        <Ionicons name={domain.icon} size={18} color={domain.color} />
        <AppText variant="caption" color={colors.textMuted} style={styles.domain}>
          {domain.label}
        </AppText>
        <RiskBadge level={alert.level} />
      </View>

      <AppText variant="label" style={styles.title}>
        {alert.title}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {alert.summary}
      </AppText>

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
          Confiança {alert.confidence.label} ({formatPercent(alert.confidence.value)})
        </AppText>
        {alert.requiresHumanDecision ? (
          <View style={styles.human}>
            <Ionicons name="person" size={12} color={colors.accent} />
            <AppText variant="caption" color={colors.accent} style={styles.humanText}>
              Requer decisão humana
            </AppText>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 5 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  domain: { flex: 1, marginLeft: spacing.xs },
  title: { marginBottom: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  flex: { flex: 1 },
  human: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.xs },
  humanText: { marginLeft: 2, fontWeight: '700' },
});
