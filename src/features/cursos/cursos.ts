import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { chaves } from '@/lib/chaves';
import { garantir } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import { useOrgId } from '../organizacao/OrganizacaoProvider';

export type Curso = Pick<Tables<'cursos'>, 'id' | 'nome' | 'descricao' | 'ativo'>;

export const esquemaCurso = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto.').max(120, 'Nome muito longo.'),
});

// ---------- acesso ao banco ----------
async function listarCursos(org: string): Promise<Curso[]> {
  return garantir(
    await supabase.from('cursos').select('id, nome, descricao, ativo').eq('organizacao_id', org).order('nome'),
  );
}

// ---------- hooks usados pelas telas ----------
export function useCursos() {
  const org = useOrgId();
  return useQuery({
    queryKey: chaves.cursos(org),
    queryFn: () => listarCursos(org),
    staleTime: 5 * 60_000,
  });
}

/** Mapa id → nome, para mostrar o curso sem consultas extras */
export function useNomesCursos() {
  const { data } = useCursos();
  return new Map<string, string>((data ?? []).map((c) => [c.id, c.nome]));
}

export function useCriarCurso() {
  const org = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nome: string) =>
      garantir(await supabase.from('cursos').insert({ organizacao_id: org, nome: nome.trim() }).select('id').single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.cursos(org) }),
  });
}

export function useAtualizarCurso() {
  const org = useOrgId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dados }: { id: string; nome?: string; ativo?: boolean }) =>
      garantir(await supabase.from('cursos').update(dados).eq('id', id).eq('organizacao_id', org)),
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.cursos(org) }),
  });
}
