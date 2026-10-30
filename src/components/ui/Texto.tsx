import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTema } from '@/theme/useTema';

type Variante = 'titulo' | 'subtitulo' | 'corpo' | 'pequeno' | 'legenda' | 'rotulo' | 'destaque';

type Props = TextProps & {
  variante?: Variante;
  suave?: boolean;
  cor?: string;
  negrito?: boolean;
  centro?: boolean;
};

export function Texto({ variante = 'corpo', suave, cor, negrito, centro, style, ...resto }: Props) {
  const { cores, fonte } = useTema();

  const base: Record<Variante, TextStyle> = {
    destaque: { fontSize: fonte.tamanho.destaque, fontWeight: fonte.peso.negrito, lineHeight: 48, letterSpacing: -0.5 },
    titulo: { fontSize: fonte.tamanho.titulo, fontWeight: fonte.peso.negrito, letterSpacing: -0.3 },
    subtitulo: { fontSize: fonte.tamanho.subtitulo, fontWeight: fonte.peso.semi },
    corpo: { fontSize: fonte.tamanho.corpo, lineHeight: 22 },
    pequeno: { fontSize: fonte.tamanho.pequeno, lineHeight: 18 },
    legenda: { fontSize: fonte.tamanho.legenda, lineHeight: 16 },
    rotulo: {
      fontSize: fonte.tamanho.legenda,
      fontWeight: fonte.peso.negrito,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
  };

  return (
    <Text
      style={[
        base[variante],
        { color: cor ?? (suave || variante === 'rotulo' ? cores.textoSuave : cores.texto) },
        negrito && { fontWeight: fonte.peso.negrito },
        centro && { textAlign: 'center' },
        style,
      ]}
      {...resto}
    />
  );
}
