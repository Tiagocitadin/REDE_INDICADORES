import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Botao, Cartao, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { nomeDaConta, primeiroNome } from '@/features/auth/api';
import { useCursos } from '@/features/cursos/cursos';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import {
  ExpansaoArvore,
  GalhoArvore,
  recuoGalho,
  type ComandoExpansao,
} from '@/features/rede/componentes/NoArvore';
import { useResumoRede } from '@/features/rede/rede';
import { useTema } from '@/theme/useTema';

const TAMANHO_AVATAR_TOPO = 40;

export default function Arvore() {
  const { atual } = useOrganizacao();
  const { sessao } = useAuth();
  const { cores, raio } = useTema();
  const resumo = useResumoRede(null);
  const { data: cursos } = useCursos();
  const [expansao, setExpansao] = useState<ComandoExpansao>({ tudoAberto: false, versao: 0 });
  const alternarTudo = () => setExpansao((e) => ({ tudoAberto: !e.tudoAberto, versao: e.versao + 1 }));

  // a etiqueta do curso só ajuda quando há mais de um curso
  const mostrarCurso = (cursos?.length ?? 0) > 1;
  const nomeUsuario = nomeDaConta(sessao?.user) || primeiroNome(sessao?.user) || 'Você';

  return (
    <Tela titulo="Árvore" subtitulo="Quem indicou quem">
      <Cartao>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar nome={nomeUsuario} tamanho={TAMANHO_AVATAR_TOPO} forte />
          <View style={{ flex: 1 }}>
            <Texto negrito>Você</Texto>
            <Texto variante="legenda" suave numberOfLines={1}>
              {atual?.nome}
            </Texto>
          </View>
          {/* só faz sentido quando alguém indicou alguém (há galhos para abrir) */}
          {resumo.data && resumo.data.indiretas > 0 ? (
            <Botao
              titulo={expansao.tudoAberto ? 'Recolher tudo' : 'Expandir tudo'}
              icone={expansao.tudoAberto ? 'contract-outline' : 'expand-outline'}
              variante="secundario"
              compacto
              aoPressionar={alternarTudo}
            />
          ) : null}
        </View>

        {resumo.data && resumo.data.total > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[
              { valor: resumo.data.diretas, rotulo: 'diretas' },
              { valor: resumo.data.indiretas, rotulo: 'indiretas' },
              { valor: resumo.data.concluidos, rotulo: 'concluíram', cor: cores.concluido },
            ].map((n) => (
              <View
                key={n.rotulo}
                style={{
                  flexGrow: 1,
                  flexBasis: 80,
                  backgroundColor: cores.superficieSuave,
                  borderRadius: raio.md,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Texto variante="subtitulo" negrito cor={n.cor}>
                  {n.valor}
                </Texto>
                <Texto variante="legenda" suave>
                  {n.rotulo}
                </Texto>
              </View>
            ))}
          </View>
        ) : null}

        <ExpansaoArvore.Provider value={expansao}>
          <View style={{ marginLeft: recuoGalho(TAMANHO_AVATAR_TOPO) }}>
            <GalhoArvore paiId={null} cursoId={null} mostrarCurso={mostrarCurso} />
          </View>
        </ExpansaoArvore.Provider>
      </Cartao>
    </Tela>
  );
}
