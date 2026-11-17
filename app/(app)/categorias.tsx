import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { memo, type ComponentProps } from 'react';
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Botao, Carregando, Etiqueta, MensagemErro, SeloStatus, Texto, Vazio } from '@/components/ui';
import { useNomesCursos } from '@/features/cursos/cursos';
import { FiltroCurso } from '@/features/cursos/FiltroCurso';
import { GRUPOS, ehTipoGrupo, useGrupoPessoas, type PessoaDoGrupo, type TipoGrupo } from '@/features/pessoas/grupos';
import { useResumoRede, type ResumoRede } from '@/features/rede/rede';
import { formatarData, formatarTelefone, somenteDigitos } from '@/lib/format';
import { LARGURA_MAX_CONTEUDO } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

/** Ordem das abas e o número de cada uma (o mesmo dos cards do Painel) */
const ABAS: { tipo: TipoGrupo; icone: NomeIcone; contagem: (r: ResumoRede) => number }[] = [
  { tipo: 'contatos', icone: 'call-outline', contagem: (r) => r.cadastrados },
  { tipo: 'apresentacoes', icone: 'easel-outline', contagem: (r) => r.matriculados },
  { tipo: 'vidas', icone: 'heart-outline', contagem: (r) => r.concluidos },
  { tipo: 'diretas', icone: 'person-outline', contagem: (r) => r.diretas },
  { tipo: 'indiretas', icone: 'git-branch-outline', contagem: (r) => r.indiretas },
];

/**
 * Menu "Categorias": as pessoas separadas por categoria, com abas no topo
 * para trocar de uma para outra sem voltar ao Painel.
 * Os cards do Painel abrem esta tela já na aba certa (?tipo=contatos etc.).
 */
export default function Categorias() {
  const params = useLocalSearchParams<{ tipo?: string; curso?: string }>();
  const { cores } = useTema();
  const tipo: TipoGrupo = ehTipoGrupo(params.tipo) ? params.tipo : 'contatos';
  const cursoId = params.curso || null;

  const grupo = GRUPOS[tipo];
  const resumo = useResumoRede(null, cursoId);
  const nomesCursos = useNomesCursos();
  const lista = useGrupoPessoas(tipo, cursoId);
  const pessoas = lista.data?.pages.flat() ?? [];

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
          onRefresh={() => {
            lista.refetch();
            resumo.refetch();
          }}
          ListHeaderComponent={
            <View style={{ gap: 14, marginBottom: 8 }}>
              <Texto variante="titulo" accessibilityRole="header">
                Categorias
              </Texto>

              <AbasCategorias
                atual={tipo}
                resumo={resumo.data}
                aoMudar={(novo) => router.setParams({ tipo: novo })}
              />

              <FiltroCurso valor={cursoId} aoMudar={(novo) => router.setParams({ curso: novo ?? '' })} />

              <Texto variante="pequeno" suave>
                {grupo.descricao}
              </Texto>

              {lista.error ? <MensagemErro erro={lista.error} aoTentar={lista.refetch} /> : null}
            </View>
          }
          renderItem={({ item }) => (
            <ItemGrupo pessoa={item} nomeCurso={nomesCursos.get(item.curso_id)} contato={tipo === 'contatos'} />
          )}
          ListEmptyComponent={lista.isPending ? <Carregando /> : <Vazio titulo={grupo.vazio} />}
          ListFooterComponent={lista.isFetchingNextPage ? <Carregando texto="Carregando mais…" /> : null}
        />
      </View>
    </SafeAreaView>
  );
}

/** Abas das 5 categorias, com o número de pessoas em cada uma */
function AbasCategorias({
  atual,
  resumo,
  aoMudar,
}: {
  atual: TipoGrupo;
  resumo?: ResumoRede;
  aoMudar: (tipo: TipoGrupo) => void;
}) {
  const { cores, raio } = useTema();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.abas}
      accessibilityRole="tablist"
    >
      {ABAS.map((aba) => {
        const ativa = aba.tipo === atual;
        const total = resumo ? aba.contagem(resumo) : null;
        return (
          <Pressable
            key={aba.tipo}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={`${GRUPOS[aba.tipo].titulo}${total != null ? `, ${total}` : ''}`}
            onPress={() => aoMudar(aba.tipo)}
            style={({ pressed }) => [
              estilos.aba,
              {
                borderRadius: raio.md,
                backgroundColor: ativa ? cores.destaque : cores.superficie,
                borderColor: ativa ? cores.destaque : cores.borda,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name={aba.icone} size={18} color={ativa ? cores.destaqueTexto : cores.textoSuave} />
            <Texto variante="pequeno" negrito cor={ativa ? cores.destaqueTexto : cores.texto}>
              {GRUPOS[aba.tipo].titulo}
            </Texto>
            {total != null ? (
              <View
                style={[
                  estilos.contagem,
                  { backgroundColor: ativa ? 'rgba(255,255,255,0.22)' : cores.superficieSuave },
                ]}
              >
                <Texto variante="legenda" negrito cor={ativa ? cores.destaqueTexto : cores.textoSuave}>
                  {total}
                </Texto>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
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
      <Texto variante="pequeno" negrito selectable style={{ flexBasis: '100%' }}>
        {digitos ? formatarTelefone(pessoa.telefone) : pessoa.email}
        {digitos && pessoa.email ? (
          <Texto variante="pequeno" suave>
            {'  ·  '}
            {pessoa.email}
          </Texto>
        ) : null}
      </Texto>
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
  abas: { gap: 8, paddingRight: 8 },
  aba: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  contagem: { minWidth: 24, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, alignItems: 'center' },
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
