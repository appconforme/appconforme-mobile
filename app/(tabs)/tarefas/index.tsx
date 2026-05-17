import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TarefasIndex() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.title}>Tarefas</Text>
        <Text style={styles.empty}>
          Em breve — Fase B do MVP mobile habilita a lista e o detalhe de
          tarefas.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 24 },
  title: { fontSize: 24, fontWeight: '600', color: '#0f172a' },
  empty: { marginTop: 12, fontSize: 14, color: '#64748b' },
});
