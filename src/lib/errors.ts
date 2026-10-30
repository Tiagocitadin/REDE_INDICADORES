/**
 * Traduz erros do Supabase/Postgres para mensagens claras em português.
 * As mensagens dizem o que aconteceu e o que fazer.
 */
type ErroBanco = { code?: string; message?: string; details?: string };

export class ErroApp extends Error {
  constructor(
    message: string,
    public readonly codigo?: string,
  ) {
    super(message);
    this.name = 'ErroApp';
  }
}

export function traduzirErro(erro: unknown): ErroApp {
  if (erro instanceof ErroApp) return erro;

  const e = (erro ?? {}) as ErroBanco;
  const texto = `${e.message ?? ''} ${e.details ?? ''}`;

  switch (e.code) {
    case '23505':
      if (texto.includes('email')) return new ErroApp('Já existe uma pessoa com este e-mail.', e.code);
      if (texto.includes('telefone')) return new ErroApp('Já existe uma pessoa com este telefone.', e.code);
      if (texto.includes('cursos_nome')) return new ErroApp('Já existe um curso com este nome.', e.code);
      return new ErroApp('Este registro já existe.', e.code);
    case '23503':
      if (texto.includes('cursos')) return new ErroApp('Este curso tem pessoas ligadas a ele. Desative-o em vez de apagar.', e.code);
      return new ErroApp('Quem indicou não foi encontrado. Escolha outra pessoa.', e.code);
    case '23514':
      if (texto.includes('circular')) return new ErroApp(e.message ?? 'Indicação circular não permitida.', e.code);
      return new ErroApp('Algum campo está em formato inválido. Confira telefone e e-mail.', e.code);
    case '42501':
      return new ErroApp('Você não tem permissão para fazer isso.', e.code);
    case '54000':
      return new ErroApp(e.message ?? 'Limite atingido.', e.code);
    case 'PGRST116':
      return new ErroApp('Registro não encontrado.', e.code);
  }

  if (texto.includes('Invalid login credentials')) return new ErroApp('E-mail ou senha incorretos.');
  if (texto.includes('Email not confirmed')) return new ErroApp('Confirme seu e-mail pelo link que enviamos antes de entrar.');
  if (texto.includes('User already registered')) return new ErroApp('Este e-mail já tem conta. Use "Entrar".');
  if (texto.includes('Password should be')) return new ErroApp('A senha precisa ter pelo menos 8 caracteres, com letras e números.');
  if (texto.toLowerCase().includes('network') || texto.includes('Failed to fetch')) {
    return new ErroApp('Sem conexão com o servidor. Verifique a internet e tente de novo.');
  }

  return new ErroApp(e.message || 'Algo deu errado. Tente de novo.', e.code);
}

/**
 * Lança o erro traduzido se a resposta do Supabase tiver erro;
 * senão devolve os dados já sem o "null" (o Supabase só manda null junto com erro).
 */
export function garantir<T>(resposta: { data: T | null; error: unknown }): T {
  if (resposta.error) throw traduzirErro(resposta.error);
  return resposta.data as T;
}
