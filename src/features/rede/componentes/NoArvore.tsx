import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { createContext, memo, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Carregando, Etiqueta, MensagemErro, Texto } from '@/components/ui';
import { iniciais } from '@/lib/format';
import { coresStatus, rotuloStatus, type StatusCurso } from '@/theme/status';
import { useTema } from '@/theme/useTema';
import { useFilhos, type NoArvore as TipoNo } from '../rede';

/*
 * Geometria dos galhos (├─ └─). Cada pessoa tem uma linha vertical à esquerda
 * e um traço horizontal até o avatar. Os filhos ficam alinhados ao centro do
 * avatar do pai, para a linha deles "sair" de baixo dele.
 */
const RAMO = 18; // espaço à esquerda reservado para as linhas
const AVATAR = 32;
const ALTURA_LINHA = 56;
const CENTRO = ALTURA_LINHA / 2;
const RECUO_CONTEUDO = 6; // padding interno antes do avatar
/** posição horizontal (dentro do nó) onde fica o centro do avatar */
const CENTRO_AVATAR = RAMO + RECUO_CONTEUDO + AVATAR / 2;
const ESPESSURA = 2;

/**
 * Comando "Expandir tudo / Recolher tudo" vindo da tela da árvore.
 * Cada clique aumenta `versao`; os galhos obedecem e, depois disso, a pessoa
 * ainda pode abrir ou fechar cada um à mão. Galhos que carregam depois de um
 * "Expandir tudo" já nascem abertos, então a árvore abre camada por camada.
 */
export type ComandoExpansao = { tudoAberto: boolean; versao: number };
export const ExpansaoArvore = createContext<ComandoExpansao>({ tudoAberto: false, versao: 0 });

/** Recuo para alinhar a primeira camada com um avatar de `tamanho` acima */
export function recuoGalho(tamanho: number) {
  return tamanho / 2 - ESPESSURA / 2;
}

type PropsGalho = { paiId: string | null; cursoId: string | null; mostrarCurso: boolean };

/** Lista os filhos de um nó. paiId nulo = indicações diretas do topo. */
export function GalhoArvore({ paiId, cursoId, mostrarCurso }: PropsGalho) {
  const { data, isPending, error, refetch } = useFilhos(paiId);
  if (isPending) return <Carregando />;
  if (error) return <MensagemErro erro={error} aoTentar={refetch} />;

  // Com filtro de curso: some quem é de outro curso e não trouxe ninguém.
  // Quem trouxe gente fica (apagado), pois pode levar a alguém do curso.
  const visiveis = cursoId ? data.filter((no) => no.curso_id === cursoId || no.diretas > 0) : data;

  if (!visiveis.length && paiId === null) {
    return (
      <Texto variante="pequeno" suave style={{ padding: 12 }}>
        {data.length
          ? 'Ninguém deste curso nas suas indicações diretas.'
          : 'Ninguém cadastrado ainda. Use a aba Cadastrar para incluir a primeira indicação.'}
      </Texto>
    );
  }
  return (
    <View>
      {visiveis.map((no, i) => (
        <NoArvore
          key={no.id}
          no={no}
          cursoId={cursoId}
          mostrarCurso={mostrarCurso}
          ultimo={i === visiveis.length - 1}
        />
      ))}
    </View>
  );
}

/**
 * Uma pessoa na árvore. Os filhos só são buscados quando o galho é aberto,
 * então a árvore abre rápido mesmo com milhares de pessoas.
 */
