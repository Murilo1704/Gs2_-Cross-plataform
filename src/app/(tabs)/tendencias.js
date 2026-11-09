import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  BarChart,
  Card,
  ChipGroup,
  DataGate,
  DataSourceNote,
  Screen,
  SectionHeader,
  TerritorySelector,
} from '../../components';
import { MODEL_SPECS } from '../../engine/models';
import { useApp } from '../../state/AppContext';
import { colors, spacing } from '../../theme';
import { formatNumber, formatPercent, formatSigned } from '../../utils/format';
import { buildSeries, FIELD_ORDER, FIELDS, formatFieldValue, seriesStats } from '../../utils/series';

function Stat({ label, value }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

// Serie historica + previsao de cada tema, com estatisticas e explicacao do modelo.
export default function Trends() {
  const { state, territory, refresh } = useApp();
  const { dataset, status } = state;
  const [fieldKey, setFieldKey] = useState('water');
  const field = FIELDS[fieldKey];

  const series = buildSeries(dataset, fieldKey);
  const stats = series.length ? seriesStats(series) : null;
  const quality = field.model ? dataset?.modelQuality?.[field.model] : null;

  return (
    <Screen onRefresh={refresh} refreshing={status === 'loading' && !!dataset}>
      <AppText variant="subtitle" accessibilityRole="header">
        {territory.name}
      </AppText>
      <TerritorySelector />

      <DataGate>
        {dataset && stats ? (
          <>
            <DataSourceNote dataset={dataset} />

            <SectionHeader title="Tema" />
            <ChipGroup
              accessibilityLabel="Escolha do tema do gráfico"
              value={fieldKey}
              onChange={setFieldKey}
              options={FIELD_ORDER.map((k) => ({ value: k, label: FIELDS[k].shortLabel ?? FIELDS[k].label, icon: FIELDS[k].icon }))}
            />

            <Card>
              <View style={styles.titleRow}>
                <Ionicons name={field.icon} size={20} color={field.color} />
                <AppText variant="subtitle" style={styles.title} accessibilityRole="header">
                  {field.label}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.textMuted} style={styles.unit}>
                {field.unit} · últimos {stats.observedDays} dias e próximos {stats.predictedDays}
              </AppText>
              <BarChart
                key={`${territory.id}:${fieldKey}`}
                title={`${field.label} por dia`}
                data={series}
                color={field.color}
                unit={field.unit}
                digits={field.digits}
                reference={fieldKey === 'services' ? { value: territory.serviceCapacity, label: 'Capacidade' } : undefined}
              />
            </Card>

            <SectionHeader title="Resumo" subtitle="Últimos 7 dias observados vs. 7 dias previstos" />
            <Card>
              <View style={styles.stats}>
                <Stat label="Média recente" value={formatFieldValue(fieldKey, stats.meanObserved)} />
                <Stat label="Média prevista" value={formatFieldValue(fieldKey, stats.meanPredicted)} />
                <Stat label="Variação prevista" value={`${formatSigned(stats.change)}%`} />
                <Stat label="Mín. observado" value={formatFieldValue(fieldKey, stats.min)} />
                <Stat label="Máx. observado" value={formatFieldValue(fieldKey, stats.max)} />
                {quality ? <Stat label="Ajuste do modelo (R²)" value={formatPercent(quality.r2)} /> : null}
              </View>
            </Card>

            <SectionHeader title="Como a previsão é feita" />
            <Card>
              <AppText>
                {field.model
                  ? MODEL_SPECS[field.model].explain
                  : 'Previsão meteorológica da Open-Meteo para os próximos 7 dias (sem modelo próprio do app).'}
              </AppText>
              {quality ? (
                <AppText variant="caption" color={colors.textMuted} style={styles.note}>
                  Ajustado com {formatNumber(quality.n)} dias de histórico. Previsões incluem intervalo de 95%, que aumenta
                  conforme o horizonte.
                </AppText>
              ) : null}
            </Card>
          </>
        ) : null}
      </DataGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { marginLeft: spacing.sm },
  unit: { marginBottom: spacing.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { width: '50%', paddingVertical: spacing.sm, paddingRight: spacing.sm },
  note: { marginTop: spacing.sm },
});
