import { Stack } from 'expo-router';
import { theme } from '@/theme';

export default function PerfilLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.color.bg },
      }}
    />
  );
}
