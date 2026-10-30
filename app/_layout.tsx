import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { OrganizacaoProvider } from '@/features/organizacao/OrganizacaoProvider';
import { queryClient } from '@/lib/queryClient';
import { TemaProvider } from '@/theme/TemaProvider';
import { useTema } from '@/theme/useTema';

function BarraStatus() {
  const { escuro } = useTema();
  return <StatusBar style={escuro ? 'light' : 'dark'} />;
}

export default function RaizLayout() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OrganizacaoProvider>
              <BarraStatus />
              <Stack screenOptions={{ headerShown: false }} />
            </OrganizacaoProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}