import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Carregando, MensagemErro, Tela } from '@/components/ui';
import { FormularioPessoa } from '@/features/pessoas/componentes/FormularioPessoa';
import { useAtualizarPessoa, usePessoa } from '@/features/pessoas/pessoas';

export default function EditarPessoa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ficha = usePessoa(id);
  const atualizar = useAtualizarPessoa(id ?? '');

  if (ficha.isPending) {
    return (
      <Tela titulo="Editar pessoa">
        <Carregando />
      </Tela>
    );
  }
  if (ficha.error || !ficha.data) {
    return (
      <Tela titulo="Editar pessoa">
        <MensagemErro erro={ficha.error} aoTentar={ficha.refetch} />
      </Tela>
    );
  }

  const { pessoa, caminho } = ficha.data;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela titulo="Editar pessoa" subtitulo={pessoa.nome}>
        <FormularioPessoa
          idEditando={pessoa.id}
          rotuloSalvar="Salvar alterações"
          valoresIniciais={{
            nome: pessoa.nome,
            telefone: pessoa.telefone ?? '',
            email: pessoa.email ?? '',
            cursoId: pessoa.curso_id,
            status: pessoa.status,
            indicadoPorId: pessoa.indicado_por_id,
            descricao: pessoa.descricao ?? '',
          }}
          nomeIndicadorInicial={caminho[caminho.length - 1]?.nome}
          salvando={atualizar.isPending}
          erro={atualizar.error}
          aoSalvar={(dados) => atualizar.mutate(dados, { onSuccess: () => router.back() })}
        />
      </Tela>
    </KeyboardAvoidingView>
  );
}
