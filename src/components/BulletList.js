import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, spacing } from '../theme';

/** Lista com marcador em icone (justificativas, limitacoes, acoes). */
export default function BulletList({ items, icon = 'ellipse', iconColor = colors.primary, iconSize = 8 }) {
  return (
    <View accessibilityRole="list">
      {items.map((text, i) => (
        <View key={i} style={styles.item}>
          <View style={styles.iconBox}>
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          </View>
          <AppText style={styles.text}>{text}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', marginBottom: spacing.sm },
  iconBox: { width: 22, minHeight: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs },
  text: { flex: 1 },
});
