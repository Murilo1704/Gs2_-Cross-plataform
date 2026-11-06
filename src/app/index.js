import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  IndicatorCard,
  RiskBadge,
  Screen,
  SectionHeader,
} from '../components';
import { DOMAINS } from '../data/domains';
import { TERRITORIES } from '../data/territories';
import { useApp } from '../state/AppContext';
import { colors, spacing } from '../theme';
import { formatDateTime, formatNumber, formatPercent } from '../utils/format';

const SOURCE_LABEL = {
  api: 'Clima: Open-Meteo (ao vivo)',
  cache: 'Clima: última leitura salva (offline)',
  sintetico: 'Clima: simulado (API indisponível)',
};

// Tela provisoria: mostra os dados reais da camada de dados
// (API + modelos + alertas). Sera substituida pelo dashboard com graficos.
export default function Home() {
  const { state, territory, activeAlerts, refresh, setTerritory } = useApp();
  const { dataset, alerts, status, error } = state;

  return (
    <Screen onRefresh={refresh} refreshing={status === 'loading' && !!dataset}>
      <AppText variant="title" accessibilityRole="header">
        {territory.name}
      </AppText>
      <AppText color={colors.textMuted}>
        {territory.type} · {formatNumber(territory.population)} habitantes (aprox.)
      </AppText>

      <View style={styles.row}>
        {TERRITORIES.map((t) => (
          <Button
            key={t.id}
            title={t.shortName}
            variant={t.id === territory.id ? 'primary' : 'outline'}
            onPress={() => setTerritory(t.id)}
            style={styles.chip}
          />
        ))}
      </View>

      {status === 'loading' && !dataset ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} accessibilityLabel="Carregando dados" />
      ) : null}

      {status === 'error' ? (
        <EmptyState icon="cloud-offline" title="Não foi possível carregar" message={error}>
          <Button title="Tentar novamente" onPress={refresh} />
        </EmptyState>
      ) : null}

      {dataset ? (
        <>
          <AppText variant="caption" color={colors.textMuted} style={styles.source}>
            {SOURCE_LABEL[dataset.weatherSource]} · atualizado {formatDateTime(dataset.generatedAt)}
          </AppText>

          <SectionHeader title="Indicadores da semana" subtitle="Média dos últimos 7 dias vs. semana anterior" />
          <View style={styles.grid}>
            <IndicatorCard icon="water" label="Água" value={formatNumber(dataset.indicators.water.value)} unit="L/hab/dia" trend={dataset.indicators.water.trend} color={colors.water} />
            <IndicatorCard icon="flash" label="Energia" value={formatNumber(dataset.indicators.energy.value)} unit="MWh/dia" trend={dataset.indicators.energy.trend} color={colors.energy} />
            <IndicatorCard icon="trash" label="Resíduos" value={formatNumber(dataset.indicators.waste.value)} unit="t/dia" trend={dataset.indicators.waste.trend} color={colors.waste} />
            <IndicatorCard icon="medkit" label="Atendimentos" value={formatNumber(dataset.indicators.services.value)} unit="por dia" trend={dataset.indicators.services.trend} color={colors.services} />
          </View>

          <SectionHeader
            title="Alertas preditivos"
            subtitle={`${activeAlerts.length} ativo(s) de ${alerts.length} temas avaliados`}
          />
          {alerts.map((a) => (
            <Card key={a.id}>
              <View style={styles.alertHead}>
                <AppText variant="label" style={styles.flex}>
                  {DOMAINS[a.domain].label} · {a.title}
                </AppText>
                <RiskBadge level={a.level} compact />
              </View>
              <AppText variant="caption" color={colors.textMuted}>
                {a.summary}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Confiança {a.confidence.label} ({formatPercent(a.confidence.value)})
              </AppText>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  chip: { paddingHorizontal: spacing.md },
  loader: { marginTop: spacing.xl },
  source: { marginTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  alertHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  flex: { flex: 1, marginRight: spacing.sm },
});
