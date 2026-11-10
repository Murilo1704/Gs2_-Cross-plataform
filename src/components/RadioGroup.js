import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

/**
 * Escolha unica em lista (botoes de radio acessiveis).
 * options: [{ value, label, description?, icon? }]
 */
export default function RadioGroup({ label, options, value, onChange, error, required = false }) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="label" style={styles.label}>
        {label}
        {required ? <AppText variant="label" color={colors.riskHigh}> *</AppText> : null}
      </AppText>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={o.description ? `${o.label}. ${o.description}` : o.label}
            style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
          >
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? colors.primary : colors.textMuted}
            />
            <View style={styles.texts}>
              <View style={styles.titleRow}>
                {o.icon ? <Ionicons name={o.icon} size={16} color={colors.primary} style={styles.icon} /> : null}
                <AppText variant="label">{o.label}</AppText>
              </View>
              {o.description ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {o.description}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
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
  label: { marginBottom: spacing.xs },
  option: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  pressed: { opacity: 0.85 },
  texts: { flex: 1, marginLeft: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.xs },
  errorRow: { flexDirection: 'row', alignItems: 'center' },
  errorText: { marginLeft: spacing.xs, flex: 1 },
});
