import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { useSettings } from '../state/AppContext';
import { colors, highContrast, LARGE_TEXT_SCALE, MIN_TOUCH, radius, spacing, typography } from '../theme';

/**
 * Campo de texto com rotulo, ajuda, contador e mensagem de erro.
 * O erro e anunciado pelo leitor de tela e nao depende so de cor (icone + texto).
 */
export default function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  helper,
  required = false,
  maxLength,
  multiline = false,
  placeholder,
  ...rest
}) {
  const settings = useSettings();
  const fontSize = typography.body.fontSize * (settings.largeText ? LARGE_TEXT_SCALE : 1);
  const borderColor = error ? colors.riskHigh : settings.highContrast ? highContrast.border : colors.border;

  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.label}>
        {label}
        {required ? <AppText variant="label" color={colors.riskHigh}> *</AppText> : null}
      </AppText>
      {helper ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.helper}>
          {helper}
        </AppText>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.chartAxis}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={`${label}${required ? ', obrigatório' : ''}`}
        accessibilityHint={helper}
        aria-invalid={!!error}
        style={[
          styles.input,
          { fontSize, borderColor },
          multiline && styles.multiline,
          error && styles.inputError,
        ]}
        {...rest}
      />
      <View style={styles.footer}>
        {error ? (
          <View style={styles.errorRow} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Ionicons name="alert-circle" size={16} color={colors.riskHigh} />
            <AppText variant="caption" color={colors.riskHigh} style={styles.errorText}>
              {error}
            </AppText>
          </View>
        ) : (
          <View style={styles.flex} />
        )}
        {maxLength ? (
          <AppText variant="caption" color={colors.textMuted}>
            {value?.length ?? 0}/{maxLength}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: 2 },
  helper: { marginBottom: spacing.xs },
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 110 },
  inputError: { backgroundColor: colors.riskHighBg },
  footer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  errorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm },
  errorText: { marginLeft: spacing.xs, flex: 1 },
  flex: { flex: 1 },
});
