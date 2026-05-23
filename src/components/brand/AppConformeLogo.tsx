import Svg, { Path, G } from 'react-native-svg';
import { View, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { theme } from '@/theme';

interface Props {
  size?: number;          // altura do logo
  variant?: 'horizontal' | 'mark' | 'wordmark';
  color?: string;         // override de cor (padrão: azul AppConforme)
  style?: StyleProp<ViewStyle>;
}

/**
 * Logo AppConforme — pixel-fiel ao PSD em `design/Logo/`.
 * Composto por:
 * - clipboard com 3 linhas + base recortada
 * - shield com checkmark sobreposto
 * - wordmark "AppConforme" (Inter Bold)
 */
export function AppConformeLogo({
  size = 28,
  variant = 'horizontal',
  color = theme.color.primaryHover, // blue700 (mais saturado, igual logo PSD)
  style,
}: Props) {
  const showText = variant !== 'mark';
  const showMark = variant !== 'wordmark';
  const fontSize = size * 0.92;

  return (
    <View
      style={[
        styles.row,
        { gap: size * 0.35 },
        style,
      ]}
    >
      {showMark ? <ClipboardShieldMark size={size} color={color} /> : null}
      {showText ? (
        <Text style={[styles.wordmark, { fontSize, color, lineHeight: size }]}>
          <Text style={{ fontFamily: theme.fontFamily.regular }}>App</Text>
          <Text style={{ fontFamily: theme.fontFamily.bold }}>Conforme</Text>
        </Text>
      ) : null}
    </View>
  );
}

function ClipboardShieldMark({ size, color }: { size: number; color: string }) {
  // Viewbox 128x128 desenhada à mão pra bater com PSD horizontal.
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128">
      <G>
        {/* clipboard top tab */}
        <Path
          fill={color}
          d="M52 8h24a6 6 0 0 1 6 6v8H46v-8a6 6 0 0 1 6-6Z"
        />
        {/* clipboard body */}
        <Path
          fill={color}
          d="M34 18h12v6a6 6 0 0 0 6 6h24a6 6 0 0 0 6-6v-6h12a10 10 0 0 1 10 10v76a10 10 0 0 1-10 10H64.5a40 40 0 0 1-6-21h7a16 16 0 0 1 14-16v-1.5l11-6.5-11-6.5V70a16 16 0 0 1-15.5-12H34a10 10 0 0 1-10-10V28a10 10 0 0 1 10-10Z"
        />
        {/* clipboard lines (white) */}
        <Path
          fill="#ffffff"
          d="M44 46h32a3 3 0 1 1 0 6H44a3 3 0 1 1 0-6Zm0 14h40a3 3 0 1 1 0 6H44a3 3 0 1 1 0-6Zm0 14h26a3 3 0 1 1 0 6H44a3 3 0 1 1 0-6Z"
        />
        {/* shield */}
        <Path
          fill={color}
          d="M92 64c-12 0-22 4-26 6v22c0 14 11 26 26 30 15-4 26-16 26-30V70c-4-2-14-6-26-6Z"
        />
        {/* checkmark inside shield (white) */}
        <Path
          fill="#ffffff"
          d="m82 86 7 7 17-17 4 4-21 21-11-11 4-4Z"
        />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    includeFontPadding: false as unknown as undefined,
    letterSpacing: -0.4,
  },
});
