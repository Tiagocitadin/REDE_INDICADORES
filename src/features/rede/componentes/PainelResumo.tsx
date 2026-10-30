import { StyleSheet, View } from 'react-native';

import { Cartao, Texto } from '@/components/ui';
import { useTema } from '@/theme/useTema';
import type { ResumoRede } from '../rede';

/** Cartão principal: total da rede, diretas e indiretas */
export function DestaqueRede({ resumo, titulo }: { resumo: ResumoRede; titulo: string }) {
  const { cores, raio, espaco } = useTema();
  return (
    <View style={{ backgroundColor: cores.heroi, borderRadius: raio.xl, padding: espaco.xl, gap: espaco.lg }}>
      <View style={estilos.linhaTotal}>
        <Texto variante="destaque" cor={cores.heroiTexto}>
          {resumo.total}
        </Texto>
        <Texto variante="corpo" negrito cor={cores.heroiTexto} style={{ flex: 1 }}>
          {titulo}
        </Texto>
      </View>
      <View style={estilos.grade}>
        <BlocoNumero rotulo="Indicações diretas" valor={resumo.diretas} legenda="indicadas pessoalmente" />
        <BlocoNumero rotulo="Indicações indiretas" valor={resumo.indiretas} legenda="vieram pelos indicados" />
      </View>
    </View>
  );
}

function BlocoNumero({ rotulo, valor, legenda }: { rotulo: string; valor: number; legenda: string }) {
  const { cores, raio } = useTema();
  return (
    <View style={[estilos.bloco, { borderRadius: raio.md, backgroundColor: 'rgba(255,255,255,0.16)' }]}>
      <Texto variante="legenda" negrito cor={cores.heroiTexto}>
        {rotulo}
      </Texto>
      <Texto variante="titulo" cor={cores.heroiTexto}>
        {valor}
      </Texto>
      <Texto variante="legenda" cor={cores.heroiTexto} style={{ opacity: 0.85 }}>
        {legenda}
      </Texto>
    </View>
  );
}

/** Barra com a situação no curso (concluiu / matriculado / só cadastro) */
export function SituacaoCurso({ resumo }: { resumo: ResumoRede }) {
  const { cores } = useTema();
  const partes = [
    { rotulo: 'Concluíram', valor: resumo.concluidos, cor: cores.concluido },
    { rotulo: 'Matriculados', valor: resumo.matriculados, cor: cores.matriculado },
    { rotulo: 'Só cadastro', valor: resumo.cadastrados, cor: cores.cadastrado },
  ];
  return (
    <Cartao titulo="Situação no curso">
      <View style={[estilos.barra, { backgroundColor: cores.superficieSuave }]}>
        {resumo.total > 0
          ? partes.map((p) => (p.valor ? <View key={p.rotulo} style={{ flex: p.valor, backgroundColor: p.cor }} /> : null))
          : null}
      </View>
      <View style={estilos.legendas}>
        {partes.map((p) => (
          <View key={p.rotulo} style={{ gap: 2 }}>
            <Texto variante="subtitulo">{p.valor}</Texto>
            <View style={estilos.legendaLinha}>
              <View style={[estilos.ponto, { backgroundColor: p.cor }]} />
              <Texto variante="pequeno" suave>
                {p.rotulo}
              </Texto>
            </View>
          </View>
        ))}
      </View>
    </Cartao>
  );
}

/** Quantas pessoas em cada nível (1 = diretas, 2+ = indiretas) */
export function PorNivel({ resumo }: { resumo: ResumoRede }) {
  const { cores, raio } = useTema();
  const maior = Math.max(1, ...resumo.por_nivel.map((n) => n.total));
  if (!resumo.por_nivel.length) return null;
  return (
    <Cartao titulo="Por nível · 1 = diretas, 2+ = indiretas">
      {resumo.por_nivel.map((n) => (
        <View key={n.nivel} style={estilos.nivelLinha} accessible accessibilityLabel={`Nível ${n.nivel}: ${n.total} pessoas`}>
          <Texto variante="pequeno" suave style={{ width: 62 }}>
            Nível {n.nivel}
          </Texto>
          <View style={[estilos.trilho, { backgroundColor: cores.superficieSuave, borderRadius: raio.sm }]}>
            <View
              style={{
                width: `${Math.max(4, (n.total / maior) * 100)}%`,
                height: '100%',
                backgroundColor: n.nivel === 1 ? cores.destaque : cores.destaque + 'AA',
                borderRadius: raio.sm,
              }}
            />
          </View>
          <Texto variante="pequeno" negrito style={estilos.numeroNivel}>
            {n.total}
          </Texto>
        </View>
      ))}
    </Cartao>
  );
}

const estilos = StyleSheet.create({
  linhaTotal: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grade: { flexDirection: 'row', gap: 10 },
  bloco: { flex: 1, padding: 12, gap: 2 },
  barra: { height: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'row', gap: 2 },
  legendas: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ponto: { width: 8, height: 8, borderRadius: 4 },
  nivelLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trilho: { flex: 1, height: 10, overflow: 'hidden' },
  numeroNivel: { width: 36, textAlign: 'right', fontVariant: ['tabular-nums'] },
});