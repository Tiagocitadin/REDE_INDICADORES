import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { Botao, Campo, Logo, MensagemErro, Tela, Texto } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { criarConta, entrar, esquemaCadastro, esquemaLogin, recuperarSenha, type DadosLogin } from '@/features/auth/api';
import { useTema } from '@/theme/useTema';

type Modo = 'entrar' | 'criar';

export default function TelaEntrar() {
  const { sessao } = useAuth();
  const { cores } = useTema();
  const [modo, setModo] = useState<Modo>('entrar');
  const [erro, setErro] = useState<unknown>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const { control, handleSubmit, formState, getValues } = useForm<DadosLogin>({
    resolver: zodResolver(modo === 'entrar' ? esquemaLogin : esquemaCadastro),
    defaultValues: { nome: '', email: '', senha: '' },
  });

  if (sessao) return <Redirect href="/" />;

  const enviar = handleSubmit(async (dados) => {
    setErro(null);
    setAviso(null);
    try {
      if (modo === 'entrar') {
        await entrar(dados);
      } else {
        const precisaConfirmar = await criarConta(dados);
        if (precisaConfirmar) {
          setAviso('Conta criada. Abra o link que enviamos para o seu e-mail e depois entre aqui.');
          setModo('entrar');
        }
      }
    } catch (e) {
      setErro(e);
    }
  });

  const esqueci = async () => {
    setErro(null);
    const email = getValues('email');
    if (!email) {
      setAviso('Digite seu e-mail acima e toque de novo em "Esqueci a senha".');
      return;
    }
    try {
      await recuperarSenha(email);
      setAviso('Se este e-mail tiver conta, enviamos um link para criar uma nova senha.');
    } catch (e) {
      setErro(e);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela>
        <View style={{ flex: 1, justifyContent: 'center', width: '100%', maxWidth: 420, alignSelf: 'center', gap: 16 }}>
          <View style={{ gap: 4, marginBottom: 8 }}>
            <View style={{ marginBottom: 12 }}>
              <Logo tamanho={56} />
            </View>
            <Texto variante="pequeno" suave negrito>
              Rede de Indicações
            </Texto>
            <Texto variante="titulo">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Texto>
          </View>

          {modo === 'criar' ? (
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <Campo
                  rotulo="Seu nome"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  erro={formState.errors.nome?.message}
                />
              )}
            />
          ) : null}
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
                textContentType="emailAddress"
                erro={formState.errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="senha"
            render={({ field }) => (
              <Campo
                rotulo="Senha"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                secureTextEntry
                autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                textContentType={modo === 'entrar' ? 'password' : 'newPassword'}
                onSubmitEditing={enviar}
                ajuda={modo === 'criar' ? 'Mínimo de 8 caracteres, com letras e números.' : undefined}
                erro={formState.errors.senha?.message}
              />
            )}
          />

          {aviso ? (
            <Texto variante="pequeno" cor={cores.destaque} accessibilityLiveRegion="polite">
              {aviso}
            </Texto>
          ) : null}
          {erro ? <MensagemErro erro={erro} /> : null}

          <Botao titulo={modo === 'entrar' ? 'Entrar' : 'Criar conta'} carregando={formState.isSubmitting} aoPressionar={enviar} />
          {modo === 'entrar' ? <Botao titulo="Esqueci a senha" variante="fantasma" compacto aoPressionar={esqueci} /> : null}
          <Botao
            titulo={modo === 'entrar' ? 'Ainda não tenho conta' : 'Já tenho conta'}
            variante="secundario"
            compacto
            aoPressionar={() => {
              setErro(null);
              setModo(modo === 'entrar' ? 'criar' : 'entrar');
            }}
          />
        </View>
      </Tela>
    </KeyboardAvoidingView>
  );
}
