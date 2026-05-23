/**
 * Tela "Editar perfil" — pixel-perfect ao mockup `Editar Perfil.png`.
 * Hoje salva localmente no Zustand (placeholder) e exibe alert "Em breve"
 * para campos que ainda não têm endpoint de update.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/avatar';
import { Banner } from '@/components/ui/banner';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { useAuthStore } from '@/lib/auth/store';
import { useCurrentRole } from '@/lib/auth/actor';
import { roleLabel } from '@/lib/permissions/roles';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';
import { isShowcase } from '@/theme/showcase';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const role = useCurrentRole();

  const initial = {
    name: isShowcase() ? 'João Silva' : user?.name ?? '',
    email: isShowcase() ? 'joao.silva@appconforme.com.br' : user?.email ?? '',
    phone: isShowcase() ? '(11) 98765-4321' : '',
    dob: isShowcase() ? '15/08/1990' : '',
    roleLabel: roleLabel(role),
    company: isShowcase() ? 'Indústria Exemplo LTDA' : companies.find((c) => c.companyId === activeCompanyId)?.companyName ?? '',
    location: isShowcase() ? 'Unidade São Paulo' : 'Matriz',
    area: isShowcase() ? 'Produção' : '',
    language: 'Português',
    timezone: '(UTC-03:00) Brasília',
  };

  const [form, setForm] = useState(initial);

  function onSave() {
    Alert.alert('Salvar', 'Os endpoints de update do perfil ainda não estão disponíveis.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <Screen bg="app" edges={['top']}>
      <ScreenHeader
        back
        title="Editar perfil"
        rightActions={[{ label: 'Salvar', onPress: onSave, tone: 'primary' }]}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <Card>
            <View style={styles.avatarRow}>
              <View>
                <Avatar name={form.name} size={84} ring />
                <Pressable onPress={() => soon('Trocar foto do perfil')} style={styles.cameraFab}>
                  <Icon name="Camera" size={14} color={theme.color.textOnPrimary} />
                </Pressable>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.avatarTitle}>Foto do perfil</Text>
                <Text style={styles.avatarHint}>Toque na foto para alterar.</Text>
              </View>
            </View>
          </Card>

          <SectionTitle title="Informações pessoais" />

          <TextField label="Nome completo" leftIcon="User" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} required />
          <TextField label="E-mail" leftIcon="Mail" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" required />

          <View style={styles.twoCol}>
            <TextField containerStyle={{ flex: 0.4 }} label="DDI" value="+55" editable={false} />
            <TextField containerStyle={{ flex: 1 }} label="Telefone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
          </View>

          <TextField label="Data de nascimento" leftIcon="Calendar" rightIcon="Calendar" value={form.dob} onChangeText={(v) => setForm({ ...form, dob: v })} placeholder="DD/MM/AAAA" />

          <Pressable onPress={() => soon('Selecionar cargo')}>
            <TextField label="Cargo / Função" leftIcon="Briefcase" rightIcon="ChevronDown" editable={false} value={form.roleLabel} />
          </Pressable>

          <SectionTitle title="Empresa e local" />

          <Pressable onPress={() => soon('Trocar empresa')}>
            <TextField label="Empresa" leftIcon="Building2" rightIcon="ChevronDown" editable={false} value={form.company} />
          </Pressable>
          <Pressable onPress={() => soon('Selecionar unidade')}>
            <TextField label="Unidade" leftIcon="MapPin" rightIcon="ChevronDown" editable={false} value={form.location} />
          </Pressable>
          <Pressable onPress={() => soon('Selecionar área')}>
            <TextField label="Área" leftIcon="LayoutGrid" rightIcon="ChevronDown" editable={false} value={form.area} placeholder="Selecione a área" />
          </Pressable>

          <SectionTitle title="Preferências" />

          <View style={styles.twoCol}>
            <Pressable style={{ flex: 1 }} onPress={() => soon('Idioma')}>
              <TextField label="Idioma" rightIcon="ChevronDown" editable={false} value={form.language} />
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => soon('Fuso horário')}>
              <TextField label="Fuso horário" rightIcon="ChevronDown" editable={false} value={form.timezone} />
            </Pressable>
          </View>

          <Banner
            tone="info"
            message="Algumas alterações podem exigir que você faça login novamente."
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing[4], gap: theme.spacing[3], paddingBottom: 60 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cameraFab: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: theme.color.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.color.surface,
  },
  avatarTitle: { fontSize: theme.fontSize.md, color: theme.color.text, fontFamily: theme.fontFamily.semibold },
  avatarHint: { fontSize: theme.fontSize.sm, color: theme.color.textMuted, marginTop: 2 },
  sectionTitle: {
    marginTop: theme.spacing[2],
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily.semibold,
    color: theme.color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  twoCol: { flexDirection: 'row', gap: 10 },
});
