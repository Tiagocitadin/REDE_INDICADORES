/** Funções de formatação reutilizadas em todo o app. */

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** 48999990001 -> (48) 99999-0001 */
export function formatarTelefone(valor: string | null | undefined): string {
  const d = somenteDigitos(valor ?? '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return valor ?? '';
}

/** Máscara enquanto a pessoa digita */
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function plural(qtd: number, singular: string, pluralTexto: string): string {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
}
