import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

/**
 * Cache dos dados. Evita buscar a mesma coisa várias vezes
 * e mantém o app rápido mesmo com internet lenta.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // dados valem 1 minuto antes de buscar de novo
      gcTime: 10 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// No celular, "voltar para o app" conta como foco (atualiza os dados)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    focusManager.setFocused(estado === 'active');
  });
}
