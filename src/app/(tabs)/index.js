import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AlertCard,
  AppText,
  BarChart,
  Button,
  Card,
  DataGate,
  DataSourceNote,
  EmptyState,
  IndicatorCard,
  Screen,
  SectionHeader,
  TerritorySelector,
} from '../../components';
import { useApp } from '../../state/AppContext';
import { colors, radius, risk, spacing } from '../../theme';
import { formatNumber } from '../../utils/format';
import { buildSeries, FIELDS } from '../../utils/series';

const LEVELS = ['alto', 'medio', 'baixo'];

/** Contagem de temas por nivel de risco (cor + icone + texto). */
function RiskSummary({ alerts }) {
  return (
    <View style={styles.riskRow}>
      {LEVELS.map((level) => {
        const r = risk[level];
        const count = alerts.filter((a) => a.level === level).length;
        return (
          <View
            key={level}
            style={[styles.riskBox, { backgroundColor: r.bg }]}
            accessible
            accessibilityLabel={`${count} tema(s) com ${r.label.toLowerCase()}`}
          >
            <Ionicons name={r.icon} size={20} color={r.color} />
            <AppText variant="number" color={r.color}>
              {count}
            </AppText>
            <AppText variant="caption" color={r.color} style={styles.bold}>
              {r.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

// Painel principal: visao geral do territorio para o gestor publico.
export default function Dashboard() {
  const router = useRouter();
  const { state, territory, activeAlerts, refresh } = useApp();
  const { dataset, alerts, status } = state;
  const ind = dataset?.indicators;
  const services = FIELDS.services;

  return (
    <Screen onRefresh={refresh} refreshing={status === 'loading' && !!dataset}>
      <AppText variant="title" accessibilityRole="header">
        {territory.name}
      </AppText>
      <AppText color={colors.textMuted}>
        {territory.type} · {formatNumber(territory.population)} habitantes (aprox.)
      </AppText>

      <TerritorySelector />

      <DataGate>
        {dataset ? (
          <>
            <DataSourceNote dataset={dataset} />

            <SectionHeader title="Situação dos próximos 7 dias" subtitle={`${alerts.length} temas avaliados`} />
            <RiskSummary alerts={alerts} />

            <SectionHeader title="Indicadores da semana" subtitle="Média dos últimos 7 dias vs. semana anterior" />
            <View style={styles.grid}>
              <IndicatorCard icon="water" label="Água" value={formatNumber(ind.water.value)} unit="L/hab/dia" trend={ind.water.trend} color={colors.water} />
              <IndicatorCard icon="flash" label="Energia" value={formatNumber(ind.energy.value)} unit="MWh/dia" trend={ind.energy.trend} color={colors.energy} />
              <IndicatorCard icon="trash" label="Resíduos" value={formatNumber(ind.waste.value)} unit="t/dia" trend={ind.waste.trend} color={colors.waste} />
              <IndicatorCard icon="medkit" label="Atendimentos" value={formatNumber(ind.services.value)} unit="por dia" trend={ind.services.trend} color={colors.services} />
            </View>

            <SectionHeader
              title="Demanda de saúde x capacidade"
              subtitle="14 dias observados + 7 dias previstos"
              right={
                <Button title="Tendências" variant="outline" onPress={() => router.push('/tendencias')} style={styles.smallBtn} />
              }
            />
            <Card>
              <BarChart
                title="Atendimentos de saúde por dia"
                data={buildSeries(dataset, 'services')}
                color={services.color}
                unit={services.unit}
                digits={services.digits}
                reference={{ value: territory.serviceCapacity, label: 'Capacidade' }}
              />
            </Card>

            <SectionHeader
              title="Precisa de atenção"
              subtitle="Alertas de risco médio ou alto"
              right={
                activeAlerts.length ? (
                  <Button title="Ver todos" variant="outline" onPress={() => router.push('/alertas')} style={styles.smallBtn} />
                ) : null
              }
            />
            {activeAlerts.length ? (
              activeAlerts
                .slice(0, 3)
                .map((a) => (
                  <AlertCard
                    key={a.id}
                    alert={a}
                    onPress={() => router.push({ pathname: '/alerta/[id]', params: { id: a.id } })}
                  />
                ))
            ) : (
              <EmptyState
                icon="checkmark-circle-outline"
                title="Nenhum alerta ativo"
                message="Todos os temas estão com risco baixo para os próximos 7 dias."
              />
            )}

            <View style={styles.disclaimer} accessible>
              <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
              <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
                Este painel apoia, mas não substitui, a decisão do gestor. Nenhuma ação é executada automaticamente.
              </AppText>
            </View>
          </>
        ) : null}
      </DataGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  riskRow: { flexDirection: 'row', gap: spacing.sm },
  riskBox: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: radius.md },
  bold: { fontWeight: '700', textAlign: 'center' },
  smallBtn: { minHeight: 40, paddingHorizontal: spacing.md },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  flex: { flex: 1 },
});
