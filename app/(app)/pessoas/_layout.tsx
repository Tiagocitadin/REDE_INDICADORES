import { Stack } from 'expo-router';

import { useTema } from '@/theme/useTema';

export default function PessoasLayout() {
  const { cores } = useTema();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    />
  );
}
