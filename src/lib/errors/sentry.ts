import * as Sentry from '@sentry/react-native';

/**
 * Inicializa o Sentry. Chamado uma única vez no topo do _layout.tsx.
 *
 * DSN e ambiente vêm de variáveis EXPO_PUBLIC_* injetadas pelo EAS.
 * Em dev sem DSN setado, o init é no-op (Sentry ignora chamadas).
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // Sem DSN, não inicializa — evita ruído em dev local.
    return;
  }
  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
    debug: false,
    tracesSampleRate: 0.2,
  });
}

/**
 * Captura um erro com contexto opcional.
 * Use em catch blocks de operações críticas (sync, upload, submit).
 */
export function captureError(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(err);
    });
    return;
  }
  Sentry.captureException(err);
}

/**
 * Associa o usuário atual ao Sentry. Chamar após login/refresh do /me.
 */
export function setSentryUser(user: { id: string; email?: string }): void {
  Sentry.setUser({ id: user.id, email: user.email });
}

/**
 * Limpa o usuário do Sentry. Chamar no logout.
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}
