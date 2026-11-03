import { View } from 'react-native';

import { coresStatus, rotuloStatus, type StatusCurso } from '@/theme/status';
import { useTema } from '@/theme/useTema';
import { Texto } from './Texto';

export function PontoStatus({ status, tamanho = 10 }: { status: StatusCurso; tamanho?: number }) {
  const { cores } = useTema();
  return (
    <View
      accessibilityLabel={rotuloStatus[status]}
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        backgroundColor: coresStatus(status, cores).forte,
      }}
    />
  );
}

export function SeloStatus({ status }: { status: StatusCurso }) {
  const { cores, raio } = useTema();
  const c = coresStatus(status, cores);
  return (
    <View style={{ backgroundColor: c.suave, borderRadius: raio.pilula, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Texto variante="legenda" negrito cor={c.forte}>
        {rotuloStatus[status]}
      </Texto>
    </View>
  );
}

/** Etiqueta neutra (ex.: nome do curso, nível) */
export function Etiqueta({ texto }: { texto: string }) {
  const { cores, raio } = useTema();
  return (
    <View
      style={{
        // encolhe (com reticências) quando falta espaço na linha
        flexShrink: 1,
        borderColor: cores.borda,
        borderWidth: 1,
        borderRadius: raio.sm,
        paddingHorizontal: 6,
        paddingVertical: 1,
      }}
    >
      <Texto variante="legenda" suave numberOfLines={1}>
        {texto}
      </Texto>
    </View>
  );
}
