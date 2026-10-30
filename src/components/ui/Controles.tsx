import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useTema } from '@/theme/useTema';
import { Botao } from './Botao';
import { Texto } from './Texto';

type Opcao<T extends string> = { valor: T; rotulo: string };

/** Escolha única entre poucas opções, lado a lado */
export function Segmentado<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  const { cores, raio } = useTema();
  return (
    <View style={{ gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
      <Texto variante="pequeno" negrito>
        {rotulo}
      </Texto>
      <View style={estilos.linha}>
        {opcoes.map((o) => {
          const ativo = o.valor === valor;
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
              onPress={() => aoMudar(o.valor)}
              style={[
                estilos.opcao,
                {
                  borderRadius: raio.md,
                  backgroundColor: ativo ? cores.texto : cores.superficie,
                  borderColor: ativo ? cores.texto : cores.bordaForte,
                },
              ]}
            >
              <Texto variante="pequeno" negrito cor={ativo ? cores.fundo : cores.texto} centro>
                {o.rotulo}
              </Texto>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CaixaMarcacao({
  marcado,
  aoMudar,
  texto,
  erro,
}: {
  marcado: boolean;
  aoMudar: (v: boolean) => void;
  texto: string;
  erro?: string;
}) {
  const { cores, raio } = useTema();
  return (
    <View style={{ gap: 4 }}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
        onPress={() => aoMudar(!marcado)}
        style={estilos.caixaLinha}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: raio.sm - 2,
            borderWidth: 1.5,
            borderColor: erro ? cores.perigo : marcado ? cores.destaque : cores.bordaForte,
            backgroundColor: marcado ? cores.destaque : cores.superficie,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {marcado ? <Ionicons name="checkmark" size={16} color={cores.destaqueTexto} /> : null}
        </View>
        <Texto variante="pequeno" style={{ flex: 1 }}>
          {texto}
        </Texto>
      </Pressable>
      {erro ? (
        <Texto variante="legenda" cor={cores.perigo}>
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

/** Confirmação dentro do app (Alert nativo não funciona na web) */
export function Confirmacao({
  visivel,
  titulo,
  texto,
  rotuloConfirmar,
  perigo,
  carregando,
  aoConfirmar,
  aoCancelar,
}: {
  visivel: boolean;
  titulo: string;
  texto: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  carregando?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}) {
  const { cores, raio } = useTema();
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoCancelar}>
      <View style={estilos.fundo}>
        <View style={[estilos.dialogo, { backgroundColor: cores.superficie, borderRadius: raio.lg }]} accessibilityViewIsModal>
          <Texto variante="subtitulo">{titulo}</Texto>
          <Texto variante="pequeno" suave>
            {texto}
          </Texto>
          <View style={estilos.botoes}>
            <Botao titulo="Cancelar" variante="secundario" compacto aoPressionar={aoCancelar} style={{ flex: 1 }} />
            <Botao
              titulo={rotuloConfirmar}
              variante={perigo ? 'perigo' : 'primario'}
              compacto
              carregando={carregando}
              aoPressionar={aoConfirmar}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 8 },
  opcao: { flex: 1, minHeight: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  caixaLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, minHeight: 44, paddingTop: 2 },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialogo: { width: '100%', maxWidth: 420, padding: 20, gap: 12 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
