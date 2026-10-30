import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Botao, Campo, MensagemErro, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { criarOrganizacao, useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';

const esquema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto.').max(120),
  curso: z.string().trim().min(2, 'Digite o nome do primeiro curso.').max(120),
});
type Dados = z.infer<typeof esquema>;

/** Primeiro acesso: cria a organização (o topo da sua árvore) e o primeiro curso */
export default function BemVindo() {
  const { sessao, sair } = useAuth();
  const { atual, recarregar } = useOrganizacao();
  const [erro, setErro] = useState<unknown>(null);
  const { control, handleSubmit, formState } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: { nome: '', curso: '' },
  });

  if (!sessao) return <Redirect href="/entrar" />;
  if (atual) return <Redirect href="/painel" />;

  const criar = handleSubmit(async (dados) => {
    setErro(null);
    try {
      await criarOrganizacao(dados.nome, dados.curso);
      await recarregar();
      router.replace('/painel');
    } catch (e) {
      setErro(e);
    }
  });

  return (
    <Tela titulo="Vamos começar" subtitulo="Primeiro acesso">
      <View style={{ gap: 16, maxWidth: 520 }}>
        <Texto suave>
          Você fica no topo da árvore. Dê um nome para a sua rede e cadastre o primeiro curso. Depois dá para
          adicionar outros cursos em Ajustes.
        </Texto>
        <Controller
          control={control}
          name="nome"
          render={({ field }) => (
            <Campo
              rotulo="Nome da rede"
              placeholder="Ex.: Rede do Tiago"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              erro={formState.errors.nome?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="curso"
          render={({ field }) => (
            <Campo
              rotulo="Primeiro curso"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              erro={formState.errors.curso?.message}
            />
          )}
        />
        {erro ? <MensagemErro erro={erro} /> : null}
        <Botao titulo="Criar minha rede" carregando={formState.isSubmitting} aoPressionar={criar} />
        <Botao titulo="Sair" variante="fantasma" compacto aoPressionar={sair} />
      </View>
    </Tela>
  );
}
