/**
 * Wrapper sobre lucide-react-native que respeita os tokens semânticos.
 * Use sempre que precisar de ícone (não importe lucide-react-native direto
 * em telas — passe pelo `Icon` para garantir cor/tamanho consistentes).
 */
import { type ComponentType } from 'react';
import { type SvgProps } from 'react-native-svg';
import * as Lucide from 'lucide-react-native';
import { theme } from '@/theme';

type LucideIcon = ComponentType<SvgProps & { size?: number; color?: string; strokeWidth?: number }>;

export type IconName = keyof typeof Lucide;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = theme.color.text, strokeWidth = 1.8 }: Props) {
  const Component = (Lucide as unknown as Record<string, LucideIcon>)[name as string];
  if (!Component) return null;
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}
