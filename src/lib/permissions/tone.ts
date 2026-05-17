/**
 * Tone semântico compartilhado pelos badges de status de todos os módulos
 * (tarefas, inspeções, e o que vier). Mantido fora de `tasks/helpers` pra
 * evitar acoplamento entre módulos de domínio que precisem do mesmo Tone.
 */
export type Tone =
  | 'conform'
  | 'pending'
  | 'neutral'
  | 'non-conform'
  | 'primary';

/** Cores RN por tone — coerentes com a paleta do app. */
export const TONE_COLORS: Record<Tone, { bg: string; fg: string }> = {
  conform: { bg: '#dcfce7', fg: '#15803d' }, // verde
  pending: { bg: '#fef3c7', fg: '#b45309' }, // âmbar
  neutral: { bg: '#f1f5f9', fg: '#475569' }, // cinza
  'non-conform': { bg: '#fee2e2', fg: '#991b1b' }, // vermelho
  primary: { bg: '#dbeafe', fg: '#1d4ed8' }, // azul
};
