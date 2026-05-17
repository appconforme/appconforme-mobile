import { ApiCallError } from '@/lib/api/client';
import { authApi } from '@/lib/auth/api';
import { useAuthStore } from '@/lib/auth/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setMe = useAuthStore((s) => s.setMe);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
        router.replace('/(tabs)/tarefas');
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.brand}>AppConforme</Text>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Use o e-mail do seu vínculo com a empresa.
          </Text>

          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputErr]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="voce@empresa.com"
                    placeholderTextColor="#9aa3a8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!submitting}
                  />
                )}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.password && styles.inputErr]}
                    secureTextEntry
                    placeholder="••••••"
                    placeholderTextColor="#9aa3a8"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!submitting}
                  />
                )}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              ) : null}
            </View>

            {serverError ? (
              <Text style={styles.serverError}>{serverError}</Text>
            ) : null}

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              style={({ pressed }) => [
                styles.button,
                submitting && styles.buttonDisabled,
                pressed && !submitting && styles.buttonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  brand: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#0f172a' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#64748b' },
  fields: { marginTop: 28, gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  inputErr: { borderColor: '#dc2626' },
  errorText: { color: '#dc2626', fontSize: 12 },
  serverError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonPressed: { backgroundColor: '#1d4ed8' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
