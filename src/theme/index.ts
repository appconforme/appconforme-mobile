export { raw, semantic, type ColorToken } from './colors';
export { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, text } from './typography';
export { spacing, type SpacingToken } from './spacing';
export { radius } from './radius';
export { shadow } from './shadow';
export { isShowcase, setShowcaseRuntime, sc } from './showcase';

import { raw, semantic } from './colors';
import { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, text } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadow } from './shadow';

/** Theme único — useThemeValues hook não é necessário; importar direto. */
export const theme = {
  raw,
  color: semantic,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  text,
  spacing,
  radius,
  shadow,
} as const;
