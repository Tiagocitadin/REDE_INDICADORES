/**
 * Identidade visual centralizada (paleta Verde-mata).
 * Mudar cores, fontes ou espaçamentos do app inteiro é mexer só neste arquivo.
 */
export const paletaClara = {
  fundo: "#F1F4F2",
  superficie: "#FFFFFF",
  superficieSuave: "#E9EFEB",
  texto: "#14231C",
  textoSuave: "#56675E",
  borda: "#D8E2DC",
  bordaForte: "#C6D3CB",
  destaque: "#1E5B45",
  destaqueTexto: "#FFFFFF",
  destaqueSuave: "#E2EEE8",
  // cartão principal do painel
  heroi: "#1E5B45",
  heroiTexto: "#FFFFFF",
  perigo: "#B42318",
  perigoSuave: "#FDECEA",
  aviso: "#6B4200",
  avisoSuave: "#FCEFD9",
  // situação no curso
  concluido: "#2A7D4F",
  concluidoSuave: "#E3F2EA",
  matriculado: "#B97E0E",
  matriculadoSuave: "#FCEFD9",
  cadastrado: "#7D8996",
  cadastradoSuave: "#EDF0F3",
};

export type Paleta = typeof paletaClara;

export const paletaEscura: Paleta = {
  fundo: "#0F1714",
  superficie: "#18221D",
  superficieSuave: "#1F2C26",
  texto: "#E6EEE9",
  textoSuave: "#9BADA3",
  borda: "#29382F",
  bordaForte: "#3A4B41",
  destaque: "#7CCBA4",
  destaqueTexto: "#0F1714",
  destaqueSuave: "#1C3A2C",
  heroi: "#1E5B45",
  heroiTexto: "#FFFFFF",
  perigo: "#F2857A",
  perigoSuave: "#3B1F1D",
  aviso: "#F2C46E",
  avisoSuave: "#3A2E14",
  concluido: "#6BD39B",
  concluidoSuave: "#183A2A",
  matriculado: "#E5B24A",
  matriculadoSuave: "#3A2E14",
  cadastrado: "#8D9AA8",
  cadastradoSuave: "#25313D",
};

export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const raio = { sm: 8, md: 12, lg: 16, xl: 20, pilula: 999 } as const;

export const fonte = {
  tamanho: {
    legenda: 12,
    pequeno: 13,
    corpo: 15,
    subtitulo: 17,
    titulo: 24,
    destaque: 44,
  },
  peso: { normal: "400", medio: "500", semi: "600", negrito: "700" },
} as const;

/** Largura a partir da qual o app usa menu lateral (tablet / computador) */
export const LARGURA_TELA_LARGA = 900;
/** Largura máxima do conteúdo em telas grandes, para não esticar demais */
export const LARGURA_MAX_CONTEUDO = 960;

/** Área mínima de toque recomendada (acessibilidade) */
export const ALVO_TOQUE = 44;
