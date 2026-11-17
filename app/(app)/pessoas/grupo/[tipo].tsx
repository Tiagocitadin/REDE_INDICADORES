import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { memo } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Botao, Carregando, Etiqueta, MensagemErro, SeloStatus, Texto, Vazio } from '@/components/ui';
import { useNomesCursos } from '@/features/cursos/cursos';
import { FiltroCurso } from '@/features/cursos/FiltroCurso';
import { GRUPOS, ehTipoGrupo, useGrupoPessoas, type PessoaDoGrupo } from '@/features/pessoas/grupos';
import { formatarData, formatarTelefone, somenteDigitos } from '@/lib/format';
import { LARGURA_MAX_CONTEUDO } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

/**
 * Lista aberta ao tocar num card do Painel:
 * vidas resgatadas, apresentações, contatos, diretas ou indiretas.
 * Na lista de Contatos, cada pessoa tem botões para ligar, WhatsApp e e-mail.
 */
export default function GrupoPessoas() {
  const params = useLocalSearchParams<{ tipo: string; curso?: string }>();
  const { cores } = useTema();

  if (!ehTipoGrupo(params.tipo)) {
    return (
      <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: cores.fundo, padding: 20 }}>
        <Vazio
          titulo="Lista não encontrada"
          acao={<Botao titulo="Voltar ao Painel" variante="secundario" aoPressionar={() => router.replace('/painel')} />}
        />
      </SafeAreaView>
    );
  }

  return <ListaGrupo tipo={params.tipo} cursoInicial={params.curso || null} />;
}

function ListaGrupo({ tipo, cursoInicial }: { tipo: keyof typeof GRUPOS; cursoInicial: string | null }) {
  const { cores } = useTema();
  const grupo = GRUPOS[tipo];
  const cursoId = cursoInicial;
  const nomesCursos = useNomesCursos();
  const lista = useGrupoPessoas(tipo, cursoId);
  const pessoas = lista.data?.pages.flat() ?? [];
  const ehContatos = tipo === 'contatos';

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/painel'));

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: cores.fundo }}>
      <View style={estilos.coluna}>
        <FlatList
          data={pessoas}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 20, gap: 8 }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (lista.hasNextPage && !lista.isFetchingNextPage) lista.fetchNextPage();
          }}
          refreshing={lista.isRefetching && !lista.isFetchingNextPage}
          onRefresh={lista.refetch}
          ListHeaderComponent={
            <View style={{ gap: 14, marginBottom: 8 }}>
              <View style={estilos.topo}>
                <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={voltar} hitSlop={10} style={estilos.voltar}>
                  <Ionicons name="chevron-back" size={24} color={cores.texto} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Texto variante="titulo" accessibilityRole="header">
                    {grupo.titulo}
                  </Texto>
                  <Texto variante="pequeno" suave>
                    {grupo.descricao}
                  </Texto>
                </View>
              </View>
              <FiltroCurso
                valor={cursoId}
                aoMudar={(novo) => router.setParams({ curso: novo ?? '' })}
              />
              {lista.error ? <MensagemErro erro={lista.error} aoTentar={lista.refetch} /> : null}
            </View>
          }
          renderItem={({ item }) => (
            <ItemGrupo pessoa={item} nomeCurso={nomesCursos.get(item.curso_id)} contato={ehContatos} />
          )}
          ListEmptyComponent={lista.isPending ? <Carregando /> : <Vazio titulo={grupo.vazio} />}
          ListFooterComponent={lista.isFetchingNextPage ? <Carregando texto="Carregando mais…" /> : null}
        />
      </View>
    </SafeAreaView>
  );
}

const ItemGrupo = memo(function ItemGrupo({
  pessoa,
  nomeCurso,
  contato,
}: {
  pessoa: PessoaDoGrupo;
  nomeCurso?: string;
  contato: boolean;
}) {
  const { cores, raio } = useTema();
  const abrirFicha = () => router.push({ pathname: '/pessoas/[id]', params: { id: pessoa.id } });

  const origem =
    pessoa.nivel === 1 ? 'Indicação direta' : `Indicada por ${pessoa.nomeIndicador ?? '—'} · nível ${pessoa.nivel}`;

  return (
    <View style={[estilos.cartao, { backgroundColor: cores.superficie, borderRadius: raio.md }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Abrir ficha de ${pessoa.nome}`}
        onPress={abrirFicha}
        style={({ pressed }) => [estilos.linha, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Avatar nome={pessoa.nome} />
        <View style={{ flex: 1, gap: 4 }}>
          <Texto negrito numberOfLines={1}>
            {pessoa.nome}
          </Texto>
          <View style={estilos.etiquetas}>
            {!contato ? <SeloStatus status={pessoa.status} /> : null}
            {nomeCurso ? <Etiqueta texto={nomeCurso} /> : null}
          </View>
          <Texto variante="legenda" suave numberOfLines={1}>
            {origem}
          </Texto>
          {contato ? (
            <Texto variante="legenda" suave>
              Cadastrada em {formatarData(pessoa.criado_em)}
            </Texto>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
      </Pressable>

      {contato ? <AcoesContato pessoa={pessoa} /> : null}
    </View>
  );
});

/** Ligar, WhatsApp e e-mail. Mostra só o que a pessoa tem cadastrado. */
function AcoesContato({ pessoa }: { pessoa: PessoaDoGrupo }) {
  const { cores } = useTema();
  const digitos = somenteDigitos(pessoa.telefone ?? '');
  // números brasileiros salvos sem DDI ganham o 55 para o WhatsApp
  const whatsapp = digitos ? (digitos.length <= 11 ? `55${digitos}` : digitos) : null;

  if (!digitos && !pessoa.email) {
    return (
      <Texto variante="legenda" suave style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
        Sem telefone nem e-mail. Abra a ficha para completar o cadastro.
      </Texto>
    );
  }

  return (
    <View style={[estilos.acoes, { borderTopColor: cores.borda }]}>
      {digitos ? (
        <Texto variante="pequeno" negrito selectable style={{ flexBasis: '100%' }}>
          {formatarTelefone(pessoa.telefone)}
          {pessoa.email ? (
            <Texto variante="pequeno" suave>
              {'  ·  '}
              {pessoa.email}
            </Texto>
          ) : null}
        </Texto>
      ) : (
        <Texto variante="pequeno" negrito selectable style={{ flexBasis: '100%' }}>
          {pessoa.email}
        </Texto>
      )}
      {whatsapp ? (
        <Botao
          titulo="WhatsApp"
          icone="logo-whatsapp"
          compacto
          aoPressionar={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
          style={{ flexGrow: 1 }}
        />
      ) : null}
      {digitos ? (
        <Botao
          titulo="Ligar"
          icone="call-outline"
          variante="secundario"
          compacto
          aoPressionar={() => Linking.openURL(`tel:${digitos}`)}
          style={{ flexGrow: 1 }}
        />
      ) : null}
      {pessoa.email ? (
        <Botao
          titulo="E-mail"
          icone="mail-outline"
          variante="secundario"
          compacto
          aoPressionar={() => Linking.openURL(`mailto:${pessoa.email}`)}
          style={{ flexGrow: 1 }}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  coluna: { flex: 1, width: '100%', maxWidth: LARGURA_MAX_CONTEUDO, alignSelf: 'center' },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voltar: { width: 40, height: 44, justifyContent: 'center' },
  cartao: { overflow: 'hidden' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 64 },
  etiquetas: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
