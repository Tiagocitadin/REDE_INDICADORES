import { useState } from 'react';
import { View } from 'react-native';

import { Botao, Campo, Cartao, Carregando, MensagemErro, Tela, Texto, Vazio } from '@/components/ui';
import { esquemaCurso, useAtualizarCurso, useCriarCurso, useCursos } from '@/features/cursos/cursos';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';

/** Cursos da rede: listar, adicionar e ativar/desativar */
export default function Cursos() {
  const { podeGerenciar } = useOrganizacao();
  const cursos = useCursos();
  const criar = useCriarCurso();
  const atualizar = useAtualizarCurso();
  const [novoCurso, setNovoCurso] = useState('');
  const [erroCampo, setErroCampo] = useState<string>();

  const adicionar = () => {
    const r = esquemaCurso.safeParse({ nome: novoCurso });
    if (!r.success) {
      setErroCampo(r.error.issues[0]?.message);
      return;
    }
    setErroCampo(undefined);
    criar.mutate(r.data.nome, { onSuccess: () => setNovoCurso('') });
  };

  return (
    <Tela titulo="Cursos" aoAtualizar={cursos.refetch} atualizando={cursos.isRefetching}>
      {podeGerenciar ? (
        <Cartao titulo="Novo curso">
          <Campo
            rotulo="Nome do curso"
            value={novoCurso}
            onChangeText={setNovoCurso}
            onSubmitEditing={adicionar}
            erro={erroCampo}
          />
          {criar.error ? <MensagemErro erro={criar.error} /> : null}
          <Botao titulo="Adicionar curso" icone="add" carregando={criar.isPending} aoPressionar={adicionar} />
        </Cartao>
      ) : null}

      {cursos.isPending ? <Carregando /> : null}
      {cursos.error ? <MensagemErro erro={cursos.error} aoTentar={cursos.refetch} /> : null}

      {cursos.data && !cursos.data.length ? (
        <Vazio
          titulo="Nenhum curso cadastrado"
          texto={
            podeGerenciar
              ? 'Adicione o primeiro curso acima. Depois ele aparece no cadastro de pessoas.'
              : 'Peça para quem administra a rede cadastrar os cursos.'
          }
        />
      ) : null}

      {cursos.data?.length ? (
        <Cartao titulo="Cursos da rede">
          {cursos.data.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
              <Texto style={{ flex: 1 }} suave={!c.ativo}>
                {c.nome}
                {c.ativo ? '' : ' (inativo)'}
              </Texto>
              {podeGerenciar ? (
                <Botao
                  titulo={c.ativo ? 'Desativar' : 'Reativar'}
                  variante="fantasma"
                  compacto
                  aoPressionar={() => atualizar.mutate({ id: c.id, ativo: !c.ativo })}
                />
              ) : null}
            </View>
          ))}
          {atualizar.error ? <MensagemErro erro={atualizar.error} /> : null}
          <Texto variante="legenda" suave>
            Cursos inativos somem do cadastro, mas o histórico continua.
          </Texto>
        </Cartao>
      ) : null}
    </Tela>
  );
}
