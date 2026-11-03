import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Botao,
  Carregando,
  Cartao,
  Confirmacao,
  Etiqueta,
  MensagemErro,
  PontoStatus,
  SeloStatus,
  Tela,
  Texto,
} from '@/components/ui';
import { useNomesCursos } from '@/features/cursos/cursos';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useAnonimizarPessoa, usePessoa } from '@/features/pessoas/pessoas';
import { useFilhos, useResumoRede } from '@/features/rede/rede';
import { formatarData, formatarTelefone } from '@/lib/format';
import { rotuloStatus, type StatusCurso } from '@/theme/status';
import { useTema } from '@/theme/useTema';

function Linha({ rotulo, valor, aoPressionar }: { rotulo: string; valor: string; aoPressionar?: () => void }) {
  const { cores } = useTema();
  return (
    <View style={[estilos.linha, { borderBottomColor: cores.borda }]}>
      <Texto variante="pequeno" suave>
        {rotulo}
      </Texto>
      {aoPressionar ? (
        <Pressable accessibilityRole="link" onPress={aoPressionar} hitSlop={8} style={{ flexShrink: 1 }}>
          <Texto negrito cor={cores.destaque} numberOfLines={1}>
            {valor}
          </Texto>
        </Pressable>
      ) : (
        <Texto negrito selectable style={{ flexShrink: 1, textAlign: 'right' }}>
          {valor}
        </Texto>
      )}
    </View>
  );
}

