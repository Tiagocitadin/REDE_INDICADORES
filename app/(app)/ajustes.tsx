import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Botao, Campo, Cartao, Etiqueta, MensagemErro, Segmentado, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { nomeDaConta, salvarNome, trocarSenha } from '@/features/auth/api';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { usePreferenciaTema, type PreferenciaTema } from '@/theme/TemaProvider';
import { useTema } from '@/theme/useTema';

const rotuloPapel = { dono: 'Dono', admin: 'Administrador', operador: 'Operador' } as const;

type Estado = { ok?: boolean; erro?: unknown; salvando?: boolean };

export default function Ajustes() {
  const { cores, raio, telaPequena } = useTema();
  const { sessao, sair } = useAuth();
  const { atual, organizacoes, trocar } = useOrganizacao();
  const { preferencia, definir } = usePreferenciaTema();

  const nomeSalvo = nomeDaConta(sessao?.user);
  const [nome, setNome] = useState(nomeSalvo);
  const [estadoNome, setEstadoNome] = useState<Estado>({});
  const [senha, setSenha] = useState('');
  const [estadoSenha, setEstadoSenha] = useState<Estado>({});

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
      {/* Perfil em destaque */}
      <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar nome={nome || nomeSalvo || '?'} tamanho={telaPequena ? 56 : 68} forte />
        <View style={{ flex: 1, gap: 4 }}>
          <Texto variante="titulo" numberOfLines={1}>
            {nomeSalvo || 'Sem nome'}
          </Texto>
          <Texto variante="pequeno" suave numberOfLines={1}>
            {sessao?.user.email}
          </Texto>
          {atual ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              <Etiqueta texto={rotuloPapel[atual.papel]} />
              <Etiqueta texto={atual.nome} />
            </View>
          ) : null}
        </View>
      </Cartao>

      {organizacoes.length > 1 ? (
        <Cartao>
          <TituloSecao icone="git-network-outline" titulo="Rede em uso" texto="Escolha qual rede você está vendo." />
          {organizacoes.map((o) => {
            const ativa = o.id === atual?.id;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: ativa }}
                onPress={() => trocar(o.id)}
                style={[
                  estilos.opcaoRede,
                  {
                    borderRadius: raio.md,
                    borderColor: ativa ? cores.destaque : cores.borda,
                    backgroundColor: ativa ? cores.destaqueSuave : 'transparent',
                  },
                ]}
              >
                <Texto negrito={ativa} style={{ flex: 1 }}>
                  {o.nome}
                </Texto>
                {ativa ? <Ionicons name="checkmark-circle" size={20} color={cores.destaque} /> : null}
              </Pressable>
            );
          })}
        </Cartao>
      ) : null}

      <Cartao>
        <TituloSecao icone="person-outline" titulo="Perfil" texto="Seu nome aparece no topo do app." />
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
        />
        <Rodape
          estado={estadoNome}
          mensagemOk="Nome salvo."
          botao={
            <Botao
              titulo="Salvar nome"
              compacto
              desabilitado={!nome.trim() || nome.trim() === nomeSalvo}
              carregando={estadoNome.salvando}
              aoPressionar={salvarMeuNome}
            />
          }
        />
      </Cartao>

      <Cartao>
        <TituloSecao icone="lock-closed-outline" titulo="Segurança" texto="Troque a senha usada para entrar." />
        <Campo
          rotulo="Nova senha"
          value={senha}
          onChangeText={(t) => {
            setSenha(t);
            setEstadoSenha({});
          }}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={senha ? salvarSenha : undefined}
          ajuda="Mínimo de 8 caracteres, com letras e números."
        />
        <Rodape
          estado={estadoSenha}
          mensagemOk="Senha alterada."
          botao={
            <Botao
              titulo="Trocar senha"
              compacto
              desabilitado={!senha}
              carregando={estadoSenha.salvando}
              aoPressionar={salvarSenha}
            />
          }
        />
      </Cartao>

      <Cartao>
        <TituloSecao icone="color-palette-outline" titulo="Aparência" texto="Escolha o tema do app." />
        <Segmentado<PreferenciaTema>
          rotulo="Tema"
          valor={preferencia}
          aoMudar={definir}
          opcoes={[
            { valor: 'sistema', rotulo: 'Automático' },
            { valor: 'claro', rotulo: 'Claro' },
            { valor: 'escuro', rotulo: 'Escuro' },
          ]}
        />
      </Cartao>

      <Botao titulo="Sair da conta" variante="perigo" icone="log-out-outline" aoPressionar={sair} />
    </Tela>
  );
}

/** Ícone + título + explicação curta no topo de cada bloco */
function TituloSecao({
  icone,
  titulo,
  texto,
}: {
  icone: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  texto: string;
}) {
  const { cores, raio } = useTema();
  return (
    <View style={estilos.tituloSecao}>
      <View style={[estilos.iconeSecao, { borderRadius: raio.md, backgroundColor: cores.destaqueSuave }]}>
        <Ionicons name={icone} size={18} color={cores.destaque} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Texto variante="subtitulo" negrito>
          {titulo}
        </Texto>
        <Texto variante="pequeno" suave>
          {texto}
        </Texto>
      </View>
    </View>
  );
}

/** Linha final do bloco: mensagem de resultado à esquerda, botão à direita */
function Rodape({ estado, mensagemOk, botao }: { estado: Estado; mensagemOk: string; botao: ReactNode }) {
  const { cores } = useTema();
  return (
    <View style={{ gap: 8 }}>
      {estado.erro ? <MensagemErro erro={estado.erro} /> : null}
      <View style={estilos.rodape}>
        <View style={{ flex: 1 }}>
          {estado.ok ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color={cores.concluido} />
              <Texto variante="pequeno" cor={cores.concluido}>
                {mensagemOk}
              </Texto>
            </View>
          ) : null}
        </View>
        {botao}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tituloSecao: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  iconeSecao: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcaoRede: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
});
