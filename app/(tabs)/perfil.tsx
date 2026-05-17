import { authApi } from '@/lib/auth/api';
import { useAuthStore } from '@/lib/auth/store';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const setActiveCompanyId = useAuthStore((s) => s.setActiveCompanyId);
  const clear = useAuthStore((s) => s.clear);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      await clear();
      router.replace('/(auth)/login');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.section}>
        <Text style={styles.title}>{user?.name ?? 'Usuário'}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Empresa ativa</Text>
        <FlatList
          data={companies}
          keyExtractor={(c) => c.companyId}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = item.companyId === activeCompanyId;
            return (
              <Pressable
                onPress={() => setActiveCompanyId(item.companyId)}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.rowActive,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.companyName}</Text>
                  <Text style={styles.rowMeta}>{item.role}</Text>
                </View>
                {active ? <Text style={styles.activeMark}>ativa</Text> : null}
              </Pressable>
            );
          }}
        />
      </View>

      <Pressable
        onPress={logout}
        disabled={loggingOut}
        style={({ pressed }) => [
          styles.logout,
          pressed && !loggingOut && styles.logoutPressed,
        ]}
      >
        {loggingOut ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <Text style={styles.logoutText}>Sair</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  section: { paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 22, fontWeight: '600', color: '#0f172a' },
  muted: { marginTop: 4, fontSize: 13, color: '#64748b' },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 8,
  },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  rowActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  rowPressed: { backgroundColor: '#f1f5f9' },
  rowTitle: { fontSize: 15, fontWeight: '500', color: '#0f172a' },
  rowMeta: { marginTop: 2, fontSize: 12, color: '#64748b' },
  activeMark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logout: {
    marginTop: 'auto',
    margin: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  logoutPressed: { backgroundColor: '#fee2e2' },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
