import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/lib/auth/store';
import { initSentry } from '@/lib/errors/sentry';
import { theme } from '@/theme';

// Init em module-level: roda antes de qualquer render.
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
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }
    if (!activeCompanyId) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }
    if (inAuthGroup) router.replace('/(tabs)/inicio' as never);
  }, [accessToken, activeCompanyId, hydrated, router, segments]);

  if (!hydrated || (accessToken && !activeCompanyId && segments[0] !== '(auth)')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.bg }}>
        <ActivityIndicator color={theme.color.primary} />
      </View>
    );
  }
  return <>{children}</>;
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Não bloqueia para sempre: se a fonte demora além de ~2s, libera com
  // fallback do sistema. Em produção, splash do Expo cobre o gap inicial.
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.color.bg }}>
        <ActivityIndicator color={theme.color.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.color.bg },
          }}
        />
        <StatusBar style="auto" />
      </AuthGate>
    </QueryClientProvider>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
