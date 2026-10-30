import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

type Props = TextInputProps & {
  rotulo: string;
  erro?: string;
  ajuda?: string;
};

/** Campo de texto com rótulo, ajuda e mensagem de erro acessíveis. */
export const Campo = forwardRef<TextInput, Props>(function Campo(
  { rotulo, erro, ajuda, multiline, style, onFocus, onBlur, ...resto },
  ref,
) {
  const { cores, raio, fonte } = useTema();
  const [focado, setFocado] = useState(false);

  return (
    <View style={estilos.grupo}>
      <Texto variante="pequeno" negrito>
        {rotulo}
      </Texto>
      <TextInput
        ref={ref}
        accessibilityLabel={rotulo}
        accessibilityHint={erro ?? ajuda}
        placeholderTextColor={cores.textoSuave}
        multiline={multiline}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        style={[
          {
            minHeight: multiline ? 96 : 50,
            paddingHorizontal: 14,
            paddingVertical: multiline ? 12 : 0,
            borderRadius: raio.md,
            borderWidth: focado ? 1.5 : 1,
            borderColor: erro ? cores.perigo : focado ? cores.destaque : cores.bordaForte,
            backgroundColor: cores.superficie,
            color: cores.texto,
            fontSize: fonte.tamanho.corpo,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...resto}
      />
      {erro ? (
        <Texto variante="legenda" cor={cores.perigo} accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      ) : ajuda ? (
        <Texto variante="legenda" suave>
          {ajuda}
        </Texto>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  grupo: { gap: 6 },
});
