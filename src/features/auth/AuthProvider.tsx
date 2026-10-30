import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

type Contexto = {
  sessao: Session | null;
  carregando: boolean;
  sair: () => Promise<void>;
};

const AuthContexto = createContext<Contexto | null>(null);

/** Mantém a sessão de login atualizada para o app inteiro. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSessao(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      // trocou de usuário ou saiu: limpa todo o cache de dados
      if (!novaSessao) queryClient.clear();
    });

    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<Contexto>(
    () => ({
      sessao,
      carregando,
      sair: async () => {
        await supabase.auth.signOut();
        queryClient.clear();
      },
    }),
    [sessao, carregando],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
