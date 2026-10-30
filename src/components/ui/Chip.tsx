import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

type ChipProps = { rotulo: string; selecionado?: boolean; aoPressionar?: () => void };

export function Chip({ rotulo, selecionado, aoPressionar }: ChipProps) {
  const { cores, raio } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selecionado }}
      onPress={aoPressionar}
      style={({ pressed }) => [
        estilos.chip,
        {
          borderRadius: raio.pilula,
          backgroundColor: selecionado ? cores.texto : cores.superficie,
          borderColor: selecionado ? cores.texto : cores.borda,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Texto variante="pequeno" negrito cor={selecionado ? cores.fundo : cores.texto}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

type Opcao<T> = { valor: T; rotulo: string };

/** Fileira de filtros com rolagem horizontal (ex.: cursos) */
export function GrupoChips<T>({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: Opcao<T>[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.grupo}>
      {opcoes.map((o) => (
        <Chip key={String(o.valor)} rotulo={o.rotulo} selecionado={o.valor === valor} aoPressionar={() => aoMudar(o.valor)} />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  chip: { minHeight: 36, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1 },
  grupo: { gap: 8, paddingRight: 8 },
});
