import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Cartao, PontoStatus, Tela, Texto } from '@/components/ui';
import { FiltroCurso } from '@/features/cursos/FiltroCurso';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { GalhoArvore } from '@/features/rede/componentes/NoArvore';
import { useResumoRede } from '@/features/rede/rede';
import { STATUS_CURSO, rotuloStatus } from '@/theme/status';
import { useTema } from '@/theme/useTema';

export default function Arvore() {
  const { atual } = useOrganizacao();
  const { cores } = useTema();
  const [cursoId, setCursoId] = useState<string | null>(null);
  const resumo = useResumoRede(null);

  return (
    <Tela titulo="Árvore" subtitulo="Quem indicou quem">
      <FiltroCurso valor={cursoId} aoMudar={setCursoId} />

      <Cartao>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar nome="Eu" forte />
          <View style={{ flex: 1 }}>
            <Texto negrito>Você</Texto>
            <Texto variante="legenda" suave>
              {atual?.nome}
            </Texto>
          </View>
          {resumo.data ? (
            <Texto variante="pequeno" suave>
              rede de {resumo.data.total}
            </Texto>
          ) : null}
        </View>
        <Texto variante="rotulo" cor={cores.destaque}>
          Diretas ↓ · indiretas abaixo delas
        </Texto>
        <View style={{ borderLeftWidth: 2, borderLeftColor: cores.borda, marginLeft: 17, paddingLeft: 6 }}>
          <GalhoArvore paiId={null} cursoId={cursoId} />
        </View>
      </Cartao>

      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        {STATUS_CURSO.map((s) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <PontoStatus status={s} />
            <Texto variante="legenda" suave>
              {rotuloStatus[s]}
            </Texto>
          </View>
        ))}
      </View>
    </Tela>
  );
}
