import { StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  BarChart,
  BulletList,
  Button,
  Card,
  ConfidenceMeter,
  EmptyState,
  RiskBadge,
  Screen,
  SectionHeader,
} from '../../components';
import { DOMAINS } from '../../data/domains';
import { useApp } from '../../state/AppContext';
import { colors, radius, spacing } from '../../theme';
import { formatDateTime, formatNumber, formatSigned } from '../../utils/format';
import { ALERT_FIELD, buildSeries, FIELDS } from '../../utils/series';

function Evidence({ evidence }) {
  const digits = evidence.unit === '°C' || evidence.unit === 'mm' ? 1 : 0;
  return (
    <View style={styles.evidence}>
      {evidence.current != null ? (
        <View style={styles.evidenceBox} accessible accessibilityLabel={`Referência atual: ${formatNumber(evidence.current, digits)} ${evidence.unit}`}>
          <AppText variant="caption" color={colors.textMuted}>
            Referência atual
          </AppText>
          <AppText variant="number">{formatNumber(evidence.current, digits)}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {evidence.unit}
          </AppText>
        </View>
      ) : null}
      <View style={styles.evidenceBox} accessible accessibilityLabel={`Previsto: ${formatNumber(evidence.predicted, digits)} ${evidence.unit}`}>
        <AppText variant="caption" color={colors.textMuted}>
          Previsto
        </AppText>
        <AppText variant="number">{formatNumber(evidence.predicted, digits)}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {evidence.unit}
          {typeof evidence.changePct === 'number' ? ` (${formatSigned(evidence.changePct)}%)` : ''}
        </AppText>
      </View>
    </View>
  );
}

// Detalhe de um alerta: tudo o que o gestor precisa para decidir com seguranca.
export default function AlertDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { state, territory } = useApp();
  const alert = state.alerts.find((a) => a.id === id);

  if (!alert) {
    return (
      <Screen>
        <EmptyState
          icon="search"
          title="Alerta não encontrado"
          message="Os alertas são recalculados ao atualizar os dados ou trocar de território."
        >
          <Button title="Voltar para os alertas" onPress={() => router.replace('/alertas')} />
        </EmptyState>
      </Screen>
    );
  }

  const domain = DOMAINS[alert.domain];
  const fieldKey = ALERT_FIELD[alert.key];
  const field = FIELDS[fieldKey];

  return (
    <Screen>
      <Stack.Screen options={{ title: domain.label }} />

      <Card>
        <View style={styles.head}>
          <Ionicons name={domain.icon} size={22} color={domain.color} />
          <AppText variant="label" color={colors.textMuted} style={styles.flex}>
            {domain.label} · {territory.shortName}
          </AppText>
        </View>
        <AppText variant="subtitle" accessibilityRole="header" style={styles.title}>
          {alert.title}
        </AppText>
        <RiskBadge level={alert.level} />
        <AppText style={styles.summary}>{alert.summary}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Gerado em {formatDateTime(alert.generatedAt)}
        </AppText>
      </Card>

      {alert.requiresHumanDecision ? (
        <View style={styles.human} accessible accessibilityRole="alert">
          <Ionicons name="person" size={22} color={colors.accent} />
          <View style={styles.flex}>
            <AppText variant="label" color={colors.accent}>
              {alert.highImpact ? 'Alto impacto: exige decisão humana' : 'Exige avaliação de um gestor'}
            </AppText>
            <AppText variant="caption" color={colors.text}>
              O app não executa nenhuma ação automaticamente. Avalie as evidências e as limitações antes de decidir.
            </AppText>
          </View>
        </View>
      ) : null}

      <SectionHeader title="Evidência" />
      <Evidence evidence={alert.evidence} />

      {field ? (
        <Card>
          <BarChart
            title={`${field.label} por dia`}
            data={buildSeries(state.dataset, fieldKey)}
            color={field.color}
            unit={field.unit}
            digits={field.digits}
            reference={fieldKey === 'services' ? { value: territory.serviceCapacity, label: 'Capacidade' } : undefined}
          />
        </Card>
      ) : null}

      <SectionHeader title="Justificativa" subtitle="Por que este alerta foi gerado" />
      <Card>
        <BulletList items={alert.justification} icon="analytics" iconColor={colors.primary} iconSize={16} />
      </Card>

      <SectionHeader title="Nível de confiança" subtitle="Fatores que compõem a confiança" />
      <Card>
        <ConfidenceMeter confidence={alert.confidence} />
      </Card>

      {state.settings.showLimitations ? (
        <>
          <SectionHeader title="Limitações" subtitle="Quando não confiar nesta previsão" />
          <Card style={styles.limitations}>
            <BulletList items={alert.limitations} icon="alert-circle" iconColor={colors.riskMedium} iconSize={16} />
          </Card>
        </>
      ) : null}

      <SectionHeader title="Ações sugeridas" subtitle="Sugestões para avaliação. Nenhuma é executada pelo app." />
      <Card>
        <BulletList items={alert.actions} icon="checkbox-outline" iconColor={colors.primary} iconSize={16} />
      </Card>

      <SectionHeader title="Modelo e fontes" />
      <Card>
        <AppText>{alert.model}</AppText>
        <View style={styles.sources}>
          <BulletList items={alert.sources} icon="link" iconColor={colors.textMuted} iconSize={14} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  title: { marginVertical: spacing.sm },
  summary: { marginTop: spacing.sm, marginBottom: spacing.xs },
  human: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
    marginBottom: spacing.md,
  },
  evidence: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  evidenceBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitations: { backgroundColor: colors.riskMediumBg, borderColor: colors.riskMediumBg },
  sources: { marginTop: spacing.sm },
});
