import { Alert } from 'react-native';

/**
 * Toast/Alert padrão para features ainda não implementadas.
 * Centraliza a mensagem pra ficar consistente em todas as telas.
 */
export function soon(feature?: string): void {
  Alert.alert(
    'Em breve',
    feature
      ? `${feature} estará disponível em uma próxima versão.`
      : 'Esta funcionalidade estará disponível em uma próxima versão.',
    [{ text: 'OK', style: 'default' }],
  );
}
