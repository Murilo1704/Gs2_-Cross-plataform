import { StyleSheet, View } from 'react-native';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';

export default function SectionHeader({ title, subtitle, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: radius.pill, backgroundColor: colors.accent, marginRight: spacing.sm },
  texts: { flex: 1 },
});
