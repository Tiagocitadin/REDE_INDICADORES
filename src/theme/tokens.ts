/**
 * Identidade visual centralizada (paleta Cobre, a partir do logo).
 * Mudar cores, fontes ou espaçamentos do app inteiro é mexer só neste arquivo.
 */
export const paletaClara = {
  fundo: "#F7F3EF",
  superficie: "#FFFFFF",
  superficieSuave: "#F2EBE4",
  texto: "#2A1A0F",
  textoSuave: "#6E5A4B",
  borda: "#E8DDD3",
  bordaForte: "#D9C9BB",
  destaque: "#B85A16",
  destaqueTexto: "#FFFFFF",
  destaqueSuave: "#FBEADB",
  // cartão principal do painel
  heroi: "#A84F12",
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
  fundo: "#17110D",
  superficie: "#211913",
  superficieSuave: "#2B2119",
  texto: "#F2E9E1",
  textoSuave: "#B5A496",
  borda: "#3A2D23",
  bordaForte: "#4C3B2E",
  destaque: "#F0954A",
  destaqueTexto: "#17110D",
  destaqueSuave: "#3D2615",
  heroi: "#A84F12",
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
/** Abaixo desta largura o app aperta margens e espaços */
export const LARGURA_TELA_PEQUENA = 380;
/** Largura máxima do conteúdo em telas grandes, para não esticar demais */
export const LARGURA_MAX_CONTEUDO = 960;

/** Área mínima de toque recomendada (acessibilidade) */
export const ALVO_TOQUE = 44;
