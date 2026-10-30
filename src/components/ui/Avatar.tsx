import { View } from 'react-native';

import { iniciais } from '@/lib/format';
import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

export function Avatar({ nome, tamanho = 36, forte }: { nome: string; tamanho?: number; forte?: boolean }) {
  const { cores } = useTema();
  return (
    <View
      accessible={false}
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        backgroundColor: forte ? cores.destaque : cores.destaqueSuave,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Texto
        negrito
        cor={forte ? cores.destaqueTexto : cores.destaque}
        style={{ fontSize: Math.round(tamanho * 0.36) }}
      >
        {iniciais(nome) || '?'}
      </Texto>
    </View>
  );
}
