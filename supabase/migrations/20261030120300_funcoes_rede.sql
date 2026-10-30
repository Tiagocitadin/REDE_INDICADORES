-- =====================================================================
-- Funções chamadas pelo app (RPC).
-- As de leitura rodam como o próprio usuário (security invoker),
-- então o RLS continua valendo: ninguém lê dados de outra organização.
-- =====================================================================

-- Cria uma organização e torna quem criou o dono dela
create or replace function public.criar_organizacao(p_nome text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_id uuid;
begin
  if v_usuario is null then
    raise exception 'É preciso entrar na conta' using errcode = '42501';
  end if;

  if (select count(*) from public.membros m where m.usuario_id = v_usuario and m.papel = 'dono') >= 5 then
    raise exception 'Limite de organizações atingido' using errcode = '54000';
  end if;

  insert into public.organizacoes (nome) values (btrim(p_nome)) returning id into v_id;
  insert into public.membros (organizacao_id, usuario_id, papel) values (v_id, v_usuario, 'dono');
  return v_id;
end;
$$;

-- Resumo da rede: do topo (p_pessoa_id nulo) ou de uma pessoa.
-- Diretas = um nível abaixo; indiretas = dois ou mais níveis abaixo.
create or replace function public.resumo_rede(
  p_organizacao_id uuid,
  p_pessoa_id uuid default null,
  p_curso_id uuid default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with origem as (
    select coalesce(
      (select p.nivel from public.pessoas p
        where p.id = p_pessoa_id and p.organizacao_id = p_organizacao_id),
      0
    ) as nivel
  ),
  rede as (
    select p.status, p.nivel - (select nivel from origem) as nivel_relativo
      from public.pessoas p
     where p.organizacao_id = p_organizacao_id
       and p.excluido_em is null
       and (p_curso_id is null or p.curso_id = p_curso_id)
       and (p_pessoa_id is null or p.ancestrais @> array[p_pessoa_id])
  ),
  niveis as (
    select nivel_relativo, count(*) as total
      from rede
     group by nivel_relativo
  )
  select jsonb_build_object(
    'total',       (select count(*) from rede),
    'diretas',     (select count(*) from rede where nivel_relativo = 1),
    'indiretas',   (select count(*) from rede where nivel_relativo > 1),
    'cadastrados', (select count(*) from rede where status = 'cadastrado'),
    'matriculados',(select count(*) from rede where status = 'matriculado'),
    'concluidos',  (select count(*) from rede where status = 'concluido'),
    'por_nivel',   coalesce(
                     (select jsonb_agg(jsonb_build_object('nivel', nivel_relativo, 'total', total)
                                       order by nivel_relativo)
                        from niveis),
                     '[]'::jsonb)
  );
$$;

-- Quem mais trouxe gente para a rede (para o ranking)
create or replace function public.ranking_rede(
  p_organizacao_id uuid,
  p_curso_id uuid default null,
  p_limite int default 10
)
returns table (
  pessoa_id   uuid,
  nome        text,
  diretas     bigint,
  total_rede  bigint,
  concluidos  bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id,
         p.nome,
         count(*) filter (where d.indicado_por_id = p.id),
         count(*),
         count(*) filter (where d.status = 'concluido')
    from public.pessoas p
    join public.pessoas d
      on d.organizacao_id = p.organizacao_id
     and d.ancestrais @> array[p.id]
     and d.excluido_em is null
     and (p_curso_id is null or d.curso_id = p_curso_id)
   where p.organizacao_id = p_organizacao_id
     and p.excluido_em is null
   group by p.id, p.nome
   order by 5 desc, 4 desc, p.nome
   limit least(greatest(coalesce(p_limite, 10), 1), 100);
$$;

-- Um nível da árvore por vez (carregamento sob demanda).
-- p_pai_id nulo = indicações diretas do topo.
create or replace function public.filhos_rede(
  p_organizacao_id uuid,
  p_pai_id uuid default null
)
returns table (
  id          uuid,
  nome        text,
  status      public.status_curso,
  curso_id    uuid,
  curso_nome  text,
  nivel       smallint,
  excluido    boolean,
  diretas     bigint,
  total_rede  bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select p.id,
         p.nome,
         p.status,
         p.curso_id,
         c.nome,
         p.nivel,
         p.excluido_em is not null,
         (select count(*) from public.pessoas f
           where f.organizacao_id = p.organizacao_id
             and f.indicado_por_id = p.id
             and f.excluido_em is null),
         (select count(*) from public.pessoas d
           where d.organizacao_id = p.organizacao_id
             and d.ancestrais @> array[p.id]
             and d.excluido_em is null)
    from public.pessoas p
    join public.cursos c on c.id = p.curso_id
   where p.organizacao_id = p_organizacao_id
     and p.indicado_por_id is not distinct from p_pai_id
   order by p.criado_em;
$$;

-- LGPD: apaga os dados pessoais mas mantém a posição na árvore,
-- para não quebrar a rede de quem veio depois.
create or replace function public.anonimizar_pessoa(p_pessoa_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select organizacao_id into v_org from public.pessoas where id = p_pessoa_id;
  if v_org is null or not private.tem_papel(v_org, '{dono,admin}') then
    raise exception 'Sem permissão para remover os dados desta pessoa' using errcode = '42501';
  end if;

  update public.pessoas
     set nome = 'Pessoa removida',
         telefone = null,
         email = null,
         descricao = null,
         consentimento_em = null,
         excluido_em = now()
   where id = p_pessoa_id;
end;
$$;

-- Permissões: só usuários logados executam
revoke all on function public.criar_organizacao(text) from public, anon;
revoke all on function public.resumo_rede(uuid, uuid, uuid) from public, anon;
revoke all on function public.ranking_rede(uuid, uuid, int) from public, anon;
revoke all on function public.filhos_rede(uuid, uuid) from public, anon;
revoke all on function public.anonimizar_pessoa(uuid) from public, anon;

grant execute on function public.criar_organizacao(text) to authenticated;
grant execute on function public.resumo_rede(uuid, uuid, uuid) to authenticated;
grant execute on function public.ranking_rede(uuid, uuid, int) to authenticated;
grant execute on function public.filhos_rede(uuid, uuid) to authenticated;
grant execute on function public.anonimizar_pessoa(uuid) to authenticated;

-- Funções internas dos gatilhos não ficam executáveis por ninguém de fora
revoke all on function private.definir_atualizado_em() from public;
revoke all on function private.pessoas_normalizar() from public;
revoke all on function private.pessoas_definir_arvore() from public;
revoke all on function private.pessoas_propagar_arvore() from public;
revoke all on function private.registrar_auditoria() from public;
