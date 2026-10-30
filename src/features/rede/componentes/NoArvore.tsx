import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Carregando, Etiqueta, MensagemErro, PontoStatus, Texto } from '@/components/ui';
import type { StatusCurso } from '@/theme/status';
import { useTema } from '@/theme/useTema';
import { useFilhos, type NoArvore as TipoNo } from '../rede';

/** Lista os filhos de um nó. paiId nulo = indicações diretas do topo. */
export function GalhoArvore({ paiId, cursoId }: { paiId: string | null; cursoId: string | null }) {
  const { data, isPending, error, refetch } = useFilhos(paiId);
  if (isPending) return <Carregando />;
  if (error) return <MensagemErro erro={error} aoTentar={refetch} />;
  if (!data.length && paiId === null) {
    return (
      <Texto variante="pequeno" suave style={{ padding: 12 }}>
        Ninguém cadastrado ainda. Use a aba Cadastrar para incluir a primeira indicação.
      </Texto>
    );
  }
  return (
    <View>
      {data.map((no) => (
        <NoArvore key={no.id} no={no} cursoId={cursoId} />
      ))}
    </View>
  );
}

/**
 * Uma pessoa na árvore. Os filhos só são buscados quando o galho é aberto,
 * então a árvore abre rápido mesmo com milhares de pessoas.
 */
export const NoArvore = memo(function NoArvore({ no, cursoId }: { no: TipoNo; cursoId: string | null }) {
  const { cores, raio } = useTema();
  const [aberto, setAberto] = useState(false);
  const temFilhos = no.diretas > 0;
  const apagado = !!cursoId && no.curso_id !== cursoId;

  return (
    <View>
      <View style={[estilos.linha, { opacity: apagado ? 0.45 : 1 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={aberto ? `Fechar indicações de ${no.nome}` : `Abrir indicações de ${no.nome}`}
          accessibilityState={{ expanded: aberto, disabled: !temFilhos }}
          disabled={!temFilhos}
          onPress={() => setAberto((v) => !v)}
          hitSlop={8}
          style={estilos.seta}
        >
          {temFilhos ? (
            <Ionicons name={aberto ? 'chevron-down' : 'chevron-forward'} size={16} color={cores.textoSuave} />
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push({ pathname: '/pessoas/[id]', params: { id: no.id } })}
          style={({ pressed }) => [
            estilos.conteudo,
            { borderRadius: raio.md, backgroundColor: pressed ? cores.superficieSuave : 'transparent' },
          ]}
        >
          <PontoStatus status={no.status as StatusCurso} />
          <Texto negrito={temFilhos} style={estilos.nome} numberOfLines={1} suave={no.excluido}>
            {no.nome}
          </Texto>
          <Etiqueta texto={no.curso_nome} />
          {temFilhos ? (
            <View style={{ backgroundColor: cores.destaqueSuave, borderRadius: raio.pilula, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Texto variante="legenda" negrito cor={cores.destaque}>
                trouxe {no.diretas}
              </Texto>
            </View>
          ) : null}
        </Pressable>
      </View>

      {aberto ? (
        <View style={[estilos.filhos, { borderLeftColor: cores.borda }]}>
          <GalhoArvore paiId={no.id} cursoId={cursoId} />
        </View>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  seta: { width: 28, height: 44, alignItems: 'center', justifyContent: 'center' },
  conteudo: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  nome: { flexShrink: 1 },
  filhos: { marginLeft: 13, paddingLeft: 10, borderLeftWidth: 2 },
});
