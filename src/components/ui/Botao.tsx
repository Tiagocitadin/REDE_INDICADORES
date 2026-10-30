import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { ALVO_TOQUE } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma' | 'tracejado';

type Props = {
  titulo: string;
  aoPressionar?: () => void;
  variante?: Variante;
  icone?: ComponentProps<typeof Ionicons>['name'];
  carregando?: boolean;
  desabilitado?: boolean;
  compacto?: boolean;
  style?: ViewStyle;
  rotuloAcessivel?: string;
};

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  icone,
  carregando,
  desabilitado,
  compacto,
  style,
  rotuloAcessivel,
}: Props) {
  const { cores, raio } = useTema();
  const inativo = desabilitado || carregando;

  const aparencia: Record<Variante, { fundo: string; texto: string; borda: string; tracejado?: boolean }> = {
    primario: { fundo: cores.destaque, texto: cores.destaqueTexto, borda: cores.destaque },
    secundario: { fundo: cores.superficie, texto: cores.texto, borda: cores.borda },
    perigo: { fundo: cores.perigoSuave, texto: cores.perigo, borda: cores.perigoSuave },
    fantasma: { fundo: 'transparent', texto: cores.destaque, borda: 'transparent' },
    tracejado: { fundo: 'transparent', texto: cores.destaque, borda: cores.destaque, tracejado: true },
  };
  const a = aparencia[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: !!inativo, busy: !!carregando }}
      onPress={aoPressionar}
      disabled={inativo}
      style={({ pressed }) => [
        estilos.base,
        {
          minHeight: compacto ? 40 : 52,
          paddingHorizontal: compacto ? 14 : 20,
          backgroundColor: a.fundo,
          borderColor: a.borda,
          borderStyle: a.tracejado ? 'dashed' : 'solid',
          borderWidth: a.tracejado ? 1.5 : 1,
          borderRadius: raio.md,
          opacity: inativo ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={a.texto} />
      ) : (
        <View style={estilos.linha}>
          {icone ? <Ionicons name={icone} size={18} color={a.texto} /> : null}
          <Texto variante={compacto ? 'pequeno' : 'corpo'} negrito cor={a.texto}>
            {titulo}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', minWidth: ALVO_TOQUE },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
