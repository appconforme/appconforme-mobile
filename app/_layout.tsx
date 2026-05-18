import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '@/lib/auth/store';
import { initSentry } from '@/lib/errors/sentry';

// Init em module-level: roda antes de qualquer render.
// Retorna true se o Sentry foi efetivamente inicializado (DSN presente).
const sentryEnabled = initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!accessToken) {
      // Sem token: força login.
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }
    // Com token mas sem empresa ativa ainda (race do /me pós-login):
    // segura nas rotas (auth) até `activeCompanyId` aparecer, evita
    // chamadas a endpoints com X-Company-Id obrigatório retornando 400.
    if (!activeCompanyId) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }
    // Logado + com empresa ativa, mas ainda na tela de auth → manda pras tabs.
    if (inAuthGroup) router.replace('/(tabs)/tarefas');
  }, [accessToken, activeCompanyId, hydrated, router, segments]);

  // Tela de espera enquanto hidrata, OU enquanto está logado mas /me ainda
  // não populou companies — evita renderizar tabs com header faltando.
  if (!hydrated || (accessToken && !activeCompanyId && segments[0] !== '(auth)')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </AuthGate>
    </QueryClientProvider>
  );
}

// Só envolve com Sentry quando o init de fato rodou; senão o wrap dispara
// warning "Sentry.wrap was called before Sentry.init" em dev sem DSN.
export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
