import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Avatar, Cartao, Carregando, MensagemErro, Texto } from '@/components/ui';
import { useTema } from '@/theme/useTema';
import { useRanking } from '../rede';

export function Ranking({ cursoId }: { cursoId: string | null }) {
  const { cores } = useTema();
  const { data, isPending, error, refetch } = useRanking(cursoId);

  return (
    <Cartao titulo="Quem mais trouxe pessoas">
      {isPending ? <Carregando /> : null}
      {error ? <MensagemErro erro={error} aoTentar={refetch} /> : null}
      {data && !data.length ? (
        <Texto variante="pequeno" suave>
          Quando seus indicados trouxerem outras pessoas, o ranking aparece aqui.
        </Texto>
      ) : null}
      {data?.map((r, i) => (
        <Link key={r.pessoa_id} href={{ pathname: '/pessoas/[id]', params: { id: r.pessoa_id } }} asChild>
          <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}>
            <Texto variante="pequeno" suave style={{ width: 16 }}>
              {i + 1}
            </Texto>
            <Avatar nome={r.nome} tamanho={32} />
            <View style={{ flex: 1 }}>
              <Texto negrito numberOfLines={1}>
                {r.nome}
              </Texto>
              <Texto variante="legenda" suave>
                {r.diretas} diretas · {r.total_rede} na rede
              </Texto>
            </View>
            <Texto variante="pequeno" suave>
              <Texto variante="pequeno" negrito cor={cores.concluido}>
                {r.concluidos}
              </Texto>{' '}
              {r.concluidos === 1 ? 'concluiu' : 'concluíram'}
            </Texto>
          </Pressable>
        </Link>
      ))}
    </Cartao>
  );
}
