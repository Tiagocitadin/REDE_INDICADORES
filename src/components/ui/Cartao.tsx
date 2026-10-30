import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

type Props = {
  titulo?: string;
  children: ReactNode;
  style?: ViewStyle;
};

export function Cartao({ titulo, children, style }: Props) {
  const { cores, raio, espaco } = useTema();
  return (
    <View
      style={[
        { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
        style,
      ]}
    >
      {titulo ? <Texto variante="rotulo">{titulo}</Texto> : null}
      {children}
    </View>
  );
}