export const NoArvore = memo(function NoArvore({
  no,
  cursoId,
  mostrarCurso,
  ultimo,
}: {
  no: TipoNo;
  cursoId: string | null;
  mostrarCurso: boolean;
  ultimo: boolean;
}) {
  const { cores, raio, telaPequena } = useTema();
  const comando = useContext(ExpansaoArvore);
  const [aberto, setAberto] = useState(comando.tudoAberto);
  useEffect(() => {
    if (comando.versao > 0) setAberto(comando.tudoAberto);
    // obedece só quando chega um comando novo (versao muda)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comando.versao]);
  const status = no.status as StatusCurso;
  const corStatus = coresStatus(status, cores);
  const temFilhos = no.diretas > 0;
  const apagado = !!cursoId && no.curso_id !== cursoId;
  const totalRede = Number(no.total_rede);
  const diretas = Number(no.diretas);

  return (
    <View style={{ paddingLeft: RAMO }}>
      {/* linhas do galho: vertical (até o meio se for o último) + traço até o avatar */}
      <View
        style={[
          estilos.vertical,
          { backgroundColor: cores.bordaForte },
          ultimo ? { height: CENTRO + ESPESSURA / 2 } : { bottom: 0 },
        ]}
      />
      <View style={[estilos.horizontal, { backgroundColor: cores.bordaForte }]} />

      <View style={[estilos.linha, { opacity: apagado ? 0.45 : 1 }]}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${no.nome}, ${rotuloStatus[status]}. Abrir ficha`}
          onPress={() => router.push({ pathname: '/pessoas/[id]', params: { id: no.id } })}
          style={({ pressed }) => [
            estilos.conteudo,
            { borderRadius: raio.md, backgroundColor: pressed ? cores.superficieSuave : 'transparent' },
          ]}
        >
          <View
            style={[
              estilos.avatar,
              { borderColor: corStatus.forte, backgroundColor: no.excluido ? cores.superficieSuave : corStatus.suave },
            ]}
          >
            <Texto variante="legenda" negrito cor={no.excluido ? cores.textoSuave : corStatus.forte}>
              {no.excluido ? '–' : iniciais(no.nome) || '?'}
            </Texto>
          </View>

          <View style={estilos.textos}>
            <Texto negrito numberOfLines={1} suave={no.excluido}>
              {no.nome}
            </Texto>
            <View style={estilos.detalhes}>
              <Texto variante="legenda" cor={corStatus.forte} numberOfLines={1}>
                {rotuloStatus[status]}
              </Texto>
              {mostrarCurso ? <Etiqueta texto={no.curso_nome} /> : null}
            </View>
          </View>
        </Pressable>

        {temFilhos ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              aberto
                ? `Fechar indicações de ${no.nome}`
                : `Abrir indicações de ${no.nome}: trouxe ${diretas}, rede de ${totalRede}`
            }
            accessibilityState={{ expanded: aberto }}
            onPress={() => setAberto((v) => !v)}
            hitSlop={6}
            style={({ pressed }) => [
              estilos.contador,
              {
                borderRadius: raio.pilula,
                backgroundColor: aberto ? cores.destaque : cores.destaqueSuave,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Texto variante="legenda" negrito cor={aberto ? cores.destaqueTexto : cores.destaque} numberOfLines={1}>
              {telaPequena
                ? `+${diretas}`
                : totalRede > diretas
                  ? `trouxe ${diretas} · rede ${totalRede}`
                  : `trouxe ${diretas}`}
            </Texto>
            <Ionicons
              name={aberto ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={aberto ? cores.destaqueTexto : cores.destaque}
            />
          </Pressable>
        ) : null}
      </View>

      {aberto ? (
        <View style={{ marginLeft: CENTRO_AVATAR - RAMO - ESPESSURA / 2 }}>
          <GalhoArvore paiId={no.id} cursoId={cursoId} mostrarCurso={mostrarCurso} />
        </View>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  vertical: { position: 'absolute', left: 0, top: 0, width: ESPESSURA },
  horizontal: { position: 'absolute', left: 0, top: CENTRO - ESPESSURA / 2, width: RAMO + RECUO_CONTEUDO - 2, height: ESPESSURA },
  linha: { flexDirection: 'row', alignItems: 'center', minHeight: ALTURA_LINHA, gap: 8 },
  conteudo: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: RECUO_CONTEUDO,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // em galhos fundos o nome tem prioridade; etiqueta e contador encolhem antes
  textos: { flex: 1, minWidth: 72, gap: 2 },
  detalhes: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  contador: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, minHeight: 32, flexShrink: 1 },
});
