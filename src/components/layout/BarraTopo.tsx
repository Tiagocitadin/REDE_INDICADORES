import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, BotaoTema, Confirmacao, Logo, Texto } from '@/components/ui';
import { primeiroNome } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useTema } from '@/theme/useTema';

/**
 * Barra superior da área logada: marca e nome da rede à esquerda;
 * tema claro/escuro, avatar (abre Ajustes) e sair à direita.
 */
export function BarraTopo() {
  const { cores, telaLarga } = useTema();
  const insets = useSafeAreaInsets();
  const { sessao, sair } = useAuth();
  const { atual } = useOrganizacao();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const email = sessao?.user.email ?? '';
  const nome = primeiroNome(sessao?.user);

  return (
    <View
      style={[
        estilos.barra,
        {
          paddingTop: insets.top + 8,
          paddingLeft: Math.max(16, insets.left),
          paddingRight: Math.max(16, insets.right),
          backgroundColor: cores.superficie,
          borderBottomColor: cores.borda,
        },
      ]}
    >
      <View style={estilos.marca}>
        <Logo tamanho={34} />
        <View style={{ flexShrink: 1 }}>
          <Texto variante="pequeno" negrito numberOfLines={1}>
            Rede de Indicações
          </Texto>
          {atual ? (
            <Texto variante="legenda" suave numberOfLines={1}>
              {atual.nome}
            </Texto>
          ) : null}
        </View>
      </View>

      <View style={estilos.acoes}>
        <BotaoTema />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Conta de ${nome || email}. Abrir ajustes`}
          onPress={() => router.push('/ajustes')}
          style={({ pressed }) => [estilos.conta, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Avatar nome={nome || '?'} tamanho={36} forte />
          {telaLarga && nome ? (
            <Texto variante="pequeno" negrito numberOfLines={1} style={{ maxWidth: 160 }}>
              {nome}
            </Texto>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          onPress={() => setConfirmandoSaida(true)}
          style={({ pressed }) => [
            estilos.sair,
            { borderColor: cores.borda, backgroundColor: pressed ? cores.superficieSuave : cores.superficie },
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={cores.texto} />
          {telaLarga ? (
            <Texto variante="pequeno" negrito>
              Sair
            </Texto>
          ) : null}
        </Pressable>
      </View>

      <Confirmacao
        visivel={confirmandoSaida}
        titulo="Sair da conta?"
        texto="Você vai precisar entrar de novo com e-mail e senha."
        rotuloConfirmar="Sair"
        carregando={saindo}
        aoCancelar={() => setConfirmandoSaida(false)}
        aoConfirmar={async () => {
          setSaindo(true);
          await sair();
          setSaindo(false);
          setConfirmandoSaida(false);
          router.replace('/entrar');
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  conta: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 2 },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
  },
});