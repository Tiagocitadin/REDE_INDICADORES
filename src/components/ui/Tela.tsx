import { createContext, useContext, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LARGURA_MAX_CONTEUDO } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

/**
 * true dentro da área logada: lá a barra superior já cuida do espaço
 * do topo (entalhe/relógio do celular), então a tela não repete esse espaço.
 */
export const ComBarraTopo = createContext(false);

type Props = {
  titulo?: string;
  subtitulo?: string;
  acao?: ReactNode;
  children: ReactNode;
  /** false para telas com lista própria (FlatList) */
  rolar?: boolean;
  atualizando?: boolean;
  aoAtualizar?: () => void;
};

/**
 * Moldura padrão de todas as telas: área segura, fundo, cabeçalho
 * e largura máxima em telas grandes (tablet/computador).
 */
export function Tela({ titulo, subtitulo, acao, children, rolar = true, atualizando, aoAtualizar }: Props) {
  const { cores, espaco, telaPequena } = useTema();
  const comBarra = useContext(ComBarraTopo);

  const cabecalho = titulo ? (
    <View style={[estilos.cabecalho, { marginBottom: espaco.lg }]}>
      <View style={{ flex: 1, gap: 2 }}>
        {subtitulo ? (
          <Texto variante="pequeno" suave negrito>
            {subtitulo}
          </Texto>
        ) : null}
        <Texto variante="titulo" accessibilityRole="header">
          {titulo}
        </Texto>
      </View>
      {acao}
    </View>
  ) : null;

  const conteudo = (
    <View style={[estilos.conteudo, { padding: telaPequena ? espaco.lg : espaco.xl, gap: espaco.lg }]}>
      {cabecalho}
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={comBarra ? ['left', 'right'] : ['top', 'left', 'right']}
      style={[estilos.raiz, { backgroundColor: cores.fundo }]}
    >
      {rolar ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            aoAtualizar ? <RefreshControl refreshing={!!atualizando} onRefresh={aoAtualizar} /> : undefined
          }
        >
          {conteudo}
        </ScrollView>
      ) : (
        conteudo
      )}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { flex: 1, width: '100%', maxWidth: LARGURA_MAX_CONTEUDO, alignSelf: 'center' },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});