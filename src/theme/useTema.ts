import { useWindowDimensions } from 'react-native';

import { usePreferenciaTema } from './TemaProvider';
import { espaco, fonte, LARGURA_TELA_LARGA, paletaClara, paletaEscura, raio } from './tokens';

/** Tema atual (claro/escuro escolhido pelo usuário) e se a tela é larga. */
export function useTema() {
  const { escuro } = usePreferenciaTema();
  const { width } = useWindowDimensions();
  return {
    cores: escuro ? paletaEscura : paletaClara,
    espaco,
    raio,
    fonte,
    escuro,
    telaLarga: width >= LARGURA_TELA_LARGA,
  };
}

export type Tema = ReturnType<typeof useTema>;