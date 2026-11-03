import { useState } from 'react';
import { Pressable } from 'react-native';

import { Botao, Campo, Cartao, MensagemErro, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { nomeDaConta, salvarNome, trocarSenha } from '@/features/auth/api';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useTema } from '@/theme/useTema';

const rotuloPapel = { dono: 'Dono', admin: 'Administrador', operador: 'Operador' } as const;

export default function Ajustes() {
  const { cores } = useTema();
  const { sessao, sair } = useAuth();
  const { atual, organizacoes, trocar } = useOrganizacao();
  const [senha, setSenha] = useState('');
  const [estadoSenha, setEstadoSenha] = useState<{ ok?: boolean; erro?: unknown; salvando?: boolean }>({});

  const [nome, setNome] = useState(() => nomeDaConta(sessao?.user));
  const [estadoNome, setEstadoNome] = useState<{ ok?: boolean; erro?: unknown; salvando?: boolean }>({});

  const salvarMeuNome = async () => {
    setEstadoNome({ salvando: true });
    try {
      await salvarNome(nome);
      setEstadoNome({ ok: true });
    } catch (e) {
      setEstadoNome({ erro: e });
    }
  };

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

  return (
    <Tela titulo="Ajustes">
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
          rotulo="Seu nome"
          value={nome}
          onChangeText={(t) => {
            setNome(t);
            setEstadoNome({});
          }}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          onSubmitEditing={salvarMeuNome}
          ajuda="Aparece no topo do app."
        />
        {estadoNome.erro ? <MensagemErro erro={estadoNome.erro} /> : null}
        {estadoNome.ok ? (
          <Texto variante="pequeno" cor={cores.concluido}>
            Nome salvo.
          </Texto>
        ) : null}
        <Botao
          titulo="Salvar nome"
          variante="secundario"
          compacto
          desabilitado={!nome.trim() || nome.trim() === nomeDaConta(sessao?.user)}
          carregando={estadoNome.salvando}
          aoPressionar={salvarMeuNome}
        />
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
