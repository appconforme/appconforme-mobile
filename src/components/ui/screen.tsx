/**
 * Container padrão de tela com SafeArea + status bar config.
 * Use sempre que criar uma rota nova.
 */
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '@/theme';

interface Props {
  children: React.ReactNode;
  bg?: 'app' | 'surface' | 'brand';
  edges?: ReadonlyArray<Edge>;
  style?: StyleProp<ViewStyle>;
}

const BG_MAP = {
  app:     theme.color.bg,
  surface: theme.color.surface,
  brand:   theme.color.primary,
} as const;

export function Screen({ children, bg = 'app', edges, style }: Props) {
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: BG_MAP[bg] }]}
      edges={edges}
    >
      <View style={[styles.body, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1 },
});
