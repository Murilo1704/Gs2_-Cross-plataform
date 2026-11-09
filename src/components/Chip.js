import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

/**
 * Opcao selecionavel (filtros e seletores). O estado selecionado e
 * indicado por cor, borda E icone de check, e anunciado ao leitor de tela.
 */
export default function Chip({ label, selected = false, onPress, icon, accessibilityLabel }) {
  const fg = selected ? colors.textOnPrimary : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={fg} style={styles.icon} />
      ) : icon ? (
        <Ionicons name={icon} size={16} color={fg} style={styles.icon} />
      ) : null}
      <AppText variant="label" color={fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH - 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
  icon: { marginRight: spacing.xs },
});
