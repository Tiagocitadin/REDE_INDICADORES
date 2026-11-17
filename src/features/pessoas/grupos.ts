import { useInfiniteQuery } from '@tanstack/react-query';

import { garantir } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { StatusCurso } from '@/theme/status';
import { useOrgId } from '../organizacao/OrganizacaoProvider';

/**
 * Grupos de pessoas abertos pelos cards do Painel ("Meu impacto no Elos").
 * Cada grupo usa o mesmo critério do número mostrado no card,
 * então a lista sempre bate com a contagem.
 */
export const GRUPOS = {
  vidas: {
    titulo: 'Vidas resgatadas',
    descricao: 'Pessoas que fizeram o treinamento',
    vazio: 'Ninguém concluiu o treinamento ainda.',
  },
  apresentacoes: {
    titulo: 'Apresentações',
    descricao: 'Pessoas que participaram da apresentação',
    vazio: 'Ninguém participou da apresentação ainda.',
  },
  contatos: {
    titulo: 'Contatos',
    descricao: 'Pessoas que vamos entrar em contato',
    vazio: 'Nenhum contato pendente. Todos já avançaram.',
  },
  diretas: {
    titulo: 'Indicações diretas',
    descricao: 'Pessoas que eu indiquei',
    vazio: 'Você ainda não indicou ninguém diretamente.',
  },
  indiretas: {
    titulo: 'Indicações indiretas',
    descricao: 'Pessoas que vieram pelos meus indicados',
    vazio: 'Seus indicados ainda não trouxeram ninguém.',
  },
} as const;

export type TipoGrupo = keyof typeof GRUPOS;

export function ehTipoGrupo(valor: unknown): valor is TipoGrupo {
  return typeof valor === 'string' && valor in GRUPOS;
}

export type PessoaDoGrupo = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: StatusCurso;
  nivel: number;
  curso_id: string;
  criado_em: string;
  indicado_por_id: string | null;
  /** nome de quem indicou (preenchido numa segunda consulta) */
  nomeIndicador: string | null;
};

const TAMANHO_PAGINA = 30;

const CAMPOS = 'id, nome, telefone, email, status, nivel, curso_id, criado_em, indicado_por_id';

/** Lista paginada (30 por vez) das pessoas de um grupo, com filtro opcional de curso */
export function useGrupoPessoas(tipo: TipoGrupo, cursoId: string | null) {
  const org = useOrgId();
  return useInfiniteQuery({
    // começa com ['pessoas', org]: salvar uma pessoa já atualiza estas listas
    queryKey: ['pessoas', org, 'grupo', tipo, cursoId] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('pessoas')
        .select(CAMPOS)
        .eq('organizacao_id', org)
        .is('excluido_em', null)
        .range(pageParam, pageParam + TAMANHO_PAGINA - 1);

      switch (tipo) {
        case 'vidas':
          q = q.eq('status', 'concluido').order('nome');
          break;
        case 'apresentacoes':
          q = q.eq('status', 'matriculado').order('nome');
          break;
        case 'contatos':
          // mais antigos primeiro: quem está esperando há mais tempo aparece no topo
          q = q.eq('status', 'cadastrado').order('criado_em', { ascending: true });
          break;
        case 'diretas':
          q = q.eq('nivel', 1).order('nome');
          break;
        case 'indiretas':
          q = q.gt('nivel', 1).order('nivel').order('nome');
          break;
      }
      if (cursoId) q = q.eq('curso_id', cursoId);

      const pessoas = garantir(await q);

      // nomes de quem indicou, numa única consulta para a página toda
      const idsIndicadores = [...new Set(pessoas.map((p) => p.indicado_por_id).filter((id): id is string => !!id))];
      const nomes = new Map<string, string>();
      if (idsIndicadores.length) {
        const indicadores = garantir(
          await supabase.from('pessoas').select('id, nome').eq('organizacao_id', org).in('id', idsIndicadores),
        );
        indicadores.forEach((i) => nomes.set(i.id, i.nome));
      }

      return pessoas.map<PessoaDoGrupo>((p) => ({
        ...p,
        nomeIndicador: p.indicado_por_id ? (nomes.get(p.indicado_por_id) ?? null) : null,
      }));
    },
    getNextPageParam: (ultima, todas) =>
      ultima.length < TAMANHO_PAGINA ? undefined : todas.length * TAMANHO_PAGINA,
  });
}
