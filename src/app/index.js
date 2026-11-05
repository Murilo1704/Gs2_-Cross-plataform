import { StyleSheet, View } from 'react-native';
import {
  AppText,
  Button,
  Card,
  IndicatorCard,
  RiskBadge,
  Screen,
  SectionHeader,
} from '../components';
import { colors, spacing } from '../theme';

// Tela inicial provisoria: vitrine da identidade visual e dos
// componentes reutilizaveis. Sera substituida pelo dashboard.
export default function Home() {
  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        Painel de Inteligencia Territorial
      </AppText>
      <AppText color={colors.textMuted} style={styles.lead}>
        Antecipe problemas de agua, energia, clima, residuos e demanda por servicos.
        A decisao final e sempre de um gestor humano.
      </AppText>

      <SectionHeader title="Componentes" subtitle="Identidade visual do app" />
      <View style={styles.grid}>
        <IndicatorCard icon="water" label="Consumo de agua" value="152" unit="L/hab/dia" trend={4.2} color={colors.water} />
        <IndicatorCard icon="flash" label="Energia" value="3.1" unit="MWh/dia" trend={-2.0} color={colors.energy} />
      </View>

      <Card>
        <View style={styles.badges}>
          <RiskBadge level="baixo" />
          <RiskBadge level="medio" />
          <RiskBadge level="alto" />
        </View>
      </Card>

      <Button title="Botao principal" icon="analytics" onPress={() => {}} />
      <View style={{ height: spacing.sm }} />
      <Button title="Botao secundario" variant="outline" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
