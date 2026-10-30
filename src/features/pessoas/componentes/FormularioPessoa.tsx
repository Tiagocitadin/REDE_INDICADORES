import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  Avatar,
  Aviso,
  Botao,
  CaixaMarcacao,
  Campo,
  MensagemErro,
  Seletor,
  Segmentado,
  type OpcaoSeletor,
} from '@/components/ui';
import { mascararTelefone } from '@/lib/format';
import { STATUS_CURSO, rotuloStatus } from '@/theme/status';
import { useCursos } from '../../cursos/cursos';
import { esquemaPessoa, type DadosPessoa, type EntradaPessoa } from '../esquema';
import { ErroDuplicada, useBuscaIndicador } from '../pessoas';

const TOPO = '__topo__';

type Props = {
  valoresIniciais?: Partial<EntradaPessoa>;
  /** nome de quem indicou (quando já vem escolhido) */
  nomeIndicadorInicial?: string;
  /** id da própria pessoa (na edição, ela não pode indicar a si mesma) */
  idEditando?: string;
  rotuloSalvar: string;
  salvando: boolean;
  erro: unknown;
  aoSalvar: (dados: DadosPessoa) => void;
};

/** Formulário de pessoa, usado no cadastro e na edição. */
export function FormularioPessoa({
  valoresIniciais,
  nomeIndicadorInicial,
  idEditando,
  rotuloSalvar,
  salvando,
  erro,
  aoSalvar,
}: Props) {
  const { data: cursos } = useCursos();
  const [busca, setBusca] = useState('');
  const indicadores = useBuscaIndicador(busca);
  const [nomeIndicador, setNomeIndicador] = useState(nomeIndicadorInicial);

  const { control, handleSubmit, formState } = useForm<EntradaPessoa, unknown, DadosPessoa>({
    resolver: zodResolver(esquemaPessoa),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      cursoId: '',
      status: 'cadastrado',
      indicadoPorId: null,
      descricao: '',
      consentimento: false,
      ...valoresIniciais,
    },
  });
  const e = formState.errors;

  const opcoesCursos: OpcaoSeletor[] = useMemo(
    () => (cursos ?? []).filter((c) => c.ativo || c.id === valoresIniciais?.cursoId).map((c) => ({ valor: c.id, rotulo: c.nome })),
    [cursos, valoresIniciais?.cursoId],
  );

  const opcoesIndicador: OpcaoSeletor[] = useMemo(
    () => [
      { valor: TOPO, rotulo: 'Você (indicação direta)', detalhe: 'Fica no nível 1 da sua rede' },
      ...(indicadores.data ?? [])
        .filter((p) => p.id !== idEditando)
        .map((p) => ({ valor: p.id, rotulo: p.nome, detalhe: `Nível ${p.nivel}` })),
    ],
    [indicadores.data, idEditando],
  );

  return (
    <View style={{ gap: 16 }}>
      <Controller
        control={control}
        name="indicadoPorId"
        render={({ field }) => (
          <Seletor
            rotulo="Indicado por"
            destaque
            icone={<Avatar nome={nomeIndicador ?? 'Você'} tamanho={28} forte />}
            valor={field.value ?? TOPO}
            rotuloValor={field.value ? nomeIndicador : 'Você (indicação direta)'}
            opcoes={opcoesIndicador}
            aoBuscar={setBusca}
            buscando={indicadores.isFetching}
            aoMudar={(v) => {
              const escolhido = opcoesIndicador.find((o) => o.valor === v);
              setNomeIndicador(v === TOPO ? undefined : escolhido?.rotulo);
              field.onChange(v === TOPO ? null : v);
            }}
            ajuda={
              field.value
                ? 'Indicação indireta: entra abaixo de quem indicou.'
                : 'Indicação direta: você indicou esta pessoa.'
            }
          />
        )}
      />

      <Controller
        control={control}
        name="nome"
        render={({ field }) => (
          <Campo
            rotulo="Nome"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="words"
            autoComplete="name"
            erro={e.nome?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="telefone"
        render={({ field }) => (
          <Campo
            rotulo="Telefone"
            value={mascararTelefone(field.value)}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="(48) 99999-0000"
            erro={e.telefone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Campo
            rotulo="E-mail"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="nome@email.com"
            erro={e.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="cursoId"
        render={({ field }) => (
          <Seletor
            rotulo="Curso"
            valor={field.value || null}
            opcoes={opcoesCursos}
            aoMudar={field.onChange}
            placeholder="Escolha o curso"
            erro={e.cursoId?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Segmentado
            rotulo="Situação no curso"
            valor={field.value}
            aoMudar={field.onChange}
            opcoes={STATUS_CURSO.map((s) => ({ valor: s, rotulo: rotuloStatus[s] }))}
          />
        )}
      />

      <Controller
        control={control}
        name="descricao"
        render={({ field }) => (
          <Campo
            rotulo="Descrição"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            maxLength={2000}
            placeholder="Como conheceu o curso, interesses, observações…"
            erro={e.descricao?.message}
          />
        )}
      />

      {!idEditando ? (
        <Controller
          control={control}
          name="consentimento"
          render={({ field }) => (
            <CaixaMarcacao
              marcado={field.value}
              aoMudar={field.onChange}
              texto="A pessoa autorizou o cadastro do nome, telefone e e-mail dela (LGPD)."
              erro={e.consentimento?.message}
            />
          )}
        />
      ) : null}

      <Aviso texto="Cada pessoa faz um curso uma única vez. Se o e-mail ou telefone já estiver cadastrado, o app avisa." />

      {erro ? (
        <View style={{ gap: 8 }}>
          <MensagemErro erro={erro} />
          {erro instanceof ErroDuplicada ? (
            <Botao
              titulo={`Abrir a ficha de ${erro.existente.nome}`}
              variante="secundario"
              compacto
              aoPressionar={() => router.push({ pathname: '/pessoas/[id]', params: { id: erro.existente.id } })}
            />
          ) : null}
        </View>
      ) : null}

      <Botao titulo={rotuloSalvar} carregando={salvando} aoPressionar={handleSubmit(aoSalvar)} />
    </View>
  );
}
