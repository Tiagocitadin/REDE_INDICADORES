import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Botao, Campo, Cartao, Carregando, MensagemErro, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { trocarSenha } from '@/features/auth/api';
import { esquemaCurso, useAtualizarCurso, useCriarCurso, useCursos } from '@/features/cursos/cursos';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useTema } from '@/theme/useTema';

const rotuloPapel = { dono: 'Dono', admin: 'Administrador', operador: 'Operador' } as const;

export default function Ajustes() {
  const { cores } = useTema();
  const { sessao, sair } = useAuth();
  const { atual, organizacoes, trocar, podeGerenciar } = useOrganizacao();
  const cursos = useCursos();
  const criar = useCriarCurso();
  const atualizar = useAtualizarCurso();
  const [novoCurso, setNovoCurso] = useState('');
  const [erroCampo, setErroCampo] = useState<string>();
  const [senha, setSenha] = useState('');
  const [estadoSenha, setEstadoSenha] = useState<{ ok?: boolean; erro?: unknown; salvando?: boolean }>({});

  const salvarSenha = async () => {
    setEstadoSenha({ salvando: true });
    try {
      await trocarSenha(senha);
      setSenha('');
      setEstadoSenha({ ok: true });
    } catch (e) {
      setEstadoSenha({ erro: e });
    }
  };

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
    <Tela titulo="Ajustes" aoAtualizar={cursos.refetch} atualizando={cursos.isRefetching}>
      <Cartao titulo="Cursos">
        {cursos.isPending ? <Carregando /> : null}
        {cursos.error ? <MensagemErro erro={cursos.error} aoTentar={cursos.refetch} /> : null}
        {cursos.data?.map((c) => (
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

        {podeGerenciar ? (
          <View style={{ gap: 10, marginTop: 4 }}>
            <Campo
              rotulo="Novo curso"
              value={novoCurso}
              onChangeText={setNovoCurso}
              onSubmitEditing={adicionar}
              erro={erroCampo}
              ajuda="Cursos inativos somem do cadastro, mas o histórico continua."
            />
            {criar.error ? <MensagemErro erro={criar.error} /> : null}
            <Botao titulo="Adicionar curso" icone="add" variante="secundario" carregando={criar.isPending} aoPressionar={adicionar} />
          </View>
        ) : null}
      </Cartao>

      {organizacoes.length > 1 ? (
        <Cartao titulo="Rede em uso">
          {organizacoes.map((o) => (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: o.id === atual?.id }}
              onPress={() => trocar(o.id)}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Texto negrito={o.id === atual?.id} cor={o.id === atual?.id ? cores.destaque : undefined}>
                {o.nome}
              </Texto>
            </Pressable>
          ))}
        </Cartao>
      ) : null}

      <Cartao titulo="Conta">
        <Texto>{sessao?.user.email}</Texto>
        <Texto variante="pequeno" suave>
          {atual?.nome} · {atual ? rotuloPapel[atual.papel] : ''}
        </Texto>
        <Campo
          rotulo="Nova senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          ajuda="Mínimo de 8 caracteres, com letras e números."
        />
        {estadoSenha.erro ? <MensagemErro erro={estadoSenha.erro} /> : null}
        {estadoSenha.ok ? (
          <Texto variante="pequeno" cor={cores.concluido}>
            Senha alterada.
          </Texto>
        ) : null}
        <Botao
          titulo="Trocar senha"
          variante="secundario"
          compacto
          desabilitado={!senha}
          carregando={estadoSenha.salvando}
          aoPressionar={salvarSenha}
        />
        <Botao titulo="Sair" variante="secundario" icone="log-out-outline" aoPressionar={sair} />
      </Cartao>
    </Tela>
  );
}
