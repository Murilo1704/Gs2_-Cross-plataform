import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';
import { formatDateTime } from '../utils/format';

const SOURCES = {
  api: { icon: 'cloud-done', text: 'Clima ao vivo (Open-Meteo)', color: colors.riskLow, bg: colors.riskLowBg },
  cache: { icon: 'cloud-offline', text: 'Sem conexão: clima da última leitura salva', color: colors.riskMedium, bg: colors.riskMediumBg },
  sintetico: { icon: 'flask', text: 'API indisponível: clima simulado', color: colors.riskHigh, bg: colors.riskHighBg },
};

/**
 * Transparencia sobre a origem dos dados exibidos.
 * Consumo e demanda sao sempre sinteticos; o clima varia conforme a conexao.
 */
export default function DataSourceNote({ dataset }) {
  const s = SOURCES[dataset.weatherSource] ?? SOURCES.sintetico;
  return (
    <View style={[styles.box, { backgroundColor: s.bg }]} accessible accessibilityRole="text">
      <Ionicons name={s.icon} size={18} color={s.color} />
      <View style={styles.texts}>
        <AppText variant="caption" color={colors.text} style={styles.bold}>
          {s.text} · atualizado {formatDateTime(dataset.generatedAt)}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Consumo de água, energia, resíduos e atendimentos: dados sintéticos para demonstração.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
  },
  texts: { flex: 1, marginLeft: spacing.sm },
  bold: { fontWeight: '700' },
});
