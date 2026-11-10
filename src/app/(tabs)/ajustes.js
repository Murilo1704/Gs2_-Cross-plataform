import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { AppText, BulletList, Button, Card, HeroHeader, Screen, SectionHeader, SwitchRow } from '../../components';
import { useApp } from '../../state/AppContext';
import { colors, radius, spacing } from '../../theme';
import { confirmAction } from '../../utils/confirm';

const PRIVACY = [
  'Todos os indicadores são AGREGADOS por território. O app não coleta, exibe nem infere dados de cidadãos individuais, ruas ou domicílios.',
  'Não há cadastro, login, localização do aparelho nem rastreamento de uso.',
  'A única conexão externa é a API pública Open-Meteo, que recebe apenas as coordenadas do território (nunca do usuário).',
  'Decisões e preferências ficam salvas SOMENTE neste aparelho e podem ser apagadas a qualquer momento.',
  'O formulário de decisão bloqueia CPF, e-mail e telefone na justificativa.',
];

const ACCESSIBILITY = [
  'Compatível com leitores de tela (TalkBack e VoiceOver): botões, gráficos e alertas têm descrições faladas.',
  'Todo gráfico tem uma tabela de dados alternativa.',
  'O risco é indicado por cor + ícone + texto, nunca só por cor.',
  'Áreas de toque de no mínimo 48 dp e contraste de texto no padrão WCAG AA.',
];

// Acessibilidade, privacidade (LGPD) e informacoes sobre os dados.
export default function Settings() {
  const { state, updateSettings, clearAllData } = useApp();
  const { settings } = state;
  const [cleared, setCleared] = useState(false);
  const toggle = (key) => (value) => {
    setCleared(false);
    updateSettings({ [key]: value });
  };

  const onClear = async () => {
    const ok = await confirmAction({
      title: 'Apagar todos os dados?',
      message:
        'Serão apagados deste aparelho: decisões registradas, preferências, território escolhido e clima salvo. Esta ação não pode ser desfeita.',
      confirmLabel: 'Apagar tudo',
    });
    if (ok) {
      await clearAllData();
      setCleared(true);
    }
  };

  return (
    <Screen>
      <HeroHeader
        eyebrow="Ajustes"
        icon="options"
        title="Acessibilidade e privacidade"
        subtitle="Adapte o painel e controle os dados salvos no aparelho."
      />

      <SectionHeader title="Acessibilidade" />
      <Card>
        <SwitchRow
          icon="text"
          title="Texto ampliado"
          description="Aumenta em 20% o tamanho de todos os textos."
          value={settings.largeText}
          onValueChange={toggle('largeText')}
        />
        <SwitchRow
          icon="contrast"
          title="Alto contraste"
          description="Bordas escuras e textos secundários com contraste máximo."
          value={settings.highContrast}
          onValueChange={toggle('highContrast')}
          last
        />
      </Card>

      <SectionHeader title="Alertas" />
      <Card>
        <SwitchRow
          icon="alert-circle-outline"
          title="Mostrar limitações"
          description="Exibe no detalhe de cada alerta quando NÃO confiar na previsão. Recomendado manter ligado."
          value={settings.showLimitations}
          onValueChange={toggle('showLimitations')}
          last
        />
      </Card>

      <SectionHeader title="Privacidade" />
      <Card>
        <SwitchRow
          icon="eye-off-outline"
          title="Decisões anônimas"
          description="Não pede nem salva o nome do gestor nos novos registros de decisão."
          value={settings.anonymousDecisions}
          onValueChange={toggle('anonymousDecisions')}
          last
        />
      </Card>
      <Card>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <AppText variant="label" style={styles.titleText}>
            Como o app protege os cidadãos
          </AppText>
        </View>
        <BulletList items={PRIVACY} icon="checkmark" iconColor={colors.riskLow} iconSize={16} />
      </Card>

      <Card style={styles.danger}>
        <AppText variant="label">Direito de exclusão (LGPD)</AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.dangerText}>
          {state.decisions.length} decisão(ões) registrada(s) neste aparelho.
        </AppText>
        <Button title="Apagar todos os dados do app" icon="trash" variant="danger" onPress={onClear} />
        {cleared ? (
          <View style={styles.cleared} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Ionicons name="checkmark-circle" size={18} color={colors.riskLow} />
            <AppText variant="caption" color={colors.riskLow} style={styles.titleText}>
              Dados apagados com sucesso.
            </AppText>
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Recursos de acessibilidade" />
      <Card>
        <BulletList items={ACCESSIBILITY} icon="accessibility" iconColor={colors.primary} iconSize={16} />
      </Card>

      <SectionHeader title="Sobre os dados" />
      <Card>
        <BulletList
          items={[
            'Clima (temperatura e chuva): Open-Meteo, dado real, observado nos últimos 14 dias e previsto para os próximos 7.',
            'Consumo de água, energia, resíduos e atendimentos de saúde: dados SINTÉTICOS gerados a partir do clima real, para demonstração.',
            'Previsões: regressão linear calculada no próprio aparelho, com intervalo de 95%.',
          ]}
          icon="server-outline"
          iconColor={colors.textMuted}
          iconSize={16}
        />
        <AppText variant="caption" color={colors.textMuted} style={styles.version}>
          Território Vivo · versão {Constants.expoConfig?.version ?? '1.0.0'}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  titleText: { marginLeft: spacing.sm, flex: 1 },
  danger: { borderColor: colors.riskHigh, backgroundColor: colors.riskHighBg },
  dangerText: { marginTop: 2, marginBottom: spacing.md },
  cleared: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  version: { marginTop: spacing.sm, textAlign: 'center' },
});
