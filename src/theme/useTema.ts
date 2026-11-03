import { useWindowDimensions } from 'react-native';

import { usePreferenciaTema } from './TemaProvider';
import { espaco, fonte, LARGURA_TELA_LARGA, LARGURA_TELA_PEQUENA, paletaClara, paletaEscura, raio } from './tokens';

/** Tema atual (claro/escuro escolhido pelo usuário) e o tamanho da tela. */
export function useTema() {
  const { escuro } = usePreferenciaTema();
  const { width, height } = useWindowDimensions();
  return {
    cores: escuro ? paletaEscura : paletaClara,
    espaco,
    raio,
    fonte,
    escuro,
    telaLarga: width >= LARGURA_TELA_LARGA,
    /** celulares estreitos (ex.: iPhone SE, Androids compactos) */
    telaPequena: width < LARGURA_TELA_PEQUENA,
    alturaTela: height,
  };
}

export type Tema = ReturnType<typeof useTema>;