import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import Card from './Card';
import RiskBadge from './RiskBadge';
import { colors, radius, spacing } from '../theme';
import { DECISION_TYPES } from '../utils/decisions';
import { formatDateTime, formatPercent } from '../utils/format';

/** Registro de uma decisao humana sobre um alerta. */
export default function DecisionCard({ decision, onRemove, showAlert = true }) {
  const type = DECISION_TYPES[decision.decision] ?? DECISION_TYPES.monitorar;

  return (
    <Card>
      <View style={styles.head}>
        <View style={[styles.typePill, { borderColor: type.color }]}>
          <Ionicons name={type.icon} size={14} color={type.color} />
          <AppText variant="caption" color={type.color} style={styles.bold}>
            {type.label}
          </AppText>
        </View>
        <View style={styles.flex} />
        {onRemove ? (
          <Pressable
            onPress={() => onRemove(decision)}
            accessibilityRole="button"
            accessibilityLabel="Excluir este registro de decisão"
            hitSlop={12}
            style={styles.remove}
          >
            <Ionicons name="trash-outline" size={20} color={colors.riskHigh} />
          </Pressable>
        ) : null}
      </View>

      {showAlert ? (
        <View style={styles.alertRow}>
          <AppText variant="label" style={styles.flex}>
            {decision.alertTitle}
          </AppText>
          <RiskBadge level={decision.level} compact />
        </View>
      ) : null}
      {showAlert ? (
        <AppText variant="caption" color={colors.textMuted}>
          {decision.territoryName} · confiança no momento: {formatPercent(decision.confidence)}
        </AppText>
      ) : null}

      {decision.action ? (
        <View style={styles.action}>
          <Ionicons name="checkbox-outline" size={16} color={colors.primary} />
          <AppText variant="caption" style={styles.actionText}>
            {decision.action}
          </AppText>
        </View>
      ) : null}

      <AppText style={styles.justification}>“{decision.justification}”</AppText>

      <View style={styles.meta}>
        <Ionicons name={decision.responsible ? 'person-outline' : 'eye-off-outline'} size={14} color={colors.textMuted} />
        <AppText variant="caption" color={colors.textMuted} style={styles.metaText}>
          {decision.responsible ? `${decision.responsible}${decision.role ? ` · ${decision.role}` : ''}` : 'Registro anônimo'}
          {` · ${formatDateTime(decision.createdAt)}`}
          {decision.reviewDate ? ` · reavaliar em ${decision.reviewDate}` : ''}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  bold: { fontWeight: '700' },
  flex: { flex: 1 },
  remove: { padding: spacing.xs },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  action: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  actionText: { flex: 1, marginLeft: spacing.xs },
  justification: { marginTop: spacing.sm, fontStyle: 'italic' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  metaText: { marginLeft: spacing.xs, flex: 1 },
});
