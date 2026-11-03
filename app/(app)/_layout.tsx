import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { BarraTopo } from '@/components/layout/BarraTopo';
import { Carregando, ComBarraTopo } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrganizacao } from '@/features/organizacao/OrganizacaoProvider';
import { useTema } from '@/theme/useTema';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

const icone = (nome: NomeIcone) =>
  function IconeAba({ color, size }: { color: string; size: number }) {
    return <Ionicons name={nome} color={color} size={size} />;
  };

/**
 * Área logada. Protege todas as telas internas:
 * sem login → tela de entrar; sem organização → primeiro acesso.
 * Barra superior em todas as telas (tema, avatar e sair).
 * Celular: menu embaixo. Tablet/computador: menu na lateral.
 */
export default function AppLayout() {
  const { sessao, carregando } = useAuth();
  const org = useOrganizacao();
  const { cores, telaLarga } = useTema();

  if (carregando || org.carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: cores.fundo }}>
        <Carregando />
      </View>
    );
  }
  if (!sessao) return <Redirect href="/entrar" />;
  if (!org.atual) return <Redirect href="/bem-vindo" />;

  return (
    <ComBarraTopo.Provider value>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: () => <BarraTopo />,
          tabBarPosition: telaLarga ? 'left' : 'bottom',
          tabBarVariant: telaLarga ? 'material' : 'uikit',
          tabBarLabelPosition: telaLarga ? 'beside-icon' : 'below-icon',
          tabBarActiveTintColor: cores.destaque,
          tabBarInactiveTintColor: cores.textoSuave,
          tabBarStyle: {
            backgroundColor: cores.superficie,
            borderTopColor: cores.borda,
            borderRightColor: cores.borda,
            ...(telaLarga ? { width: 220, paddingTop: 24 } : {}),
          },
          tabBarLabelStyle: { fontWeight: '600' },
          sceneStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Tabs.Screen name="painel" options={{ title: 'Painel', tabBarIcon: icone('grid-outline') }} />
        <Tabs.Screen name="arvore" options={{ title: 'Árvore', tabBarIcon: icone('git-network-outline') }} />
        <Tabs.Screen name="cadastrar" options={{ title: 'Cadastrar', tabBarIcon: icone('person-add-outline') }} />
        <Tabs.Screen name="pessoas" options={{ title: 'Pessoas', tabBarIcon: icone('people-outline') }} />
        <Tabs.Screen name="cursos" options={{ title: 'Cursos', tabBarIcon: icone('school-outline') }} />
        <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: icone('settings-outline') }} />
      </Tabs>
    </ComBarraTopo.Provider>
  );
}