import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AlertCard,
  AppText,
  ChipGroup,
  DataGate,
  DataSourceNote,
  EmptyState,
  Screen,
  TerritorySelector,
} from '../../components';
import { useApp } from '../../state/AppContext';
import { colors, radius, spacing } from '../../theme';

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'alto', label: 'Alto' },
  { value: 'medio', label: 'Médio' },
  { value: 'baixo', label: 'Baixo' },
];

// Lista de alertas preditivos, ordenada por risco e confianca.
export default function Alerts() {
  const router = useRouter();
  const { state, territory, refresh } = useApp();
  const { dataset, alerts, status } = state;
  const [filter, setFilter] = useState('todos');

  const visible = filter === 'todos' ? alerts : alerts.filter((a) => a.level === filter);
  const count = (v) => (v === 'todos' ? alerts.length : alerts.filter((a) => a.level === v).length);

  return (
    <Screen onRefresh={refresh} refreshing={status === 'loading' && !!dataset}>
      <AppText variant="subtitle" accessibilityRole="header">
        {territory.name}
      </AppText>
      <TerritorySelector />

      <DataGate>
        {dataset ? (
          <>
            <DataSourceNote dataset={dataset} />

            <View style={styles.info} accessible>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <AppText variant="caption" style={styles.flex}>
                Cada alerta mostra a justificativa, o nível de confiança e as limitações da previsão. As ações são apenas
                sugestões: a decisão é sempre do gestor.
              </AppText>
            </View>

            <ChipGroup
              accessibilityLabel="Filtrar alertas por nível de risco"
              value={filter}
              onChange={setFilter}
              options={FILTERS.map((f) => ({
                ...f,
                label: `${f.label} (${count(f.value)})`,
                accessibilityLabel: `${f.label}: ${count(f.value)} alerta(s)`,
              }))}
            />

            {visible.length ? (
              visible.map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onPress={() => router.push({ pathname: '/alerta/[id]', params: { id: a.id } })}
                />
              ))
            ) : (
              <EmptyState icon="funnel-outline" title="Nenhum alerta neste filtro" message="Escolha outro nível de risco." />
            )}
          </>
        ) : null}
      </DataGate>
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  flex: { flex: 1 },
});
