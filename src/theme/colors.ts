/**
 * Paleta AppConforme — extraída pixel-by-pixel dos mockups em
 * `design/appconforme-mobile/`. Tons semânticos referenciam os crus.
 *
 * Hierarquia:
 * - `raw`: paleta crua (não usar direto em estilos de tela; preferir os semânticos)
 * - `semantic`: tons nomeados por intenção (bg, fg, primary, accent, status…)
 */

export const raw = {
  // Azul AppConforme (marca + ações primárias)
  blue50:  '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  blue600: '#2563eb', // CTA padrão
  blue700: '#1d4ed8', // logo, hover/pressed
  blue800: '#1e40af',
  blue900: '#1e3a8a',

  // Cinzas (slate)
  slate25:  '#fafbfc',
  slate50:  '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',

  // Verde (sucesso / conforme / concluído)
  green50:  '#dcfce7',
  green100: '#bbf7d0',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  green800: '#166534',

  // Amarelo (pendente / em andamento / atenção)
  amber50:  '#fef3c7',
  amber100: '#fde68a',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber700: '#b45309',
  amber800: '#92400e',

  // Laranja (atrasada / média)
  orange50:  '#ffedd5',
  orange500: '#f97316',
  orange600: '#ea580c',
  orange700: '#c2410c',

  // Vermelho (não-conforme / erro / crítica)
  red50:  '#fee2e2',
  red100: '#fecaca',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',
  red800: '#991b1b',

  // Roxo (KPIs informativos secundários — usado em "Ações em andamento")
  purple50:  '#f3e8ff',
  purple500: '#a855f7',
  purple600: '#9333ea',
  purple700: '#7e22ce',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const semantic = {
  // Superfícies
  bg:            raw.slate50,  // fundo geral da tela
  bgSubtle:      raw.slate100, // bandas separadoras / inputs
  surface:       raw.white,    // cards, sheets
  surfaceMuted:  raw.slate25,  // áreas internas dentro de card
  border:        raw.slate200,
  borderMuted:   raw.slate100,
  borderStrong:  raw.slate300,
  divider:       raw.slate100,

  // Texto
  text:          raw.slate900, // títulos
  textBody:      raw.slate700, // parágrafos
  textMuted:     raw.slate500, // metadados
  textSubtle:    raw.slate400, // placeholders, contadores
  textOnPrimary: raw.white,
  textInverse:   raw.white,
  textBrand:     raw.blue700,

  // Marca / ações
  primary:       raw.blue600,
  primaryHover:  raw.blue700,
  primarySoft:   raw.blue50,
  primaryRing:   raw.blue200,

  // Foco/links
  link:          raw.blue700,

  // Status / tons
  successFg:   raw.green700,
  successBg:   raw.green50,
  warningFg:   raw.amber800,
  warningBg:   raw.amber50,
  dangerFg:    raw.red700,
  dangerBg:    raw.red50,
  infoFg:      raw.blue700,
  infoBg:      raw.blue50,
  neutralFg:   raw.slate600,
  neutralBg:   raw.slate100,
  accentFg:    raw.purple700,
  accentBg:    raw.purple50,
  orangeFg:    raw.orange700,
  orangeBg:    raw.orange50,

  // Special
  transparent: raw.transparent,
} as const;

/** Atalho para tipar props de componente que aceita cor da paleta. */
export type ColorToken =
  | keyof typeof semantic
  | `raw.${keyof typeof raw}`;
