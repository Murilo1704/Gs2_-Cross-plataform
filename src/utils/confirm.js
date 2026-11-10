import { Alert, Platform } from 'react-native';

/**
 * Pede confirmacao antes de acoes destrutivas.
 * No web o Alert do React Native nao tem botoes, entao usa window.confirm.
 */
export function confirmAction({ title, message, confirmLabel = 'Confirmar', destructive = true }) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
