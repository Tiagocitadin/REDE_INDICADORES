import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTema } from '@/theme/useTema';
import { Carregando } from './Estados';
import { Texto } from './Texto';

export type OpcaoSeletor = { valor: string; rotulo: string; detalhe?: string };

type Props = {
  rotulo: string;
  valor: string | null;
  /** Texto do valor atual (útil quando a opção vem de busca no servidor) */
  rotuloValor?: string;
  opcoes: OpcaoSeletor[];
  aoMudar: (valor: string) => void;
  placeholder?: string;
  erro?: string;
  ajuda?: string;
  /** Busca: se informado, o texto digitado é repassado (busca no servidor) */
  aoBuscar?: (texto: string) => void;
  buscando?: boolean;
  destaque?: boolean;
  icone?: ReactNode;
};

/**
 * Campo de escolha que abre uma lista (funciona igual no celular e na web).
 * Com "aoBuscar", vira uma busca no servidor para listas grandes.
 */
export function Seletor({
  rotulo,
  valor,
  rotuloValor,
  opcoes,
  aoMudar,
  placeholder = 'Escolher…',
  erro,
  ajuda,
  aoBuscar,
  buscando,
  destaque,
  icone,
}: Props) {
  const { cores, raio, fonte } = useTema();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const atual = opcoes.find((o) => o.valor === valor);
  const textoAtual = rotuloValor ?? atual?.rotulo;
  const filtradas = aoBuscar
    ? opcoes
    : opcoes.filter((o) => o.rotulo.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <View style={{ gap: 6 }}>
      <Texto variante="pequeno" negrito>
        {rotulo}
      </Texto>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${textoAtual ?? 'nada escolhido'}`}
        onPress={() => setAberto(true)}
        style={[
          estilos.campo,
          {
            borderRadius: raio.md,
            borderWidth: destaque ? 1.5 : 1,
            borderColor: erro ? cores.perigo : destaque ? cores.destaque : cores.bordaForte,
            backgroundColor: destaque ? cores.destaqueSuave : cores.superficie,
          },
        ]}
      >
        {icone}
        <Texto style={{ flex: 1 }} negrito={!!destaque} suave={!textoAtual} numberOfLines={1}>
          {textoAtual ?? placeholder}
        </Texto>
        <Ionicons name="chevron-down" size={18} color={destaque ? cores.destaque : cores.textoSuave} />
      </Pressable>
      {erro ? (
        <Texto variante="legenda" cor={cores.perigo}>
          {erro}
        </Texto>
      ) : ajuda ? (
        <Texto variante="legenda" suave>
          {ajuda}
        </Texto>
      ) : null}

      <Modal visible={aberto} animationType="slide" transparent onRequestClose={() => setAberto(false)}>
        <View style={estilos.fundoModal}>
          <SafeAreaView
            edges={['bottom']}
            style={[estilos.painel, { backgroundColor: cores.superficie, borderTopLeftRadius: raio.xl, borderTopRightRadius: raio.xl }]}
          >
            <View style={estilos.topoPainel}>
              <Texto variante="subtitulo" style={{ flex: 1 }}>
                {rotulo}
              </Texto>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setAberto(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={cores.texto} />
              </Pressable>
            </View>
            <TextInput
              value={busca}
              onChangeText={(t) => {
                setBusca(t);
                aoBuscar?.(t);
              }}
              placeholder="Buscar…"
              placeholderTextColor={cores.textoSuave}
              accessibilityLabel={`Buscar em ${rotulo}`}
              style={{
                height: 46,
                borderRadius: raio.md,
                borderWidth: 1,
                borderColor: cores.bordaForte,
                paddingHorizontal: 14,
                color: cores.texto,
                fontSize: fonte.tamanho.corpo,
                marginBottom: 8,
              }}
            />
            {buscando ? <Carregando texto="Buscando…" /> : null}
            <FlatList
              data={filtradas}
              keyExtractor={(o) => o.valor}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                buscando ? null : (
                  <Texto variante="pequeno" suave centro style={{ padding: 16 }}>
                    Nada encontrado.
                  </Texto>
                )
              }
              renderItem={({ item }) => {
                const ativo = item.valor === valor;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    onPress={() => {
                      aoMudar(item.valor);
                      setAberto(false);
                      setBusca('');
                    }}
                    style={({ pressed }) => [
                      estilos.item,
                      { borderBottomColor: cores.borda, backgroundColor: pressed ? cores.superficieSuave : 'transparent' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Texto negrito={ativo}>{item.rotulo}</Texto>
                      {item.detalhe ? (
                        <Texto variante="legenda" suave>
                          {item.detalhe}
                        </Texto>
                      ) : null}
                    </View>
                    {ativo ? <Ionicons name="checkmark" size={20} color={cores.destaque} /> : null}
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { minHeight: 50, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fundoModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  painel: { maxHeight: '80%', width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16 },
  topoPainel: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  item: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
});
