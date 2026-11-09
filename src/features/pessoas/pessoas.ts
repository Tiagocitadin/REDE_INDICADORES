import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chaves } from '@/lib/chaves';
import { ErroApp, garantir } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import { useOrgId } from '../organizacao/OrganizacaoProvider';
import type { DadosPessoa } from './esquema';

export type Pessoa = Tables<'pessoas'>;
export type PessoaResumo = Pick<Pessoa, 'id' | 'nome' | 'status' | 'nivel' | 'curso_id' | 'excluido_em'>;

const TAMANHO_PAGINA = 30;
const CAMPOS_LISTA = 'id, nome, status, nivel, curso_id, excluido_em';

/** Escapa caracteres especiais da busca (evita injeção no filtro) */
function termoBusca(texto: string) {
  return texto.trim().replace(/[%_,()\\]/g, ' ').slice(0, 60);
}

// ---------------------------------------------------------------------
// Lista paginada com busca (carrega 30 por vez)
// ---------------------------------------------------------------------
export function useListaPessoas(busca: string, cursoId: string | null) {
  const org = useOrgId();
  const termo = termoBusca(busca);
  return useInfiniteQuery({
    queryKey: chaves.listaPessoas(org, termo, cursoId),
    initialPageParam: 0,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('pessoas')
        .select(CAMPOS_LISTA)
        .eq('organizacao_id', org)
        .is('excluido_em', null)
        .order('nome')
        .range(pageParam, pageParam + TAMANHO_PAGINA - 1);
      if (termo) q = q.ilike('nome', `%${termo}%`);
      if (cursoId) q = q.eq('curso_id', cursoId);
      return garantir(await q) as PessoaResumo[];
    },
    getNextPageParam: (ultima, todas) =>
      ultima.length < TAMANHO_PAGINA ? undefined : todas.length * TAMANHO_PAGINA,
  });
}

/** Busca rápida para o campo "Indicado por" */
export function useBuscaIndicador(busca: string) {
  const org = useOrgId();
  const termo = termoBusca(busca);
  return useQuery({
    queryKey: chaves.buscaIndicador(org, termo),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let q = supabase
        .from('pessoas')
        .select('id, nome, nivel')
        .eq('organizacao_id', org)
        .is('excluido_em', null)
        .order('nome')
        .limit(25);
      if (termo) q = q.ilike('nome', `%${termo}%`);
      return garantir(await q);
    },
  });
}

// ---------------------------------------------------------------------
// Ficha
// ---------------------------------------------------------------------
export function usePessoa(id: string | undefined) {
  const org = useOrgId();
  return useQuery({
    queryKey: chaves.pessoa(org, id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const pessoa = garantir(
        await supabase.from('pessoas').select('*').eq('organizacao_id', org).eq('id', id!).single(),
      );
      // nomes de quem está acima na árvore (para mostrar o caminho)
      let caminho: { id: string; nome: string }[] = [];
      if (pessoa.ancestrais.length) {
        const acima = garantir(
          await supabase.from('pessoas').select('id, nome').eq('organizacao_id', org).in('id', pessoa.ancestrais),
        );
        const porId = new Map(acima.map((p) => [p.id, p]));
        caminho = pessoa.ancestrais.map((a) => porId.get(a) ?? { id: a, nome: '—' });
      }
      return { pessoa, caminho };
    },
  });
}

// ---------------------------------------------------------------------
// Salvar
// ---------------------------------------------------------------------
type PessoaDuplicada = { id: string; nome: string };

/** Confere se e-mail ou telefone já existem antes de salvar */
async function procurarDuplicada(org: string, dados: DadosPessoa, ignorarId?: string): Promise<PessoaDuplicada | null> {
  const filtros: string[] = [];
  if (dados.email) filtros.push(`email.eq."${dados.email}"`);
  if (dados.telefone) filtros.push(`telefone.eq.${dados.telefone}`);
  if (!filtros.length) return null;

  let q = supabase.from('pessoas').select('id, nome').eq('organizacao_id', org).or(filtros.join(',')).limit(1);
  if (ignorarId) q = q.neq('id', ignorarId);
  const encontrados = garantir(await q);
  return encontrados[0] ?? null;
}

export class ErroDuplicada extends ErroApp {
  constructor(public readonly existente: PessoaDuplicada) {
    super(`${existente.nome} já está cadastrada com este e-mail ou telefone. Cada pessoa entra uma única vez.`, 'duplicada');
  }
}

function paraBanco(dados: DadosPessoa) {
  return {
    nome: dados.nome,
    telefone: dados.telefone || null,
    email: dados.email || null,
    descricao: dados.descricao || null,
    curso_id: dados.cursoId,
    status: dados.status,
    indicado_por_id: dados.indicadoPorId,
  };
}

function useInvalidarTudo() {
  const org = useOrgId();
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: chaves.pessoas(org) }),
      qc.invalidateQueries({ queryKey: chaves.rede(org) }),
    ]);
}

export function useCriarPessoa() {
  const org = useOrgId();
  const invalidar = useInvalidarTudo();
  return useMutation({
    mutationFn: async (dados: DadosPessoa) => {
      const dup = await procurarDuplicada(org, dados);
      if (dup) throw new ErroDuplicada(dup);
      return garantir(
        await supabase
          .from('pessoas')
          .insert({ ...paraBanco(dados), organizacao_id: org })
          .select('id')
          .single(),
      );
    },
    onSuccess: invalidar,
  });
}

export function useAtualizarPessoa(id: string) {
  const org = useOrgId();
  const invalidar = useInvalidarTudo();
  return useMutation({
    mutationFn: async (dados: DadosPessoa) => {
      const dup = await procurarDuplicada(org, dados, id);
      if (dup) throw new ErroDuplicada(dup);
      garantir(await supabase.from('pessoas').update(paraBanco(dados)).eq('organizacao_id', org).eq('id', id));
    },
    onSuccess: invalidar,
  });
}

/** LGPD: apaga os dados pessoais e mantém a posição na árvore */
export function useAnonimizarPessoa() {
  const invalidar = useInvalidarTudo();
  return useMutation({
    mutationFn: async (id: string) => garantir(await supabase.rpc('anonimizar_pessoa', { p_pessoa_id: id })),
    onSuccess: invalidar,
  });
}
