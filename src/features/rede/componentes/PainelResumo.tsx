import { StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui";
import { useTema } from "@/theme/useTema";
import type { ResumoRede } from "../rede";

/**
 * Cartão principal "Meu impacto no Elos": 6 números da rede.
 * Cada card usa uma situação do curso já existente no banco:
 *   concluído → vidas resgatadas, matriculado → apresentações,
 *   só cadastro → contatos, total da rede → indicações,
 *   nível 1 → diretas, nível 2+ → indiretas (diretas + indiretas = indicações).
 */
export function ImpactoElos({ resumo }: { resumo: ResumoRede }) {
  const { cores, raio, espaco } = useTema();
  return (
    <View
      style={{
        backgroundColor: cores.heroi,
        borderRadius: raio.xl,
        padding: espaco.xl,
        gap: espaco.lg,
      }}
    >
      <Texto variante="subtitulo" negrito cor={cores.heroiTexto}>
        Meu impacto no Elos
      </Texto>
      <View style={estilos.grade}>
        <BlocoNumero
          rotulo="Vidas resgatadas"
          valor={resumo.concluidos}
          legenda="Pessoas que fizeram o treinamento"
        />
        <BlocoNumero
          rotulo="Apresentações"
          valor={resumo.matriculados}
          legenda="Pessoas que participaram da apresentação"
        />
        <BlocoNumero
          rotulo="Contatos"
          valor={resumo.cadastrados}
          legenda="Pessoas que vamos entrar em contato"
        />
        <BlocoNumero
          rotulo="Indicações Totais"
          valor={resumo.total}
          legenda="Pessoas que chegaram por indicação"
        />
        <BlocoNumero
          rotulo="Indicaçoes Diretas"
          valor={resumo.diretas}
          legenda="Pessoas que eu indiquei"
        />
        <BlocoNumero
          rotulo="Indicaçoes Indiretas"
          valor={resumo.indiretas}
          legenda="Pessoas que vieram pelos meus indicados"
        />
      </View>
    </View>
  );
}

function BlocoNumero({
  rotulo,
  valor,
  legenda,
}: {
  rotulo: string;
  valor: number;
  legenda: string;
}) {
  const { cores, raio } = useTema();
  return (
    <View
      style={[
        estilos.bloco,
        { borderRadius: raio.md, backgroundColor: "rgba(255,255,255,0.16)" },
      ]}
    >
      <Texto variante="legenda" negrito cor={cores.heroiTexto}>
        {rotulo}
      </Texto>
      <Texto variante="titulo" cor={cores.heroiTexto}>
        {valor}
      </Texto>
      <Texto
        variante="legenda"
        cor={cores.heroiTexto}
        style={{ opacity: 0.85 }}
      >
        {legenda}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  // 2 colunas; cada card ocupa ~metade e cresce para preencher a linha
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bloco: { flexGrow: 1, flexBasis: "40%", padding: 12, gap: 2 },
});
