import { z } from 'zod';

import { somenteDigitos } from '@/lib/format';
import { STATUS_CURSO } from '@/theme/status';

/**
 * Regras do formulário de pessoa. O banco repete as mesmas regras
 * (defesa em dobro): mesmo que alguém burle o app, o dado errado não entra.
 */
export const esquemaPessoa = z
  .object({
    nome: z.string().trim().min(2, 'Digite o nome completo.').max(150, 'Nome muito longo.'),
    telefone: z
      .string()
      .transform(somenteDigitos)
      .refine((v) => v === '' || (v.length >= 10 && v.length <= 13), 'Telefone com DDD, ex.: (48) 99999-0000.'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine((v) => v === '' || z.string().email().safeParse(v).success, 'E-mail inválido.'),
    cursoId: z.string({ required_error: 'Escolha o curso.' }).min(1, 'Escolha o curso.'),
    status: z.enum(['cadastrado', 'matriculado', 'concluido']) satisfies z.ZodType<(typeof STATUS_CURSO)[number]>,
    indicadoPorId: z.string().nullable(),
    descricao: z.string().trim().max(2000, 'Descrição muito longa (máx. 2000 caracteres).'),
  })
  .refine((d) => d.telefone !== '' || d.email !== '', {
    message: 'Informe pelo menos telefone ou e-mail.',
    path: ['telefone'],
  });

export type EntradaPessoa = z.input<typeof esquemaPessoa>;
export type DadosPessoa = z.output<typeof esquemaPessoa>;
