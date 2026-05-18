import * as Crypto from 'expo-crypto';
// expo-file-system v19 (SDK 54) tem nova API baseada em classes. A API
// legacy (readAsStringAsync / EncodingType / uploadAsync) ficou disponível
// em `expo-file-system/legacy`. Mantemos a legacy aqui — a migração para
// a nova é tema próprio e não bloqueia o MVP.
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Calcula um hash SHA-256 a partir da URI de um asset local (`file://...`).
 *
 * ⚠️ Dívida técnica conhecida (MVP mobile):
 * O `expo-crypto` em RN não expõe digest binário; só `digestStringAsync`
 * que opera sobre uma string. Para evitar carregar o arquivo binário em
 * memória de outra forma, lemos como base64 via `FileSystem.readAsStringAsync`
 * e fazemos digest da string base64. Isso significa que o hash NÃO é o
 * mesmo SHA-256 do blob binário que o web calcula (que usa `crypto.subtle`
 * sobre o ArrayBuffer). Mantemos o campo só pra rastreabilidade / dedup
 * client-side dentro do próprio mobile — o backend persiste sem verificar
 * contra o blob, então não há conflito funcional.
 *
 * Quando o backend passar a validar `contentHash` contra o blob, esta
 * função deve ser substituída por algo equivalente ao web (provavelmente
 * via `expo-modules-core` digest binário ou um módulo nativo).
 */
export async function sha256Hex(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
}
