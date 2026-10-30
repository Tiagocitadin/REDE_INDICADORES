/**
 * Variáveis de ambiente públicas. Falha cedo e com mensagem clara
 * se alguma estiver faltando, em vez de quebrar no meio do app.
 */
function obrigatoria(nome: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Veja o arquivo .env.example.`);
  }
  return valor;
}

export const env = {
  supabaseUrl: obrigatoria('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseKey: obrigatoria('EXPO_PUBLIC_SUPABASE_KEY', process.env.EXPO_PUBLIC_SUPABASE_KEY),
} as const;
