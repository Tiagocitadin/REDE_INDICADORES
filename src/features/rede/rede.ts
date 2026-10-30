import { useQuery } from '@tanstack/react-query';

import { chaves } from '@/lib/chaves';
import { garantir } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { useOrgId } from '../organizacao/OrganizacaoProvider';

/**
 * Tudo que é cálculo da rede roda NO BANCO (funções resumo_rede,
 * ranking_rede, filhos_rede). O celular só recebe o resultado pronto.
 */
export type ResumoRede = {
  total: number;
  diretas: number;
  indiretas: number;
  cadastrados: number;
  matriculados: number;
  concluidos: number;
  por_nivel: { nivel: number; total: number }[];
};

const RESUMO_VAZIO: ResumoRede = {
  total: 0,
  diretas: 0,
  indiretas: 0,
  cadastrados: 0,
  matriculados: 0,
  concluidos: 0,
  por_nivel: [],
};

/** pessoaId nulo = sua rede inteira (topo da árvore) */
export function useResumoRede(pessoaId: string | null, cursoId: string | null = null) {
  const org = useOrgId();
  return useQuery({
    queryKey: chaves.resumo(org, pessoaId, cursoId),
    queryFn: async () => {
      const dados = garantir(
        await supabase.rpc('resumo_rede', {
          p_organizacao_id: org,
          ...(pessoaId ? { p_pessoa_id: pessoaId } : {}),
          ...(cursoId ? { p_curso_id: cursoId } : {}),
        }),
      );
      return { ...RESUMO_VAZIO, ...(dados as Partial<ResumoRede>) };
    },
  });
}

export function useRanking(cursoId: string | null, limite = 5) {
  const org = useOrgId();
  return useQuery({
    queryKey: chaves.ranking(org, cursoId),
    queryFn: async () =>
      garantir(
        await supabase.rpc('ranking_rede', {
          p_organizacao_id: org,
          p_limite: limite,
          ...(cursoId ? { p_curso_id: cursoId } : {}),
        }),
      ),
  });
}

/** Um nível da árvore por vez (carrega só quando a pessoa abre o galho) */
export function useFilhos(paiId: string | null, habilitado = true) {
  const org = useOrgId();
  return useQuery({
    queryKey: chaves.filhos(org, paiId),
    enabled: habilitado,
    queryFn: async () =>
      garantir(
        await supabase.rpc('filhos_rede', {
          p_organizacao_id: org,
          ...(paiId ? { p_pai_id: paiId } : {}),
        }),
      ),
  });
}

export type NoArvore = NonNullable<ReturnType<typeof useFilhos>['data']>[number];
