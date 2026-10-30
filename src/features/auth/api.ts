import { z } from 'zod';

import { traduzirErro } from '@/lib/errors';
import { supabase } from '@/lib/supabase';

export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email('Digite um e-mail válido.'),
  senha: z.string().min(1, 'Digite sua senha.'),
});

export const esquemaCadastro = z.object({
  email: z.string().trim().toLowerCase().email('Digite um e-mail válido.'),
  senha: z
    .string()
    .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'Use pelo menos uma letra.')
    .regex(/[0-9]/, 'Use pelo menos um número.'),
});

export type DadosLogin = z.infer<typeof esquemaLogin>;

export async function entrar({ email, senha }: DadosLogin) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw traduzirErro(error);
}

/** Retorna true se precisa confirmar o e-mail antes de entrar */
export async function criarConta({ email, senha }: DadosLogin): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({ email, password: senha });
  if (error) throw traduzirErro(error);
  return !data.session;
}

export async function recuperarSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw traduzirErro(error);
}

export async function trocarSenha(novaSenha: string) {
  const r = esquemaCadastro.shape.senha.safeParse(novaSenha);
  if (!r.success) throw new Error(r.error.issues[0]?.message ?? 'Senha inválida.');
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw traduzirErro(error);
}
