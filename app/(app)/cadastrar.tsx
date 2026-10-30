import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Tela } from '@/components/ui';
import { FormularioPessoa } from '@/features/pessoas/componentes/FormularioPessoa';
import { useCriarPessoa, usePessoa } from '@/features/pessoas/pessoas';

/** Cadastro de pessoa. Aceita ?indicadoPor=<id> vindo da ficha de alguém. */
export default function Cadastrar() {
  const { indicadoPor } = useLocalSearchParams<{ indicadoPor?: string }>();
  const indicador = usePessoa(indicadoPor);
  const criar = useCriarPessoa();
  // trocar a chave recria o formulário limpo depois de salvar
  const [versao, setVersao] = useState(0);

  const carregandoIndicador = !!indicadoPor && indicador.isPending;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela titulo="Cadastrar pessoa">
        {carregandoIndicador ? null : (
          <FormularioPessoa
            key={`${versao}-${indicadoPor ?? 'topo'}`}
            rotuloSalvar="Salvar cadastro"
            valoresIniciais={{ indicadoPorId: indicador.data?.pessoa.id ?? null }}
            nomeIndicadorInicial={indicador.data?.pessoa.nome}
            salvando={criar.isPending}
            erro={criar.error}
            aoSalvar={(dados) =>
              criar.mutate(dados, {
                onSuccess: (nova) => {
                  setVersao((v) => v + 1);
                  criar.reset();
                  router.setParams({ indicadoPor: undefined });
                  router.push({ pathname: '/pessoas/[id]', params: { id: nova.id } });
                },
              })
            }
          />
        )}
      </Tela>
    </KeyboardAvoidingView>
  );
}
