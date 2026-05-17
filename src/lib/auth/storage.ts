import * as SecureStore from 'expo-secure-store';

/**
 * Wrapper sobre expo-secure-store pra centralizar chaves + lidar com
 * a interface assíncrona. Tokens NUNCA podem ir pra AsyncStorage
 * (sem proteção do Keychain/Keystore).
 */
const KEYS = {
  ACCESS: 'appconforme.access_token',
  REFRESH: 'appconforme.refresh_token',
  USER: 'appconforme.user',
  ACTIVE_COMPANY: 'appconforme.active_company_id',
} as const;

export const authStorage = {
  async getAccess(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS);
  },
  async setAccess(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS, token);
  },
  async getRefresh(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH);
  },
  async setRefresh(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH, token);
  },
  async getUser(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.USER);
  },
  async setUser(json: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER, json);
  },
  async getActiveCompany(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACTIVE_COMPANY);
  },
  async setActiveCompany(id: string | null): Promise<void> {
    if (id === null) {
      await SecureStore.deleteItemAsync(KEYS.ACTIVE_COMPANY);
    } else {
      await SecureStore.setItemAsync(KEYS.ACTIVE_COMPANY, id);
    }
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS),
      SecureStore.deleteItemAsync(KEYS.REFRESH),
      SecureStore.deleteItemAsync(KEYS.USER),
      SecureStore.deleteItemAsync(KEYS.ACTIVE_COMPANY),
    ]);
  },
};
