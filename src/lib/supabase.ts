import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database';
import { env } from './env';
import { secureStorage } from './secureStorage';

/**
 * Conexão única com o Supabase para o app inteiro.
 * Usa apenas a chave PÚBLICA: quem protege os dados é o RLS no banco.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// No celular, só renova o token com o app aberto (economiza bateria e rede).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
