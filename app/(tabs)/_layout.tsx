import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="tarefas"
        options={{
          title: 'Tarefas',
        }}
      />
      <Tabs.Screen
        name="inspecoes"
        options={{
          title: 'Inspeções',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
