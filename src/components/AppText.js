import { Text } from 'react-native';
import { colors, typography } from '../theme';

/**
 * Texto padrao do app. Respeita o tamanho de fonte do sistema
 * (allowFontScaling) com limite para nao quebrar o layout.
 */
export default function AppText({ variant = 'body', color = colors.text, style, children, ...rest }) {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.8}
      style={[typography[variant], { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
