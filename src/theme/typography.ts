/**
 * Tipografia AppConforme — base Inter (carregada via expo-font no _layout root).
 * Fallback para system se a fonte não estiver disponível.
 *
 * Tamanhos seguem escala extraída dos mockups (1, 2, 4, 6 incrementos).
 */

export const fontFamily = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
} as const;

export const fontWeight = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const;

export const fontSize = {
  xs:   11,
  sm:   12,
  base: 13,
  md:   14,
  lg:   16,
  xl:   18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 26,
  '5xl': 30,
} as const;

export const lineHeight = {
  xs:   14,
  sm:   16,
  base: 18,
  md:   20,
  lg:   22,
  xl:   24,
  '2xl': 28,
  '3xl': 30,
  '4xl': 32,
  '5xl': 36,
} as const;

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  uppercase: 1,
} as const;

/** Combos prontos pra TextStyle — uso direto via `theme.text.h1`. */
export const text = {
  h1:        { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'], fontWeight: fontWeight.bold },
  h2:        { fontSize: fontSize.xl,     lineHeight: lineHeight.xl,    fontWeight: fontWeight.semibold },
  h3:        { fontSize: fontSize.lg,     lineHeight: lineHeight.lg,    fontWeight: fontWeight.semibold },
  body:      { fontSize: fontSize.md,     lineHeight: lineHeight.md,    fontWeight: fontWeight.regular },
  bodyStrong:{ fontSize: fontSize.md,     lineHeight: lineHeight.md,    fontWeight: fontWeight.semibold },
  small:     { fontSize: fontSize.base,   lineHeight: lineHeight.base,  fontWeight: fontWeight.regular },
  smallStrong:{fontSize: fontSize.base,   lineHeight: lineHeight.base,  fontWeight: fontWeight.semibold },
  caption:   { fontSize: fontSize.sm,     lineHeight: lineHeight.sm,    fontWeight: fontWeight.regular },
  meta:      { fontSize: fontSize.xs,     lineHeight: lineHeight.xs,    fontWeight: fontWeight.medium },
  overline:  { fontSize: fontSize.xs,     lineHeight: lineHeight.xs,    fontWeight: fontWeight.bold, letterSpacing: letterSpacing.uppercase, textTransform: 'uppercase' as const },
  button:    { fontSize: fontSize.lg,     lineHeight: lineHeight.lg,    fontWeight: fontWeight.semibold },
  buttonSm:  { fontSize: fontSize.md,     lineHeight: lineHeight.md,    fontWeight: fontWeight.semibold },
} as const;
