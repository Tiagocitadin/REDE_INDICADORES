-- =====================================================================
-- Gatilhos: normalização, árvore (ancestrais/nível), anti-ciclo,
-- data de atualização e auditoria.
-- =====================================================================

-- Atualiza "atualizado_em" automaticamente
create or replace function private.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger organizacoes_atualizado_em before update on public.organizacoes
  for each row execute function private.definir_atualizado_em();
create trigger cursos_atualizado_em before update on public.cursos
  for each row execute function private.definir_atualizado_em();
create trigger pessoas_atualizado_em before update on public.pessoas
  for each row execute function private.definir_atualizado_em();

-- Normaliza os dados antes de gravar (nome sem espaços extras,
-- e-mail minúsculo, telefone só com dígitos) e trava a troca de organização.
create or replace function private.pessoas_normalizar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.organizacao_id <> old.organizacao_id then
    raise exception 'Não é permitido mover uma pessoa de organização' using errcode = '42501';
  end if;

  new.nome      := regexp_replace(btrim(new.nome), '\s+', ' ', 'g');
  new.email     := nullif(lower(btrim(new.email)), '');
  new.telefone  := nullif(regexp_replace(coalesce(new.telefone, ''), '\D', '', 'g'), '');
  new.descricao := nullif(btrim(new.descricao), '');
  return new;
end;
$$;

create trigger pessoas_10_normalizar before insert or update on public.pessoas
  for each row execute function private.pessoas_normalizar();

-- Calcula a posição na árvore e impede indicação circular
create or replace function private.pessoas_definir_arvore()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_ancestrais_pai uuid[];
begin
  if new.indicado_por_id is null then
    new.ancestrais := '{}';
    new.nivel := 1;
    return new;
  end if;

  select p.ancestrais
    into v_ancestrais_pai
    from public.pessoas p
   where p.id = new.indicado_por_id
     and p.organizacao_id = new.organizacao_id;

  if not found then
    raise exception 'Quem indicou não foi encontrado nesta organização' using errcode = '23503';
  end if;

  if tg_op = 'UPDATE' and new.id = any (v_ancestrais_pai) then
    raise exception 'Indicação circular: essa pessoa já está abaixo de quem você escolheu' using errcode = '23514';
  end if;

  new.ancestrais := v_ancestrais_pai || new.indicado_por_id;
  new.nivel := cardinality(new.ancestrais) + 1;
  return new;
end;
$$;

create trigger pessoas_20_arvore before insert or update of indicado_por_id on public.pessoas
  for each row execute function private.pessoas_definir_arvore();

-- Se alguém muda de indicador, toda a rede abaixo dela acompanha
create or replace function private.pessoas_propagar_arvore()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ancestrais is distinct from old.ancestrais then
    update public.pessoas d
       set ancestrais = new.ancestrais || new.id
                        || d.ancestrais[array_position(d.ancestrais, new.id) + 1:],
           nivel      = cardinality(new.ancestrais) + 1
                        + cardinality(d.ancestrais) - array_position(d.ancestrais, new.id) + 1
     where d.organizacao_id = new.organizacao_id
       and d.ancestrais @> array[new.id];
  end if;
  return null;
end;
$$;

create trigger pessoas_30_propagar after update of indicado_por_id on public.pessoas
  for each row execute function private.pessoas_propagar_arvore();

-- Auditoria (roda com privilégio próprio para gravar o log,
-- que ninguém consegue editar ou apagar pela API)
create or replace function private.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campos text[];
  v_registro record;
begin
  v_registro := case when tg_op = 'DELETE' then old else new end;

  if tg_op = 'UPDATE' then
    select array_agg(n.key order by n.key)
      into v_campos
      from jsonb_each(to_jsonb(new)) n
      join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value
       and n.key not in ('atualizado_em', 'ancestrais', 'nivel');
    if v_campos is null then
      return null;
    end if;
  end if;

  insert into public.auditoria (organizacao_id, tabela, registro_id, acao, campos, usuario_id)
  values (v_registro.organizacao_id, tg_table_name, v_registro.id, tg_op, v_campos, auth.uid());
  return null;
end;
$$;

create trigger pessoas_auditoria after insert or update or delete on public.pessoas
  for each row execute function private.registrar_auditoria();
create trigger cursos_auditoria after insert or update or delete on public.cursos
  for each row execute function private.registrar_auditoria();
