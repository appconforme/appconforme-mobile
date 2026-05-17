import { StyleSheet, Text, View } from 'react-native';
import type { ItemRendererProps } from './types';

/**
 * Placeholder pros tipos que dependem de upload de evidência
 * (photo / signature / file). Fase D habilita o upload real;
 * por ora o item permanece "não respondido" pra não falsificar conclusão.
 */
export function PlaceholderRenderer({ item }: ItemRendererProps) {
  const label =
    item.type === 'photo'
      ? 'Foto'
      : item.type === 'signature'
        ? 'Assinatura'
        : 'Arquivo';
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{label} — em breve</Text>
      <Text style={styles.desc}>
        Upload de evidência será habilitado em uma próxima versão do app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
    gap: 4,
  },
  title: { fontSize: 13, fontWeight: '600', color: '#334155' },
  desc: { fontSize: 12, color: '#64748b' },
});
