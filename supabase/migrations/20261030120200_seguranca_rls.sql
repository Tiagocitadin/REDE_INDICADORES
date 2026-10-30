-- =====================================================================
-- Segurança: Row Level Security (RLS) e permissões.
-- Regra de ouro: o banco decide quem vê o quê, não o app.
-- Visitantes sem login (anon) não acessam nada.
-- =====================================================================

-- Funções auxiliares usadas pelas regras (rodam com privilégio próprio
-- para consultar "membros" sem recursão de RLS)
create or replace function private.e_membro(p_organizacao_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.membros m
     where m.organizacao_id = p_organizacao_id
       and m.usuario_id = (select auth.uid())
  );
$$;

create or replace function private.tem_papel(p_organizacao_id uuid, p_papeis public.papel_membro[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.membros m
     where m.organizacao_id = p_organizacao_id
       and m.usuario_id = (select auth.uid())
       and m.papel = any (p_papeis)
  );
$$;

revoke all on function private.e_membro(uuid) from public;
revoke all on function private.tem_papel(uuid, public.papel_membro[]) from public;
grant execute on function private.e_membro(uuid) to authenticated;
grant execute on function private.tem_papel(uuid, public.papel_membro[]) to authenticated;

-- ---------------------------------------------------------------------
-- Liga o RLS em todas as tabelas
-- ---------------------------------------------------------------------
alter table public.organizacoes enable row level security;
alter table public.membros      enable row level security;
alter table public.cursos       enable row level security;
alter table public.pessoas      enable row level security;
alter table public.auditoria    enable row level security;

-- Ninguém sem login acessa as tabelas
revoke all on public.organizacoes, public.membros, public.cursos, public.pessoas, public.auditoria from anon;
-- Usuários logados: só o necessário (as linhas ainda passam pelo RLS)
revoke all on public.organizacoes, public.membros, public.cursos, public.pessoas, public.auditoria from authenticated;
grant select, update                 on public.organizacoes to authenticated;
grant select                         on public.membros      to authenticated;
grant select, insert, update, delete on public.cursos       to authenticated;
grant select, insert, update, delete on public.pessoas      to authenticated;
grant select                         on public.auditoria    to authenticated;

-- Organizações
create policy "membros veem a organização" on public.organizacoes
  for select to authenticated
  using ((select private.e_membro(id)));
create policy "dono e admin editam a organização" on public.organizacoes
  for update to authenticated
  using ((select private.tem_papel(id, '{dono,admin}')))
  with check ((select private.tem_papel(id, '{dono,admin}')));

-- Membros (alterações só por funções controladas, no futuro)
create policy "membros veem a equipe" on public.membros
  for select to authenticated
  using ((select private.e_membro(organizacao_id)));

-- Cursos
create policy "membros veem os cursos" on public.cursos
  for select to authenticated
  using ((select private.e_membro(organizacao_id)));
create policy "dono e admin criam cursos" on public.cursos
  for insert to authenticated
  with check ((select private.tem_papel(organizacao_id, '{dono,admin}')));
create policy "dono e admin editam cursos" on public.cursos
  for update to authenticated
  using ((select private.tem_papel(organizacao_id, '{dono,admin}')))
  with check ((select private.tem_papel(organizacao_id, '{dono,admin}')));
create policy "dono e admin apagam cursos" on public.cursos
  for delete to authenticated
  using ((select private.tem_papel(organizacao_id, '{dono,admin}')));

-- Pessoas
create policy "membros veem as pessoas" on public.pessoas
  for select to authenticated
  using ((select private.e_membro(organizacao_id)));
create policy "membros cadastram pessoas" on public.pessoas
  for insert to authenticated
  with check ((select private.e_membro(organizacao_id)));
create policy "membros editam pessoas" on public.pessoas
  for update to authenticated
  using ((select private.e_membro(organizacao_id)))
  with check ((select private.e_membro(organizacao_id)));
create policy "só o dono apaga de vez" on public.pessoas
  for delete to authenticated
  using ((select private.tem_papel(organizacao_id, '{dono}')));

-- Auditoria (somente leitura, dono e admin)
create policy "dono e admin leem a auditoria" on public.auditoria
  for select to authenticated
  using ((select private.tem_papel(organizacao_id, '{dono,admin}')));
