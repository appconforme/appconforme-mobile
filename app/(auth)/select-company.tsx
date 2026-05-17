import { useAuthStore } from '@/lib/auth/store';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectCompanyScreen() {
  const router = useRouter();
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);

  async function pick(id: string) {
    await setActiveCompanyId(id);
    router.replace('/(tabs)/tarefas');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolha a empresa</Text>
        <Text style={styles.subtitle}>
          Você tem vínculo ativo com mais de uma empresa.
        </Text>
      </View>

      <FlatList
        data={companies}
        keyExtractor={(item) => item.companyId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = item.companyId === activeCompanyId;
          return (
            <Pressable
              onPress={() => pick(item.companyId)}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle}>{item.companyName}</Text>
              <Text style={styles.cardMeta}>
                {roleLabel(item.role)} · {item.status}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'Super admin',
    COMPANY_OWNER: 'Dono',
    COMPANY_ADMIN: 'Admin',
    MANAGER: 'Gestor',
    INSPECTOR: 'Inspetor',
    WORKER: 'Operador',
    CLIENT_VIEWER: 'Visualizador',
  };
  return map[role] ?? role;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#0f172a' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#64748b' },
  list: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  cardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  cardPressed: { backgroundColor: '#f1f5f9' },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#0f172a' },
  cardMeta: { marginTop: 4, fontSize: 12, color: '#64748b' },
});
