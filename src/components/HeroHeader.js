import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius, spacing } from '../theme';

/**
 * Cabecalho de destaque das telas principais (faixa verde com formas
 * decorativas). Continua visualmente o header da navegacao.
 */
export default function HeroHeader({ eyebrow, title, subtitle, icon = 'leaf', children }) {
  return (
    <View style={styles.hero}>
      {/* Formas decorativas (ignoradas pelo leitor de tela) */}
      <View style={[styles.blob, styles.blobA]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />
      <View style={[styles.blob, styles.blobB]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />

      {eyebrow ? (
        <View style={styles.eyebrow}>
          <Ionicons name={icon} size={14} color={colors.accentLight} />
          <AppText variant="caption" color={colors.accentLight} style={styles.eyebrowText}>
            {eyebrow}
          </AppText>
        </View>
      ) : null}
      <AppText variant="title" color={colors.textOnPrimary} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText color={colors.primaryLight} style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  blob: { position: 'absolute', borderRadius: radius.pill, backgroundColor: colors.primaryDark },
  blobA: { width: 220, height: 220, right: -70, top: -90, opacity: 0.6 },
  blobB: { width: 120, height: 120, right: 60, bottom: -70, backgroundColor: colors.accent, opacity: 0.25 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  eyebrowText: { marginLeft: spacing.xs, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  subtitle: { marginTop: spacing.xs },
  children: { marginTop: spacing.md },
});
