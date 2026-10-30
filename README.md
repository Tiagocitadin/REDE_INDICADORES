# Rede de Indicações

App para cadastrar pessoas e acompanhar a árvore de indicações: quem você indicou
(diretas) e quem veio através delas (indiretas), por curso.

Um único código roda em **Android, iPhone e Web** (Expo + React Native), com
**Supabase** como banco de dados e login.

---

## 1. Rodar no seu computador (primeira vez)

Pré-requisitos: [Node.js 20 ou mais novo](https://nodejs.org) e o app **Expo Go** no celular
(Play Store / App Store).

```bash
# 1. instalar as dependências
npm install
npx expo install --fix        # alinha as versões com o Expo instalado

# 2. configurar o acesso ao banco
cp .env.example .env          # no Windows: copy .env.example .env

# 3. abrir
npm run web                   # abre no navegador
npm start                     # mostra um QR code: leia com o Expo Go no celular
```

Na primeira vez, toque em **"Ainda não tenho conta"**, crie seu login, confirme o
e-mail e entre. O app pede o nome da sua rede e o primeiro curso. Pronto.

## 2. Configurações do Supabase (fazer uma vez, no painel)

Em **Authentication**:

- **URL Configuration › Site URL**: o endereço onde a versão web vai ficar
  (ex.: `https://rede.seudominio.com.br`). Os links de confirmação e de nova senha usam isso.
- **Sign In / Providers › Email**: deixe **Confirm email** ligado.
- **Policies / Passwords**: senha mínima de **8** caracteres, exigindo letras e números.
- Se o app for só seu por enquanto: depois de criar sua conta, desligue
  **Allow new users to sign up**. Ligue de novo quando for vender o app.

## 3. Publicar

**Web** (grátis na Vercel ou Netlify):

```bash
npm run build:web             # gera a pasta dist/
```

Suba a pasta `dist/` na Vercel/Netlify e cadastre as duas variáveis do `.env` lá.

**Android e iPhone** (EAS, serviço da Expo):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # APK para testar no Android
eas build --platform all --profile production    # versões para as lojas
eas submit --platform all                        # envia para Google Play / App Store
```

Contas necessárias para as lojas: Google Play (US$ 25, uma vez) e Apple Developer
(US$ 99 por ano). Antes de publicar, troque `com.redeindicacoes.app` no `app.json`
pelo identificador definitivo e adicione ícone e tela de abertura.

---

## Como o projeto é organizado

```
app/                        telas e rotas (Expo Router: o nome do arquivo é a rota)
  _layout.tsx               provedores globais (login, organização, cache)
  index.tsx                 decide: entrar / primeiro acesso / painel
  entrar.tsx                login e criação de conta
  bem-vindo.tsx             primeiro acesso: cria a rede e o primeiro curso
  (app)/                    área logada (protegida)
    _layout.tsx             menu: embaixo no celular, na lateral em telas largas
    painel.tsx              resumo: total, diretas, indiretas, níveis, ranking
    arvore.tsx              árvore que abre galho por galho
    cadastrar.tsx           cadastro (aceita ?indicadoPor=<id>)
    pessoas/index.tsx       lista com busca e paginação
    pessoas/[id].tsx        ficha da pessoa e a rede dela
    pessoas/editar/[id].tsx edição
    ajustes.tsx             cursos, conta, senha
src/
  components/ui/            peças visuais reutilizáveis (Botao, Campo, Seletor…)
  features/                 regras por assunto: cada pasta tem seus dados e telas
    auth/                   login e sessão
    organizacao/            organização em uso e papel do usuário
    cursos/                 cursos e filtro por curso
    pessoas/                cadastro, validação, lista, ficha
    rede/                   resumo, ranking e árvore
  lib/                      Supabase, cache, erros, formatação
  theme/                    cores, tamanhos, tema claro/escuro
  types/database.ts         tipos gerados a partir do banco
supabase/migrations/        histórico versionado do banco (já aplicado no projeto)
```

Para criar algo novo (ex.: comissões), crie `src/features/comissoes/` e a tela em
`app/(app)/`. O que já existe não precisa mudar.

## Segurança e dados pessoais

- **RLS em todas as tabelas**: o próprio banco só entrega os dados da organização de
  quem está logado. Sem login, nada é acessível.
- **Somente a chave pública no app.** A chave secreta (service_role) nunca entra no
  código nem no `.env` do app.
- **Login guardado no cofre do celular** (Keychain/Keystore).
- **Papéis**: dono, admin e operador. Só dono/admin mexem em cursos e apagam dados
  pessoais.
- **LGPD**: o cadastro exige confirmar que a pessoa autorizou. "Apagar dados pessoais"
  remove nome, telefone, e-mail e descrição e mantém a posição na árvore.
- **Auditoria**: o banco registra quem criou ou alterou cada registro e quais campos
  mudaram, sem copiar os dados pessoais.
- **Regras no banco**: cada pessoa entra uma vez (e-mail e telefone únicos), indicação
  circular é bloqueada, nível e caminho na árvore são calculados pelo banco.

## Performance

- Contas da rede (diretas, indiretas, níveis, ranking) rodam **no banco**, em funções
  SQL com índices. O celular recebe só o resultado.
- Cada pessoa guarda a lista de quem está acima dela (`ancestrais`, com índice GIN):
  a rede inteira de alguém sai em uma consulta, mesmo com milhares de pessoas.
- A árvore carrega **um galho por vez**; a lista de pessoas carrega **30 por vez**.
- Cache com TanStack Query: telas já visitadas abrem na hora.

## Pronto para crescer / vender

O banco já é **multi-organização**: cada cliente que comprar o app vira uma organização
separada, com seus próprios cursos, pessoas e equipe, sem enxergar os outros. Próximos
passos naturais: convidar membros da equipe, planos pagos e login por link mágico.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run web` | abre no navegador |
| `npm start` | abre no celular via Expo Go |
| `npm run typecheck` | confere os tipos do código |
| `npm run lint` | confere o padrão do código |
| `npm run build:web` | gera a versão web para publicar |
