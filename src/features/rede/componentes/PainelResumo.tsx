import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui";
import type { TipoGrupo } from "@/features/pessoas/grupos";
import { useTema } from "@/theme/useTema";
import type { ResumoRede } from "../rede";

/**
 * Cartão principal "Meu impacto no Elos": 5 números da rede, todos clicáveis.
 * Cada card abre a lista das pessoas que ele conta.
 *   concluído → vidas resgatadas (destaque, linha inteira)
 *   matriculado → apresentações · só cadastro → contatos
 *   nível 1 → diretas · nível 2+ → indiretas
 */
export function ImpactoElos({
  resumo,
  cursoId,
}: {
  resumo: ResumoRede;
  cursoId: string | null;
}) {
  const { cores, raio, espaco } = useTema();

  const abrir = (tipo: TipoGrupo) =>
    router.push({
      pathname: "/pessoas/grupo/[tipo]",
      params: { tipo, curso: cursoId ?? "" },
    });

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
          destaque
          rotulo="Vidas resgatadas"
          valor={resumo.concluidos}
          legenda="Pessoas que fizeram o treinamento"
          aoPressionar={() => abrir("vidas")}
        />
        <BlocoNumero
          rotulo="Apresentações"
          valor={resumo.matriculados}
          legenda="Pessoas que participaram da apresentação"
          aoPressionar={() => abrir("apresentacoes")}
        />
        <BlocoNumero
          rotulo="Contatos"
          valor={resumo.cadastrados}
          legenda="Pessoas que vamos entrar em contato"
          aoPressionar={() => abrir("contatos")}
        />
        <BlocoNumero
          rotulo="Indicações diretas"
          valor={resumo.diretas}
          legenda="Pessoas que eu indiquei"
          aoPressionar={() => abrir("diretas")}
        />
        <BlocoNumero
          rotulo="Indicações indiretas"
          valor={resumo.indiretas}
          legenda="Pessoas que vieram pelos meus indicados"
          aoPressionar={() => abrir("indiretas")}
        />
      </View>
    </View>
  );
}

function BlocoNumero({
  rotulo,
  valor,
  legenda,
  destaque,
  aoPressionar,
}: {
  rotulo: string;
  valor: number;
  legenda: string;
  /** ocupa a linha inteira, com número maior */
  destaque?: boolean;
  aoPressionar: () => void;
}) {
  const { cores, raio } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${rotulo}: ${valor}. Ver lista`}
      onPress={aoPressionar}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        estilos.bloco,
        destaque ? estilos.blocoDestaque : estilos.blocoMetade,
        {
          borderRadius: raio.md,
          backgroundColor: pressed
            ? "rgba(255,255,255,0.28)"
            : hovered
              ? "rgba(255,255,255,0.22)"
              : "rgba(255,255,255,0.16)",
        },
      ]}
    >
      <View style={estilos.topoBloco}>
        <Texto variante="legenda" negrito cor={cores.heroiTexto} style={{ flex: 1 }}>
          {rotulo}
        </Texto>
        <Ionicons name="chevron-forward" size={16} color={cores.heroiTexto} style={{ opacity: 0.8 }} />
      </View>
      <Texto
        variante={destaque ? "destaque" : "titulo"}
        cor={cores.heroiTexto}
      >
        {valor}
      </Texto>
      <Texto
        variante="legenda"
        cor={cores.heroiTexto}
        style={{ opacity: 0.85 }}
      >
        {legenda}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // 1 card em destaque na linha inteira + 2 linhas de 2 cards
  grade: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bloco: { padding: 12, gap: 2 },
  blocoDestaque: { flexBasis: "100%" },
  blocoMetade: { flexGrow: 1, flexBasis: "40%" },
  topoBloco: { flexDirection: "row", alignItems: "center", gap: 6 },
});
