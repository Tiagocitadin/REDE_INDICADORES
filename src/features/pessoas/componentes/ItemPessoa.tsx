import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Etiqueta, SeloStatus, Texto } from '@/components/ui';
import { useTema } from '@/theme/useTema';
import type { PessoaResumo } from '../pessoas';

type Props = { pessoa: PessoaResumo; nomeCurso?: string };

export const ItemPessoa = memo(function ItemPessoa({ pessoa, nomeCurso }: Props) {
  const { cores, raio } = useTema();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${pessoa.nome}, nível ${pessoa.nivel}`}
      onPress={() => router.push({ pathname: '/pessoas/[id]', params: { id: pessoa.id } })}
      style={({ pressed }) => [
        estilos.item,
        { backgroundColor: pressed ? cores.superficieSuave : cores.superficie, borderRadius: raio.md },
      ]}
    >
      <Avatar nome={pessoa.nome} />
      <View style={{ flex: 1, gap: 4 }}>
        <Texto negrito numberOfLines={1}>
          {pessoa.nome}
        </Texto>
        <View style={estilos.etiquetas}>
          <SeloStatus status={pessoa.status} />
          {nomeCurso ? <Etiqueta texto={nomeCurso} /> : null}
          <Texto variante="legenda" suave>
            {pessoa.nivel === 1 ? 'Direta' : `Indireta · nível ${pessoa.nivel}`}
          </Texto>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
    </Pressable>
  );
});

const estilos = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 64 },
  etiquetas: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
});
