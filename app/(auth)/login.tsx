import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';
import { ApiCallError } from '@/lib/api/client';
import { authApi } from '@/lib/auth/api';
import { useAuthStore } from '@/lib/auth/store';
import { soon } from '@/lib/ui/soon';
import { theme } from '@/theme';
import { AppConformeLogo } from '@/components/brand/AppConformeLogo';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';

const schema = z.object({
  email: z.string().min(1, { message: 'Informe o e-mail ou usuário.' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setMe = useAuthStore((s) => s.setMe);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const session = await authApi.login(values);
      await setSession(session);
      const me = await authApi.me();
      await setMe(me);
      if (me.companies.length > 1) {
        router.replace('/(auth)/select-company');
      } else {
        router.replace('/(tabs)/inicio' as never);
      }
    } catch (err) {
      if (err instanceof ApiCallError) {
        setServerError(err.message);
      } else {
        setServerError('Não foi possível entrar. Verifique sua conexão.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen bg="surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <AppConformeLogo size={36} variant="horizontal" />
            <Text style={styles.tagline}>
              Gestão de conformidades, não conformidades e melhoria contínua.
            </Text>
          </View>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="E-mail ou usuário"
                  leftIcon="User"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="Digite seu e-mail ou usuário"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!submitting}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Senha"
                  leftIcon="Lock"
                  rightIcon={showPassword ? 'EyeOff' : 'Eye'}
                  onRightIconPress={() => setShowPassword((v) => !v)}
                  secureTextEntry={!showPassword}
                  placeholder="Digite sua senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!submitting}
                  error={errors.password?.message}
                />
              )}
            />

            <Pressable
              onPress={() => soon('Recuperação de senha')}
              hitSlop={6}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </Pressable>

            {serverError ? (
              <Banner tone="danger" message={serverError} />
            ) : null}

            <Button
              label="Entrar"
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
              size="lg"
              full
            />

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <SsoButton
              label="Entrar com Google"
              iconColor="#EA4335"
              onPress={() => soon('Login com Google')}
            />
            <SsoButton
              label="Entrar com Microsoft"
              iconColor="#0078D4"
              onPress={() => soon('Login com Microsoft')}
              isMicrosoft
            />

            <Banner
              tone="info"
              title="Segurança em primeiro lugar"
              message="Seus dados são protegidos com os mais altos padrões de segurança."
              icon="ShieldCheck"
            />

            <Pressable onPress={() => soon('Falar com administrador')} hitSlop={6}>
              <Text style={styles.bottomLink}>
                Não tem uma conta?{' '}
                <Text style={styles.bottomLinkAccent}>Fale com seu administrador</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SsoButton({
  label,
  iconColor,
  onPress,
  isMicrosoft,
}: {
  label: string;
  iconColor: string;
  onPress: () => void;
  isMicrosoft?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.sso, pressed && { backgroundColor: theme.color.bgSubtle }]}
    >
      <View style={[styles.ssoIcon, { backgroundColor: theme.color.surface }]}>
        {isMicrosoft ? <MicrosoftMark /> : <GoogleMark color={iconColor} />}
      </View>
      <Text style={styles.ssoLabel}>{label}</Text>
    </Pressable>
  );
}

function GoogleMark({ color }: { color: string }) {
  // Mark mínimo: letra G estilizada como placeholder até integrar gtoolkit.
  return <Text style={{ color, fontFamily: theme.fontFamily.bold, fontSize: 18 }}>G</Text>;
}

function MicrosoftMark() {
  // Quatro quadrantes coloridos clássicos da Microsoft.
  return (
    <View style={{ width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
      <View style={{ width: 8, height: 8, backgroundColor: '#F25022' }} />
      <View style={{ width: 8, height: 8, backgroundColor: '#7FBA00' }} />
      <View style={{ width: 8, height: 8, backgroundColor: '#00A4EF' }} />
      <View style={{ width: 8, height: 8, backgroundColor: '#FFB900' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[8],
    paddingBottom: theme.spacing[8],
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing[7],
    gap: theme.spacing[2],
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: theme.lineHeight.md,
  },
  fields: { gap: theme.spacing[3] },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: {
    fontSize: theme.fontSize.base,
    color: theme.color.primary,
    fontFamily: theme.fontFamily.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: theme.spacing[1],
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.color.border,
  },
  dividerText: {
    fontSize: theme.fontSize.base,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.medium,
  },
  sso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    minHeight: 50,
    justifyContent: 'center',
  },
  ssoIcon: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ssoLabel: {
    fontSize: theme.fontSize.md,
    color: theme.color.text,
    fontFamily: theme.fontFamily.semibold,
  },
  bottomLink: {
    marginTop: theme.spacing[3],
    textAlign: 'center',
    fontSize: theme.fontSize.base,
    color: theme.color.textMuted,
    fontFamily: theme.fontFamily.regular,
  },
  bottomLinkAccent: {
    color: theme.color.primary,
    fontFamily: theme.fontFamily.semibold,
  },
});
