import { Pressable, StyleSheet, View } from 'react-native';
import { useSettings } from '../state/AppContext';
import { colors, highContrast, radius, shadow, spacing } from '../theme';

/**
 * Superficie base. Se receber onPress vira botao acessivel.
 * Com "alto contraste" ativo, a borda fica escura e mais grossa.
 */
export default function Card({ children, style, onPress, accessibilityLabel, accessibilityHint }) {
  const { highContrast: hc } = useSettings();
  const base = [styles.card, hc && styles.contrast];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [base, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  contrast: { borderColor: highContrast.border, borderWidth: 2 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
});
