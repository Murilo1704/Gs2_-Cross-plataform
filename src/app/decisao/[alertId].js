import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  Button,
  Card,
  Checkbox,
  EmptyState,
  RadioGroup,
  RiskBadge,
  Screen,
  SectionHeader,
  TextField,
} from '../../components';
import { DOMAINS } from '../../data/domains';
import { useApp } from '../../state/AppContext';
import { colors, radius, spacing } from '../../theme';
import { DECISION_OPTIONS } from '../../utils/decisions';
import { formatPercent } from '../../utils/format';
import { LIMITS, maskBrDate, validateDecision } from '../../utils/validation';

const EMPTY = {
  decision: null,
  action: null,
  justification: '',
  responsible: '',
  role: '',
  reviewDate: '',
  confirmed: false,
};

// Formulario de registro da decisao humana sobre um alerta.
// O app NAO executa a acao escolhida: apenas documenta quem decidiu, o que e por que.
export default function DecisionForm() {
  const router = useRouter();
  const { alertId } = useLocalSearchParams();
  const { state, territory, addDecision } = useApp();
  const anonymous = state.settings.anonymousDecisions;
  const alert = state.alerts.find((a) => a.id === alertId);

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!alert) {
    return (
      <Screen>
        <EmptyState icon="search" title="Alerta não encontrado" message="Volte e abra o alerta novamente.">
          <Button title="Voltar" onPress={() => router.back()} />
        </EmptyState>
      </Screen>
    );
  }

  const errors = validateDecision(values, { anonymous });
  const errorFor = (field) => (submitted || touched[field] ? errors[field] : undefined);
  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));
  const domain = DOMAINS[alert.domain];
  // "Manter monitoramento de rotina" nao e uma acao a encaminhar
  const actions = alert.actions.slice(1);

  const onSubmit = () => {
    setSubmitted(true);
    const count = Object.keys(errors).length;
    if (count) {
      AccessibilityInfo.announceForAccessibility?.(`Corrija ${count} campo(s) destacados no formulário.`);
      return;
    }
    setSaving(true);
    addDecision({
      alertId: alert.id,
      alertKey: alert.key,
      alertTitle: alert.title,
      domain: alert.domain,
      level: alert.level,
      confidence: alert.confidence.value,
      territoryId: territory.id,
      territoryName: territory.shortName,
      decision: values.decision,
      action: values.decision === 'encaminhar' ? values.action : null,
      justification: values.justification.trim(),
      responsible: anonymous ? null : values.responsible.trim(),
      role: anonymous ? null : values.role.trim() || null,
      reviewDate: values.reviewDate.trim() || null,
    });
    AccessibilityInfo.announceForAccessibility?.('Decisão registrada.');
    router.back();
  };

  const errorCount = Object.keys(errors).length;

  return (
    <Screen>
      <Card>
        <View style={styles.head}>
          <Ionicons name={domain.icon} size={18} color={domain.color} />
          <AppText variant="caption" color={colors.textMuted} style={styles.flex}>
            {domain.label} · {territory.shortName}
          </AppText>
          <RiskBadge level={alert.level} />
        </View>
        <AppText variant="label" style={styles.title}>
          {alert.title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          Confiança {alert.confidence.label} ({formatPercent(alert.confidence.value)}) · {alert.limitations.length}{' '}
          limitações conhecidas
        </AppText>
      </Card>

      <View style={styles.notice} accessible>
        <Ionicons name="hand-left" size={20} color={colors.accent} />
        <AppText variant="caption" style={styles.flex}>
          Este registro documenta a sua decisão. O aplicativo não executa nenhuma ação: a execução continua sendo
          responsabilidade da equipe e dos canais oficiais.
        </AppText>
      </View>

      <SectionHeader title="Decisão" />
      <RadioGroup
        label="O que será feito com este alerta?"
        required
        options={actions.length ? DECISION_OPTIONS : DECISION_OPTIONS.filter((o) => o.value !== 'encaminhar')}
        value={values.decision}
        onChange={(v) => {
          set('decision')(v);
          setTouched((t) => ({ ...t, decision: true }));
        }}
        error={errorFor('decision')}
      />

      {values.decision === 'encaminhar' ? (
        <RadioGroup
          label="Qual ação sugerida será encaminhada?"
          required
          options={actions.map((a) => ({ value: a, label: a }))}
          value={values.action}
          onChange={set('action')}
          error={errorFor('action')}
        />
      ) : null}

      <TextField
        label="Justificativa"
        required
        multiline
        maxLength={LIMITS.justificationMax}
        value={values.justification}
        onChangeText={set('justification')}
        onBlur={blur('justification')}
        helper="Por que esta decisão? Cite evidências ou o conhecimento local. Não inclua dados pessoais de cidadãos."
        placeholder="Ex.: A previsão de calor coincide com relatos da UBS sobre aumento de atendimentos..."
        error={errorFor('justification')}
      />

      <TextField
        label="Reavaliar em"
        required={values.decision === 'monitorar'}
        value={values.reviewDate}
        onChangeText={(t) => set('reviewDate')(maskBrDate(t))}
        onBlur={blur('reviewDate')}
        keyboardType="number-pad"
        placeholder="dd/mm/aaaa"
        maxLength={10}
        helper={`Data para rever o alerta (até ${LIMITS.reviewMaxDays} dias).`}
        error={errorFor('reviewDate')}
      />

      <SectionHeader title="Responsável" />
      {anonymous ? (
        <View style={styles.anon} accessible>
          <Ionicons name="eye-off-outline" size={20} color={colors.primary} />
          <AppText variant="caption" style={styles.flex}>
            Registro anônimo ativado em Ajustes: o nome do gestor não será solicitado nem salvo.
          </AppText>
        </View>
      ) : (
        <>
          <TextField
            label="Nome do gestor"
            required
            maxLength={LIMITS.nameMax}
            value={values.responsible}
            onChangeText={set('responsible')}
            onBlur={blur('responsible')}
            autoComplete="name"
            autoCapitalize="words"
            error={errorFor('responsible')}
          />
          <TextField
            label="Cargo ou órgão"
            maxLength={LIMITS.roleMax}
            value={values.role}
            onChangeText={set('role')}
            onBlur={blur('role')}
            placeholder="Ex.: Subprefeitura da Sé"
            error={errorFor('role')}
          />
        </>
      )}

      <Checkbox
        label="Li a justificativa, o nível de confiança e as limitações deste alerta antes de decidir."
        checked={values.confirmed}
        onChange={(v) => {
          set('confirmed')(v);
          setTouched((t) => ({ ...t, confirmed: true }));
        }}
        error={errorFor('confirmed')}
      />

      {submitted && errorCount ? (
        <AppText variant="label" color={colors.riskHigh} style={styles.summary} accessibilityRole="alert">
          Corrija {errorCount} campo(s) destacado(s) para salvar.
        </AppText>
      ) : null}

      <Button title="Registrar decisão" icon="checkmark-done" onPress={onSubmit} loading={saving} />
      <Button title="Cancelar" variant="outline" onPress={() => router.back()} style={styles.cancel} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1 },
  title: { marginTop: spacing.sm, marginBottom: 2 },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentLight,
  },
  anon: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.md,
  },
  summary: { marginBottom: spacing.sm },
  cancel: { marginTop: spacing.sm },
});
