import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { cores, raio, fonte, telaLarga, alturaTela } = useTema();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');

  const fechar = () => {
    setAberto(false);
    setBusca('');
    if (busca) aoBuscar?.('');
  };

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

      <Modal
        visible={aberto}
        animationType={telaLarga ? 'fade' : 'slide'}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={fechar}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'web' ? undefined : 'padding'}
          style={[
            estilos.fundoModal,
            {
              justifyContent: telaLarga ? 'center' : 'flex-end',
              paddingTop: insets.top + 24,
              padding: telaLarga ? 24 : 0,
            },
          ]}
        >
          {/* tocar fora fecha */}
          <Pressable style={StyleSheet.absoluteFill} onPress={fechar} accessibilityLabel="Fechar" accessibilityRole="button" />
          <View
            accessibilityViewIsModal
            style={[
              estilos.painel,
              {
                backgroundColor: cores.superficie,
                borderRadius: raio.xl,
                borderBottomLeftRadius: telaLarga ? raio.xl : 0,
                borderBottomRightRadius: telaLarga ? raio.xl : 0,
                paddingBottom: telaLarga ? 16 : Math.max(16, insets.bottom + 8),
                maxHeight: telaLarga ? Math.min(640, alturaTela * 0.8) : '100%',
              },
            ]}
          >
            <View style={estilos.topoPainel}>
              <Texto variante="subtitulo" style={{ flex: 1 }}>
                {rotulo}
              </Texto>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={fechar} hitSlop={12} style={estilos.fechar}>
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
              // sem isso a lista ignora a altura máxima do painel e corta o fim
              style={{ flexShrink: 1 }}
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
                      fechar();
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { minHeight: 50, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fundoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  painel: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, flexShrink: 1 },
  topoPainel: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  item: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
});
