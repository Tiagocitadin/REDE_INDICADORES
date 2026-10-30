import { GrupoChips } from '@/components/ui';
import { useCursos } from './cursos';

/** Chips "Todos os cursos / Curso A / Curso B…" reutilizados em várias telas */
export function FiltroCurso({ valor, aoMudar }: { valor: string | null; aoMudar: (id: string | null) => void }) {
  const { data } = useCursos();
  if (!data || data.length < 2) return null;
  return (
    <GrupoChips<string | null>
      valor={valor}
      aoMudar={aoMudar}
      opcoes={[{ valor: null, rotulo: 'Todos os cursos' }, ...data.map((c) => ({ valor: c.id, rotulo: c.nome }))]}
    />
  );
}
