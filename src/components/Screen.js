import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * Container padrao das telas (rolagem + pull-to-refresh opcional).
 */
export default function Screen({ children, onRefresh, refreshing = false, scroll = true, style }) {
  if (!scroll) {
    return <View style={[styles.container, styles.content, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, style]}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
});
