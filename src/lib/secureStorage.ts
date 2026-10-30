import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Armazenamento da sessão de login.
 *
 * - Celular: Keychain (iPhone) / Keystore (Android) via expo-secure-store.
 *   O SecureStore aceita ~2 KB por item e a sessão do Supabase pode passar
 *   disso, então o valor é dividido em pedaços.
 * - Web: localStorage (padrão dos navegadores para apps web).
 */
const TAMANHO_PEDACO = 1800;
const chaveQtd = (chave: string) => `${chave}__qtd`;
const chavePedaco = (chave: string, i: number) => `${chave}__${i}`;

// SecureStore só aceita letras, números, ".", "-" e "_"
const limpar = (chave: string) => chave.replace(/[^A-Za-z0-9._-]/g, '_');

const nativo = {
  async getItem(chaveOriginal: string): Promise<string | null> {
    const chave = limpar(chaveOriginal);
    const qtd = Number(await SecureStore.getItemAsync(chaveQtd(chave)));
    if (!qtd) return null;
    const partes: string[] = [];
    for (let i = 0; i < qtd; i++) {
      const parte = await SecureStore.getItemAsync(chavePedaco(chave, i));
      if (parte == null) return null;
      partes.push(parte);
    }
    return partes.join('');
  },

  async setItem(chaveOriginal: string, valor: string): Promise<void> {
    const chave = limpar(chaveOriginal);
    await nativo.removeItem(chaveOriginal);
    const qtd = Math.ceil(valor.length / TAMANHO_PEDACO);
    for (let i = 0; i < qtd; i++) {
      await SecureStore.setItemAsync(
        chavePedaco(chave, i),
        valor.slice(i * TAMANHO_PEDACO, (i + 1) * TAMANHO_PEDACO),
      );
    }
    await SecureStore.setItemAsync(chaveQtd(chave), String(qtd));
  },

  async removeItem(chaveOriginal: string): Promise<void> {
    const chave = limpar(chaveOriginal);
    const qtd = Number(await SecureStore.getItemAsync(chaveQtd(chave)));
    for (let i = 0; i < qtd; i++) {
      await SecureStore.deleteItemAsync(chavePedaco(chave, i));
    }
    await SecureStore.deleteItemAsync(chaveQtd(chave));
  },
};

const web = {
  async getItem(chave: string) {
    try {
      return globalThis.localStorage?.getItem(chave) ?? null;
    } catch {
      return null;
    }
  },
  async setItem(chave: string, valor: string) {
    try {
      globalThis.localStorage?.setItem(chave, valor);
    } catch {
      // navegação privada ou armazenamento bloqueado: a sessão dura só esta aba
    }
  },
  async removeItem(chave: string) {
    try {
      globalThis.localStorage?.removeItem(chave);
    } catch {
      // ignorado
    }
  },
};

export const secureStorage = Platform.OS === 'web' ? web : nativo;
