import { ScrollView, StyleSheet } from 'react-native';
import Chip from './Chip';
import { spacing } from '../theme';

/**
 * Grupo de Chips de escolha unica, com rolagem horizontal.
 * options: [{ value, label, icon?, accessibilityLabel? }]
 */
export default function ChipGroup({ options, value, onChange, accessibilityLabel }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
      style={styles.scroll}
    >
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          icon={o.icon}
          accessibilityLabel={o.accessibilityLabel}
          selected={o.value === value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -spacing.md, marginVertical: spacing.sm },
  row: { gap: spacing.sm, paddingHorizontal: spacing.md },
});
