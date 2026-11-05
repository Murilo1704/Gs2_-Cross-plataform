import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, spacing } from '../theme';

export default function EmptyState({ icon = 'leaf-outline', title, message, children }) {
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${title}. ${message ?? ''}`}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {message ? (
        <AppText color={colors.textMuted} style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.xl },
  title: { marginTop: spacing.md, textAlign: 'center' },
  message: { marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.md },
});
