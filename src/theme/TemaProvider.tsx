import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { secureStorage } from '@/lib/secureStorage';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

type Contexto = {
  preferencia: PreferenciaTema;
  escuro: boolean;
  definir: (p: PreferenciaTema) => void;
  alternar: () => void;
};

const CHAVE = 'rede_tema';
const TemaContexto = createContext<Contexto | null>(null);

/** Guarda a escolha claro/escuro do usuário (vale no celular e na web). */
export function TemaProvider({ children }: { children: ReactNode }) {
  const doSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('sistema');

  useEffect(() => {
    secureStorage.getItem(CHAVE).then((v) => {
      if (v === 'claro' || v === 'escuro' || v === 'sistema') setPreferencia(v);
    });
  }, []);

  const escuro = preferencia === 'sistema' ? doSistema === 'dark' : preferencia === 'escuro';

  const valor = useMemo<Contexto>(() => {
    const definir = (p: PreferenciaTema) => {
      setPreferencia(p);
      secureStorage.setItem(CHAVE, p);
    };
    return { preferencia, escuro, definir, alternar: () => definir(escuro ? 'claro' : 'escuro') };
  }, [preferencia, escuro]);

  return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function usePreferenciaTema() {
  const ctx = useContext(TemaContexto);
  if (!ctx) throw new Error('usePreferenciaTema precisa estar dentro de <TemaProvider>');
  return ctx;
}