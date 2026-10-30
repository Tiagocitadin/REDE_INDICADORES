import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { garantir } from '@/lib/errors';
import { secureStorage } from '@/lib/secureStorage';
import { supabase } from '@/lib/supabase';
import type { Enums } from '@/types/database';
import { useAuth } from '../auth/AuthProvider';

export type Papel = Enums<'papel_membro'>;
export type Vinculo = { id: string; nome: string; papel: Papel };

type Contexto = {
  organizacoes: Vinculo[];
  atual: Vinculo | null;
  carregando: boolean;
  erro: unknown;
  trocar: (id: string) => void;
  podeGerenciar: boolean;
  recarregar: () => Promise<unknown>;
};

const CHAVE_ORG = 'rede_org_atual';
const OrgContexto = createContext<Contexto | null>(null);

async function buscarVinculos(usuarioId: string): Promise<Vinculo[]> {
  const membros = garantir(
    await supabase.from('membros').select('organizacao_id, papel').eq('usuario_id', usuarioId),
  );
  if (!membros.length) return [];
  const orgs = garantir(
    await supabase
      .from('organizacoes')
      .select('id, nome')
      .in(
        'id',
        membros.map((m) => m.organizacao_id),
      )
      .order('nome'),
  );
  const papelPorOrg = new Map(membros.map((m) => [m.organizacao_id, m.papel]));
  return orgs.map((o) => ({ id: o.id, nome: o.nome, papel: papelPorOrg.get(o.id) ?? 'operador' }));
}

/**
 * Organização em uso. Hoje é uma só (a sua), mas o app já está pronto
 * para várias (ex.: vender o app para outras empresas).
 */
export function OrganizacaoProvider({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  const usuarioId = sessao?.user.id;
  const qc = useQueryClient();
  const [idEscolhido, setIdEscolhido] = useState<string | null>(null);

  useEffect(() => {
    secureStorage.getItem(CHAVE_ORG).then(setIdEscolhido);
  }, []);

  const consulta = useQuery({
    queryKey: ['organizacoes', usuarioId],
    queryFn: () => buscarVinculos(usuarioId!),
    enabled: !!usuarioId,
    staleTime: 5 * 60_000,
  });

  const organizacoes = useMemo(() => consulta.data ?? [], [consulta.data]);
  const atual = organizacoes.find((o) => o.id === idEscolhido) ?? organizacoes[0] ?? null;

  const valor = useMemo<Contexto>(
    () => ({
      organizacoes,
      atual,
      carregando: !!usuarioId && consulta.isPending,
      erro: consulta.error,
      podeGerenciar: atual?.papel === 'dono' || atual?.papel === 'admin',
      trocar: (id) => {
        setIdEscolhido(id);
        secureStorage.setItem(CHAVE_ORG, id);
        qc.removeQueries({ predicate: (q) => q.queryKey[0] !== 'organizacoes' });
      },
      recarregar: () => consulta.refetch(),
    }),
    [organizacoes, atual, usuarioId, consulta, qc],
  );

  return <OrgContexto.Provider value={valor}>{children}</OrgContexto.Provider>;
}

export function useOrganizacao() {
  const ctx = useContext(OrgContexto);
  if (!ctx) throw new Error('useOrganizacao precisa estar dentro de <OrganizacaoProvider>');
  return ctx;
}

/** Id da organização atual (as telas internas só abrem com uma organização) */
export function useOrgId(): string {
  const { atual } = useOrganizacao();
  if (!atual) throw new Error('Nenhuma organização selecionada');
  return atual.id;
}

export async function criarOrganizacao(nome: string, primeiroCurso: string) {
  const orgId = garantir(await supabase.rpc('criar_organizacao', { p_nome: nome }));
  garantir(await supabase.from('cursos').insert({ organizacao_id: orgId, nome: primeiroCurso }));
  return orgId;
}
