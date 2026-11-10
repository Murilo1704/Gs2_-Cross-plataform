import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  Card,
  ChipGroup,
  DecisionCard,
  EmptyState,
  HeroHeader,
  RiskBadge,
  Screen,
  SectionHeader,
} from '../../components';
import { useApp } from '../../state/AppContext';
import { colors, radius, spacing } from '../../theme';
import { confirmAction } from '../../utils/confirm';
import { DECISION_OPTIONS } from '../../utils/decisions';

function Counter({ value, label, icon, color }) {
  return (
    <View style={styles.counter} accessible accessibilityLabel={`${value} ${label}`}>
      <Ionicons name={icon} size={18} color={color} />
      <AppText variant="number" color={colors.textOnPrimary}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.primaryLight} style={styles.center}>
        {label}
      </AppText>
    </View>
  );
}

// Apoio a decisao: alertas que aguardam avaliacao + historico de decisoes humanas.
export default function Decisions() {
  const router = useRouter();
  const { state, territory, activeAlerts, removeDecision } = useApp();
  const [scope, setScope] = useState('territorio');

  const decided = new Set(state.decisions.map((d) => d.alertId));
  const pending = activeAlerts.filter((a) => !decided.has(a.id));
  const list = scope === 'territorio' ? state.decisions.filter((d) => d.territoryId === territory.id) : state.decisions;

  const onRemove = async (decision) => {
    const ok = await confirmAction({
      title: 'Excluir registro?',
      message: `A decisão sobre "${decision.alertTitle}" será apagada deste aparelho.`,
      confirmLabel: 'Excluir',
    });
    if (ok) removeDecision(decision.id);
  };

  return (
    <Screen>
      <HeroHeader
        eyebrow="Apoio à decisão"
        icon="people"
        title="Decisões do gestor"
        subtitle="O app sugere, você decide. Cada decisão fica registrada com a justificativa."
      >
        <View style={styles.counters}>
          <Counter value={pending.length} label="aguardando" icon="hourglass" color={colors.accentLight} />
          {DECISION_OPTIONS.map((o) => (
            <Counter
              key={o.value}
              value={state.decisions.filter((d) => d.decision === o.value).length}
              label={o.value === 'encaminhar' ? 'encaminhadas' : o.value === 'monitorar' ? 'monitorando' : 'descartadas'}
              icon={o.icon}
              color={colors.primaryLight}
            />
          ))}
        </View>
      </HeroHeader>

      <SectionHeader title="Aguardando decisão" subtitle={`Alertas de risco médio ou alto em ${territory.shortName}`} />
      {pending.length ? (
        pending.map((a) => (
          <Card
            key={a.id}
            onPress={() => router.push({ pathname: '/decisao/[alertId]', params: { alertId: a.id } })}
            accessibilityLabel={`Registrar decisão para: ${a.title}`}
            accessibilityHint="Abre o formulário de decisão"
          >
            <View style={styles.pendingRow}>
              <RiskBadge level={a.level} compact />
              <AppText variant="label" style={styles.flex}>
                {a.title}
              </AppText>
              <View style={styles.cta}>
                <AppText variant="caption" color={colors.primary} style={styles.bold}>
                  Decidir
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <View style={styles.pendingRow}>
            <Ionicons name="checkmark-done-circle" size={24} color={colors.riskLow} />
            <AppText style={styles.flex}>Nenhum alerta ativo aguardando decisão neste território.</AppText>
          </View>
        </Card>
      )}

      <SectionHeader title="Histórico" subtitle="Salvo somente neste aparelho" />
      <ChipGroup
        accessibilityLabel="Filtrar histórico"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'territorio', label: territory.shortName, icon: 'location-outline' },
          { value: 'todos', label: `Todos (${state.decisions.length})`, icon: 'albums-outline' },
        ]}
      />
      {list.length ? (
        list.map((d) => <DecisionCard key={d.id} decision={d} onRemove={onRemove} />)
      ) : (
        <EmptyState
          icon="document-text-outline"
          title="Nenhuma decisão registrada"
          message="Abra um alerta e toque em “Registrar decisão” para documentar o que foi decidido."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  counters: { flexDirection: 'row', gap: spacing.sm },
  counter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  center: { textAlign: 'center' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  cta: { flexDirection: 'row', alignItems: 'center' },
  bold: { fontWeight: '700' },
});
