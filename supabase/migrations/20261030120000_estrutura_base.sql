-- =====================================================================
-- Rede de Indicações · estrutura base
-- Multi-organização desde o início (pronto para comercializar):
-- cada cliente é uma "organização" e só enxerga os próprios dados.
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;

-- Esquema privado: funções auxiliares que NÃO ficam expostas pela API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.papel_membro as enum ('dono', 'admin', 'operador');
create type public.status_curso as enum ('cadastrado', 'matriculado', 'concluido');

-- ---------------------------------------------------------------------
-- Organizações (cada cliente do app)
-- ---------------------------------------------------------------------
create table public.organizacoes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null check (char_length(btrim(nome)) between 2 and 120),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Membros: quem (usuário do login) acessa qual organização e com qual papel
-- ---------------------------------------------------------------------
create table public.membros (
  organizacao_id uuid not null references public.organizacoes(id) on delete cascade,
  usuario_id     uuid not null references auth.users(id) on delete cascade,
  papel          public.papel_membro not null default 'operador',
  criado_em      timestamptz not null default now(),
  primary key (organizacao_id, usuario_id)
);
create index membros_usuario_idx on public.membros (usuario_id);

-- ---------------------------------------------------------------------
-- Cursos
-- ---------------------------------------------------------------------
create table public.cursos (
  id             uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.organizacoes(id) on delete cascade,
  nome           text not null check (char_length(btrim(nome)) between 2 and 120),
  descricao      text check (char_length(descricao) <= 1000),
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  unique (organizacao_id, id)
);
create unique index cursos_nome_unq on public.cursos (organizacao_id, lower(nome));

-- ---------------------------------------------------------------------
-- Pessoas: cada pessoa entra UMA vez, faz UM curso e fica ligada
-- a quem a indicou. Quem indicou nulo = indicação direta do topo (você).
-- ancestrais/nivel são calculados pelo banco (nunca pelo app).
-- ---------------------------------------------------------------------
create table public.pessoas (
  id               uuid primary key default gen_random_uuid(),
  organizacao_id   uuid not null references public.organizacoes(id) on delete cascade,
  nome             text not null check (char_length(btrim(nome)) between 2 and 150),
  telefone         text check (telefone ~ '^[0-9]{10,13}$'),
  email            text check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  descricao        text check (char_length(descricao) <= 2000),
  curso_id         uuid not null,
  status           public.status_curso not null default 'cadastrado',
  indicado_por_id  uuid,
  ancestrais       uuid[] not null default '{}',
  nivel            smallint not null default 1,
  consentimento_em timestamptz,
  criado_por       uuid default auth.uid() references auth.users(id) on delete set null,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  excluido_em      timestamptz,
  unique (organizacao_id, id),
  check (indicado_por_id is distinct from id),
  -- o curso e o indicador precisam ser da MESMA organização
  foreign key (organizacao_id, curso_id) references public.cursos (organizacao_id, id) on delete restrict,
  foreign key (organizacao_id, indicado_por_id) references public.pessoas (organizacao_id, id) on delete restrict
);

-- Sem cadastro duplicado (mesmo e-mail ou telefone na mesma organização)
create unique index pessoas_email_unq    on public.pessoas (organizacao_id, email)    where email is not null;
create unique index pessoas_telefone_unq on public.pessoas (organizacao_id, telefone) where telefone is not null;

-- Índices de performance
create index pessoas_indicador_idx  on public.pessoas (organizacao_id, indicado_por_id);
create index pessoas_curso_idx      on public.pessoas (organizacao_id, curso_id);
create index pessoas_ancestrais_idx on public.pessoas using gin (ancestrais);
create index pessoas_nome_trgm_idx  on public.pessoas using gin (nome extensions.gin_trgm_ops);
create index pessoas_criado_por_idx on public.pessoas (criado_por);

-- ---------------------------------------------------------------------
-- Auditoria: quem mudou o quê e quando.
-- Guarda só os NOMES dos campos alterados, nunca os dados pessoais (LGPD).
-- ---------------------------------------------------------------------
create table public.auditoria (
  id             bigint generated always as identity primary key,
  organizacao_id uuid not null, -- sem FK de propósito: o log sobrevive à exclusão em cascata
  tabela         text not null,
  registro_id    uuid not null,
  acao           text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  campos         text[],
  usuario_id     uuid,
  criado_em      timestamptz not null default now()
);
create index auditoria_org_data_idx on public.auditoria (organizacao_id, criado_em desc);
