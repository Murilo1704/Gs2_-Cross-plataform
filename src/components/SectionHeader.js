import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, spacing } from '../theme';

export default function SectionHeader({ title, subtitle, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.texts}>
        <AppText variant="subtitle" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textMuted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  texts: { flex: 1 },
});
