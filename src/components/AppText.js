import { Text } from 'react-native';
import { useSettings } from '../state/AppContext';
import { colors, highContrast, LARGE_TEXT_SCALE, typography } from '../theme';

/**
 * Texto padrao do app.
 * - Respeita o tamanho de fonte do sistema (allowFontScaling), com limite.
 * - "Texto ampliado" (Ajustes) aumenta todas as fontes em 20%.
 * - "Alto contraste" (Ajustes) troca o texto secundario pelo texto principal.
 */
export default function AppText({ variant = 'body', color = colors.text, style, children, ...rest }) {
  const settings = useSettings();
  const base = typography[variant] ?? typography.body;
  const scaled = settings.largeText
    ? { fontSize: base.fontSize * LARGE_TEXT_SCALE, lineHeight: base.lineHeight * LARGE_TEXT_SCALE }
    : null;
  const finalColor = settings.highContrast && color === colors.textMuted ? highContrast.textMuted : color;

  return (
    <Text allowFontScaling maxFontSizeMultiplier={1.8} style={[base, scaled, { color: finalColor }, style]} {...rest}>
      {children}
    </Text>
  );
}
