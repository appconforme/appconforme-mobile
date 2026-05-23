import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/auth/store';

export default function Index() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);

  if (accessToken && activeCompanyId) {
    return <Redirect href={'/(tabs)/inicio' as never} />;
  }
  return <Redirect href="/(auth)/login" />;
}
