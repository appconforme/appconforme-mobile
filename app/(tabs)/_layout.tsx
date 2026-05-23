import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '@/components/navigation/custom-tab-bar';
import { RegisterFabSheet } from '@/components/navigation/register-fab-sheet';
import { theme } from '@/theme';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={() => <CustomTabBar />}
      >
        <Tabs.Screen name="inicio" />
        <Tabs.Screen name="tarefas" />
        <Tabs.Screen name="relatorios" />
        <Tabs.Screen name="mais" />
        {/* Rotas que não aparecem na barra mas permanecem navegáveis */}
        <Tabs.Screen name="inspecoes" options={{ href: null }} />
        <Tabs.Screen name="perfil"    options={{ href: null }} />
      </Tabs>
      <RegisterFabSheet />
    </View>
  );
}
