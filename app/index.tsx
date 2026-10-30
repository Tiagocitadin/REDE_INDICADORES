import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Carregando, MensagemErro } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useTema } from '@/theme/useTema';

/** Porta de entrada: decide para onde mandar a pessoa. */
export default function Entrada() {
  const { sessao, carregando } = useAuth();
  const org = useOrganizacao();
  const { cores } = useTema();

  if (carregando || org.carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.fundo }}>
        <Carregando />
      </View>
    );
  }
  if (!sessao) return <Redirect href="/entrar" />;
  if (org.erro) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: cores.fundo }}>
        <MensagemErro erro={org.erro} aoTentar={org.recarregar} />
      </View>
    );
  }
  if (!org.atual) return <Redirect href="/bem-vindo" />;
  return <Redirect href="/painel" />;
}
