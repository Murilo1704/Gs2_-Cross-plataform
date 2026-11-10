import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, MIN_TOUCH, spacing } from '../theme';

/** Caixa de selecao acessivel, com mensagem de erro opcional. */
export default function Checkbox({ label, checked, onChange, error }) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={24}
          color={error ? colors.riskHigh : checked ? colors.primary : colors.textMuted}
        />
        <AppText style={styles.text}>{label}</AppText>
      </Pressable>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <Ionicons name="alert-circle" size={16} color={colors.riskHigh} />
          <AppText variant="caption" color={colors.riskHigh} style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.8 },
  text: { flex: 1, marginLeft: spacing.sm },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  errorText: { marginLeft: spacing.xs, flex: 1 },
});
