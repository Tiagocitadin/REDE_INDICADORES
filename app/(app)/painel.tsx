import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Botao, Carregando, MensagemErro, Tela, Vazio } from '@/components/ui';
import { FiltroCurso } from '@/features/cursos/FiltroCurso';
import { ImpactoElos } from '@/features/rede/componentes/PainelResumo';
import { Ranking } from '@/features/rede/componentes/Ranking';
import { useResumoRede } from '@/features/rede/rede';

export default function Painel() {
  const [cursoId, setCursoId] = useState<string | null>(null);
  const resumo = useResumoRede(null, cursoId);

  return (
    <Tela titulo="Minha rede" atualizando={resumo.isRefetching} aoAtualizar={resumo.refetch}>
      <FiltroCurso valor={cursoId} aoMudar={setCursoId} />

      {resumo.isPending ? <Carregando /> : null}
      {resumo.error ? <MensagemErro erro={resumo.error} aoTentar={resumo.refetch} /> : null}

      {resumo.data && resumo.data.total === 0 && !cursoId ? (
        <Vazio
          titulo="Sua rede ainda está vazia"
          texto="Cadastre a primeira pessoa que você indicou. Depois, quem ela indicar entra abaixo dela."
          acao={<Botao titulo="Cadastrar pessoa" icone="person-add-outline" aoPressionar={() => router.push('/cadastrar')} />}
        />
      ) : resumo.data ? (
        <View style={{ gap: 16 }}>
          <ImpactoElos resumo={resumo.data} />
          <Ranking cursoId={cursoId} />
        </View>
      ) : null}
    </Tela>
  );
}