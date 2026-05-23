/**
 * Tela "Mais" (Perfil rico) — pixel-perfect ao mockup `Perfil.png`.
 * Header com avatar + nome + role + empresa + local + Editar.
 * KPIs do mês. Lista de seções (Info, Segurança, Notificações, Sync offline,
 * Aparência, Ajuda, Sobre). Logout no rodapé.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppConformeLogo } from '@/components/brand/AppConformeLogo';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { KpiCard } from '@/components/ui/kpi-card';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { authApi } from '@/lib/auth/api';
import { useCurrentRole } from '@/lib/auth/actor';
import { useAuthStore } from '@/lib/auth/store';
import { roleLabel } from '@/lib/permissions/roles';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';
import { isShowcase } from '@/theme/showcase';

export default function MaisScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const clear = useAuthStore((s) => s.clear);
  const role = useCurrentRole();
  const [loggingOut, setLoggingOut] = useState(false);

  const activeCompany = companies.find((c) => c.companyId === activeCompanyId) ?? null;
  const showName = isShowcase() ? 'João Silva' : user?.name ?? 'Usuário';
  const showRole = isShowcase() ? 'Operador' : roleLabel(role);
  const showCompany = isShowcase() ? 'Indústria Exemplo LTDA' : activeCompany?.companyName ?? '—';
  const showLocation = isShowcase() ? 'Unidade São Paulo' : 'Matriz';

  async function logout() {
    setLoggingOut(true);
    try { await authApi.logout(); }
    finally {
      await clear();
      router.replace('/(auth)/login');
    }
  }

  return (
    <Screen bg="app" edges={['top']}>
      <View style={styles.topBar}>
        <AppConformeLogo size={22} variant="horizontal" />
        <Pressable hitSlop={8} onPress={() => soon('Configurações')} style={styles.iconBtn}>
          <Icon name="Settings" size={22} color={theme.color.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Meu perfil</Text>

        {/* Card de identidade */}
        <Card>
          <View style={styles.identityRow}>
            <Avatar name={showName} size={64} ring />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.fullName} numberOfLines={1}>{showName}</Text>
              <Text style={styles.role}>{showRole}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="Mail" size={12} color={theme.color.textMuted} />
                <Text style={styles.contact} numberOfLines={1}>
                  {isShowcase() ? 'joao.silva@appconforme.com.br' : user?.email ?? '—'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="Phone" size={12} color={theme.color.textMuted} />
                <Text style={styles.contact}>{isShowcase() ? '(11) 98765-4321' : '—'}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/perfil/editar' as never)}
              style={styles.editBtn}
            >
              <Icon name="PencilLine" size={14} color={theme.color.primary} />
              <Text style={styles.editText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.empresaRow}>
            <View style={styles.empresaCol}>
              <Icon name="Building2" size={14} color={theme.color.primary} />
              <View>
                <Text style={styles.metaLabel}>Empresa</Text>
                <Text style={styles.metaValue} numberOfLines={1}>{showCompany}</Text>
              </View>
            </View>
            <View style={styles.empresaCol}>
              <Icon name="MapPin" size={14} color={theme.color.primary} />
              <View>
                <Text style={styles.metaLabel}>Local</Text>
                <Text style={styles.metaValue} numberOfLines={1}>{showLocation}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiCard icon="ClipboardCheck" value={isShowcase() ? 128 : 0} label="Tarefas concluídas este mês" tone="primary" variant="card" />
          <KpiCard icon="Percent"        value={isShowcase() ? '98%' : '—'} label="Taxa de conclusão este mês" tone="success" variant="card" />
          <KpiCard icon="Clock"          value={isShowcase() ? '42h' : '—'} label="Horas trabalhadas este mês" tone="warning" variant="card" />
          <KpiCard icon="Award"          value={isShowcase() ? 12 : 0} label="Dias consecutivos ativos" tone="accent" variant="card" />
        </View>

        {/* Lista de seções */}
        <Card padded={false}>
          <ListRow icon="User" iconTone="primary" title="Informações pessoais" subtitle="Dados cadastrais e contato" onPress={() => router.push('/perfil/editar' as never)} />
          <Divider />
          <ListRow icon="ShieldCheck" iconTone="success" title="Segurança" subtitle="Senha, autenticação e dispositivos" onPress={() => soon('Configurações de segurança')} />
          <Divider />
          <ListRow icon="Bell" iconTone="warning" title="Notificações" subtitle="Preferências e canais" onPress={() => soon('Notificações')} />
          <Divider />
          <ListRow icon="Cloud" iconTone="accent" title="Sincronização offline" subtitle="Gerenciar dados do dispositivo" onPress={() => soon('Sincronização offline')} />
          <Divider />
          <ListRow icon="Palette" iconTone="primary" title="Aparência" subtitle="Tema claro, escuro ou automático" onPress={() => soon('Personalização de aparência')} />
          <Divider />
          <ListRow icon="LifeBuoy" iconTone="orange" title="Ajuda & suporte" subtitle="Central de ajuda e contato" onPress={() => soon('Central de ajuda')} />
          <Divider />
          <ListRow icon="Info" iconTone="neutral" title="Sobre o AppConforme" subtitle="Versão do aplicativo e termos" onPress={() => soon('Sobre o aplicativo')} />
        </Card>

        <Pressable
          onPress={logout}
          disabled={loggingOut}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
        >
          {loggingOut ? (
            <ActivityIndicator color={theme.color.dangerFg} />
          ) : (
            <>
              <Icon name="LogOut" size={18} color={theme.color.dangerFg} strokeWidth={2.2} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  iconBtn: { padding: 4 },
  content: { paddingHorizontal: theme.spacing[4], paddingBottom: 120, gap: theme.spacing[4] },
  title: { fontSize: theme.fontSize['3xl'], color: theme.color.text, fontFamily: theme.fontFamily.bold, textAlign: 'center' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  fullName: { fontSize: theme.fontSize.lg, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  role: { fontSize: theme.fontSize.base, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium },
  contact: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, flex: 1 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: theme.color.primarySoft,
    borderRadius: theme.radius.full,
  },
  editText: { fontSize: theme.fontSize.sm, color: theme.color.primary, fontFamily: theme.fontFamily.semibold },
  empresaRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.color.border,
    flexDirection: 'row',
    gap: 16,
  },
  empresaCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: theme.fontSize.xs, color: theme.color.textMuted, fontFamily: theme.fontFamily.medium },
  metaValue: { fontSize: theme.fontSize.base, color: theme.color.text, fontFamily: theme.fontFamily.semibold, maxWidth: 130 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  divider: { height: 1, backgroundColor: theme.color.borderMuted, marginLeft: 62 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.color.dangerBg,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
  },
  logoutText: { color: theme.color.dangerFg, fontFamily: theme.fontFamily.semibold, fontSize: theme.fontSize.md },
});
