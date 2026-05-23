import { Stack } from 'expo-router';
import { theme } from '@/theme';

export default function RegistrarOcorrenciaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.color.bg },
      }}
    />
  );
}
