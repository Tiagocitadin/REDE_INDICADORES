import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Carregando, MensagemErro, Texto, Vazio } from '@/components/ui';
import { useNomesCursos } from '@/features/cursos/cursos';
import { FiltroCurso } from '@/features/cursos/FiltroCurso';
import { ItemPessoa } from '@/features/pessoas/componentes/ItemPessoa';
import { useListaPessoas } from '@/features/pessoas/pessoas';
import { LARGURA_MAX_CONTEUDO } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/** Espera a pessoa parar de digitar antes de buscar (menos consultas) */
function useAtrasado<T>(valor: T, ms = 300) {
  const [atrasado, setAtrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setAtrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return atrasado;
}

export default function ListaPessoas() {
  const { cores, raio, fonte, telaPequena } = useTema();
  const [busca, setBusca] = useState('');
  const [cursoId, setCursoId] = useState<string | null>(null);
  const termo = useAtrasado(busca);
  const nomesCursos = useNomesCursos();
  const lista = useListaPessoas(termo, cursoId);
  const pessoas = lista.data?.pages.flat() ?? [];

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: cores.fundo }}>
      <View style={estilos.coluna}>
        <FlatList
          data={pessoas}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: telaPequena ? 16 : 20, gap: 8 }}
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (lista.hasNextPage && !lista.isFetchingNextPage) lista.fetchNextPage();
          }}
          refreshing={lista.isRefetching && !lista.isFetchingNextPage}
          onRefresh={lista.refetch}
          ListHeaderComponent={
            <View style={{ gap: 14, marginBottom: 8 }}>
              <Texto variante="titulo" accessibilityRole="header">
                Pessoas
              </Texto>
              <View
                style={[
                  estilos.busca,
                  { backgroundColor: cores.superficie, borderColor: cores.bordaForte, borderRadius: raio.md },
                ]}
              >
                <Ionicons name="search" size={18} color={cores.textoSuave} />
                <TextInput
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="Buscar por nome"
                  placeholderTextColor={cores.textoSuave}
                  accessibilityLabel="Buscar pessoa por nome"
                  autoCorrect={false}
                  style={{ flex: 1, height: 46, color: cores.texto, fontSize: fonte.tamanho.corpo }}
                />
              </View>
              <FiltroCurso valor={cursoId} aoMudar={setCursoId} />
              {lista.error ? <MensagemErro erro={lista.error} aoTentar={lista.refetch} /> : null}
            </View>
          }
          renderItem={({ item }) => <ItemPessoa pessoa={item} nomeCurso={nomesCursos.get(item.curso_id)} />}
          ListEmptyComponent={
            lista.isPending ? (
              <Carregando />
            ) : (
              <Vazio
                titulo={termo ? 'Ninguém encontrado' : 'Nenhuma pessoa cadastrada'}
                texto={termo ? 'Confira o nome digitado.' : 'Use a aba Cadastrar para incluir a primeira pessoa.'}
              />
            )
          }
          ListFooterComponent={lista.isFetchingNextPage ? <Carregando texto="Carregando mais…" /> : null}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  coluna: { flex: 1, width: '100%', maxWidth: LARGURA_MAX_CONTEUDO, alignSelf: 'center' },
  busca: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1 },
});