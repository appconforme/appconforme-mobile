/**
 * Showcase Mode — replica os textos/números literais dos mockups Figma
 * (João Silva, 85%, 12 dias consecutivos, etc.), independente do estado real.
 *
 * Ativação:
 * - via env: `EXPO_PUBLIC_SHOWCASE=true` (build/run time)
 * - via runtime: `setShowcaseRuntime(true)` (útil em dev para alternar)
 *
 * Em produção fica desligado por padrão. NUNCA usar SHOWCASE para mascarar
 * estados reais — só para reapresentar telas como no design original.
 */

let runtimeFlag: boolean | null = null;

function envFlag(): boolean {
  const v = process.env.EXPO_PUBLIC_SHOWCASE;
  return v === 'true' || v === '1';
}

export function isShowcase(): boolean {
  if (runtimeFlag !== null) return runtimeFlag;
  return envFlag();
}

export function setShowcaseRuntime(on: boolean | null): void {
  runtimeFlag = on;
}

/** Helper: retorna `mock` se showcase ligado, senão `real`. */
export function sc<T>(mock: T, real: T): T {
  return isShowcase() ? mock : real;
}
