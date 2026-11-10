import { StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, MIN_TOUCH, spacing } from '../theme';

/** Linha de configuracao liga/desliga (Ajustes). */
export default function SwitchRow({ icon, title, description, value, onValueChange, last = false }) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <AppText variant="label">{title}</AppText>
        {description ? (
          <AppText variant="caption" color={colors.textMuted}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={title}
        accessibilityHint={description}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: MIN_TOUCH + 8, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.chartGrid },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  texts: { flex: 1, marginRight: spacing.sm },
});
