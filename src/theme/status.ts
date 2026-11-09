import type { Enums } from '@/types/database';
import type { Paleta } from './tokens';

export type StatusCurso = Enums<'status_curso'>;

export const STATUS_CURSO: readonly StatusCurso[] = ['cadastrado', 'matriculado', 'concluido'];

export const rotuloStatus: Record<StatusCurso, string> = {
  cadastrado: 'Só cadastro',
  matriculado: 'Apresentação',
  concluido: 'Concluiu',
};

export function coresStatus(status: StatusCurso, cores: Paleta) {
  switch (status) {
    case 'concluido':
      return { forte: cores.concluido, suave: cores.concluidoSuave };
    case 'matriculado':
      return { forte: cores.matriculado, suave: cores.matriculadoSuave };
    default:
      return { forte: cores.cadastrado, suave: cores.cadastradoSuave };
  }
}
