import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { traduzirErro } from '@/lib/errors';
import { useTema } from '@/theme/useTema';
import { Botao } from './Botao';
import { Texto } from './Texto';

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  const { cores } = useTema();
  return (
    <View style={{ padding: 24, alignItems: 'center', gap: 10 }} accessibilityLiveRegion="polite">
      <ActivityIndicator color={cores.destaque} />
      <Texto variante="pequeno" suave>
        {texto}
      </Texto>
    </View>
  );
}

export function MensagemErro({ erro, aoTentar }: { erro: unknown; aoTentar?: () => void }) {
  const { cores, raio } = useTema();
  return (
    <View
      accessibilityRole="alert"
      style={{ backgroundColor: cores.perigoSuave, borderRadius: raio.md, padding: 14, gap: 10 }}
    >
      <Texto variante="pequeno" cor={cores.perigo}>
        {traduzirErro(erro).message}
      </Texto>
      {aoTentar ? <Botao titulo="Tentar de novo" variante="secundario" compacto aoPressionar={aoTentar} /> : null}
    </View>
  );
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
      <Texto variante="subtitulo" centro>
        {titulo}
      </Texto>
      {texto ? (
        <Texto variante="pequeno" suave centro style={{ maxWidth: 360 }}>
          {texto}
        </Texto>
      ) : null}
      {acao ? <View style={{ marginTop: 8 }}>{acao}</View> : null}
    </View>
  );
}

export function Aviso({ texto }: { texto: string }) {
  const { cores, raio } = useTema();
  return (
    <View style={{ backgroundColor: cores.avisoSuave, borderRadius: raio.md, padding: 12 }}>
      <Texto variante="legenda" cor={cores.aviso}>
        {texto}
      </Texto>
    </View>
  );
}
