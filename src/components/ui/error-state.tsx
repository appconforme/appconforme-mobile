import { StyleSheet, Text, View } from 'react-native';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title ?? 'Algo deu errado'}</Text>
      <Text style={styles.msg}>{message}</Text>
      {onRetry ? (
        <View style={styles.btn}>
          <Button label="Tentar novamente" onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#0f172a', textAlign: 'center' },
  msg: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  btn: { marginTop: 16, alignSelf: 'stretch' },
});