export default function FichaPessoa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cores, telaPequena } = useTema();
  const { podeGerenciar } = useOrganizacao();
  const nomesCursos = useNomesCursos();
  const ficha = usePessoa(id);
  const resumo = useResumoRede(id ?? null);
  const filhos = useFilhos(id ?? null, !!id);
  const anonimizar = useAnonimizarPessoa();
  const [confirmando, setConfirmando] = useState(false);

  const voltar = () => (router.canGoBack() ? router.back() : router.replace('/pessoas'));

  if (ficha.isPending) {
    return (
      <Tela>
        <Carregando />
      </Tela>
    );
  }
  if (ficha.error || !ficha.data) {
    return (
      <Tela titulo="Ficha">
        <MensagemErro erro={ficha.error} aoTentar={ficha.refetch} />
        <Botao titulo="Voltar" variante="secundario" aoPressionar={voltar} />
      </Tela>
    );
  }

  const { pessoa, caminho } = ficha.data;
  const indicador = caminho[caminho.length - 1];
  const removida = !!pessoa.excluido_em;
  const primeiroNome = pessoa.nome.split(' ')[0] ?? pessoa.nome;

  return (
    <Tela atualizando={ficha.isRefetching} aoAtualizar={() => Promise.all([ficha.refetch(), resumo.refetch(), filhos.refetch()])}>
      <View style={estilos.topo}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={voltar} hitSlop={10} style={estilos.voltar}>
          <Ionicons name="chevron-back" size={24} color={cores.texto} />
        </Pressable>
        {!removida ? (
          <Botao
            titulo="Editar"
            variante="secundario"
            compacto
            aoPressionar={() => router.push({ pathname: '/pessoas/editar/[id]', params: { id: pessoa.id } })}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar nome={pessoa.nome} tamanho={telaPequena ? 48 : 60} />
        <View style={{ flex: 1, gap: 6 }}>
          <Texto variante="titulo" accessibilityRole="header">
            {pessoa.nome}
          </Texto>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <SeloStatus status={pessoa.status} />
            <Etiqueta texto={nomesCursos.get(pessoa.curso_id) ?? 'Curso'} />
            <Etiqueta texto={pessoa.nivel === 1 ? 'Direta · nível 1' : `Indireta · nível ${pessoa.nivel}`} />
          </View>
        </View>
      </View>

      <Cartao style={{ gap: 0, paddingVertical: 4 }}>
        {!removida ? (
          <>
            <Linha rotulo="Telefone" valor={formatarTelefone(pessoa.telefone) || '—'} />
            <Linha rotulo="E-mail" valor={pessoa.email ?? '—'} />
          </>
        ) : null}
        <Linha
          rotulo="Indicado por"
          valor={indicador ? indicador.nome : 'Você (direta)'}
          aoPressionar={
            indicador ? () => router.push({ pathname: '/pessoas/[id]', params: { id: indicador.id } }) : undefined
          }
        />
        <Linha rotulo="Curso feito" valor={nomesCursos.get(pessoa.curso_id) ?? '—'} />
        <Linha rotulo="Cadastrado em" valor={formatarData(pessoa.criado_em)} />
      </Cartao>

      {caminho.length > 1 ? (
        <Cartao titulo="Caminho na árvore">
          <Texto variante="pequeno" suave>
            Você › {caminho.map((c) => c.nome).join(' › ')} › {primeiroNome}
          </Texto>
        </Cartao>
      ) : null}

      {pessoa.descricao ? (
        <Cartao titulo="Descrição">
          <Texto selectable>{pessoa.descricao}</Texto>
        </Cartao>
      ) : null}

      <Cartao titulo={`Rede de ${primeiroNome}`}>
        {resumo.data ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Numero valor={resumo.data.diretas} rotulo="diretas (indicou)" />
            <Numero valor={resumo.data.indiretas} rotulo="indiretas abaixo" />
            <Numero valor={resumo.data.concluidos} rotulo="concluíram" cor={cores.concluido} />
          </View>
        ) : (
          <Carregando />
        )}
        {filhos.data?.map((f) => (
          <Pressable
            key={f.id}
            accessibilityRole="link"
            onPress={() => router.push({ pathname: '/pessoas/[id]', params: { id: f.id } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 }}
          >
            <PontoStatus status={f.status as StatusCurso} />
            <Texto style={{ flex: 1 }} numberOfLines={1}>
              {f.nome}
            </Texto>
            <Texto variante="legenda" suave numberOfLines={1} style={{ flexShrink: 1, maxWidth: '55%', textAlign: 'right' }}>
              {f.curso_nome} · {rotuloStatus[f.status as StatusCurso]}
            </Texto>
          </Pressable>
        ))}
      </Cartao>

      {!removida ? (
        <Botao
          titulo={`Cadastrar alguém indicado por ${primeiroNome}`}
          variante="tracejado"
          icone="person-add-outline"
          aoPressionar={() => router.push({ pathname: '/cadastrar', params: { indicadoPor: pessoa.id } })}
        />
      ) : null}

      {podeGerenciar && !removida ? (
        <Botao titulo="Apagar dados pessoais (LGPD)" variante="perigo" compacto aoPressionar={() => setConfirmando(true)} />
      ) : null}

      {anonimizar.error ? <MensagemErro erro={anonimizar.error} /> : null}

      <Confirmacao
        visivel={confirmando}
        titulo="Apagar dados pessoais?"
        texto={`Nome, telefone, e-mail e descrição de ${pessoa.nome} serão apagados para sempre. A posição na árvore continua, para não quebrar a rede de quem veio depois.`}
        rotuloConfirmar="Apagar dados"
        perigo
        carregando={anonimizar.isPending}
        aoCancelar={() => setConfirmando(false)}
        aoConfirmar={() => anonimizar.mutate(pessoa.id, { onSettled: () => setConfirmando(false) })}
      />
    </Tela>
  );
}

function Numero({ valor, rotulo, cor }: { valor: number; rotulo: string; cor?: string }) {
  const { cores, raio } = useTema();
  return (
    <View style={{ flexGrow: 1, flexBasis: 90, backgroundColor: cores.fundo, borderRadius: raio.md, padding: 10 }}>
      <Texto variante="titulo" cor={cor}>
        {valor}
      </Texto>
      <Texto variante="legenda" suave>
        {rotulo}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voltar: { width: 44, height: 44, justifyContent: 'center' },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
