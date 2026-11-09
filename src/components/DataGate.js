import { ActivityIndicator, StyleSheet } from 'react-native';
import Button from './Button';
import EmptyState from './EmptyState';
import { useApp } from '../state/AppContext';
import { colors, spacing } from '../theme';

/**
 * Trata os estados de carregamento e erro de forma igual em todas as telas.
 * So renderiza os filhos quando o dataset do territorio estiver disponivel.
 */
export default function DataGate({ children }) {
  const { state, refresh } = useApp();
  const { dataset, status, error } = state;

  if (dataset) return children;

  if (status === 'error') {
    return (
      <EmptyState icon="cloud-offline" title="Não foi possível carregar os dados" message={error}>
        <Button title="Tentar novamente" icon="refresh" onPress={refresh} />
      </EmptyState>
    );
  }

  return (
    <ActivityIndicator
      size="large"
      color={colors.primary}
      style={styles.loader}
      accessibilityLabel="Carregando dados do território"
    />
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
});
