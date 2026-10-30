/**
 * Chaves do cache em um lugar só. Assim, ao salvar uma pessoa,
 * sabemos exatamente o que atualizar (rede, listas, ficha).
 */
export const chaves = {
  cursos: (org: string) => ['cursos', org] as const,
  pessoas: (org: string) => ['pessoas', org] as const,
  listaPessoas: (org: string, busca: string, cursoId: string | null) => ['pessoas', org, 'lista', busca, cursoId] as const,
  buscaIndicador: (org: string, busca: string) => ['pessoas', org, 'busca-indicador', busca] as const,
  pessoa: (org: string, id: string) => ['pessoas', org, 'ficha', id] as const,
  rede: (org: string) => ['rede', org] as const,
  resumo: (org: string, pessoaId: string | null, cursoId: string | null) => ['rede', org, 'resumo', pessoaId, cursoId] as const,
  ranking: (org: string, cursoId: string | null) => ['rede', org, 'ranking', cursoId] as const,
  filhos: (org: string, paiId: string | null) => ['rede', org, 'filhos', paiId] as const,
};
