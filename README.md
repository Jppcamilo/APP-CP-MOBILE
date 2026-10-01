<div align="center">
  <img src="./monet/assets/monet-icon.png" alt="Capivara do Monet" width="100" />

  <h1>Monet</h1>

  <p>Seu dinheiro, com clareza.</p>

  <p>
    Aplicativo de gestão financeira desenvolvido com
    React Native, Expo, TypeScript e Firebase.
  </p>
</div>

---

## Sobre o projeto

O Monet é um assistente financeiro de bolso com interface minimalista, desenvolvido para ajudar jovens e adultos a organizar suas finanças de maneira prática.

O aplicativo reúne saldo, receitas, despesas e metas em um Dashboard. A proposta é oferecer informações claras, sem a complexidade de planilhas, com uma estrutura preparada para a inclusão de novas funcionalidades.

Projeto acadêmico desenvolvido para a disciplina de Mobile da FIAP.

## Funcionalidades

### Autenticação

- Cadastro com nome, e-mail e senha.
- Login com Firebase Authentication.
- Recuperação de senha por e-mail.
- Opção de mostrar ou ocultar a senha.
- Persistência da sessão ao reabrir o aplicativo.
- Encerramento da sessão pelo menu de perfil.

### Dashboard

- Saudação e identificação do usuário.
- Saldo calculado a partir das movimentações cadastradas.
- Total de receitas e despesas.
- Opção de ocultar os valores financeiros.
- Gráfico de evolução do saldo.
- Exibição das transações recentes.
- Consulta de todos os lançamentos cadastrados.
- Registro de receitas e despesas com descrição e categoria.
- Exclusão de lançamentos ao manter o item pressionado.
- Cadastro e consulta de metas financeiras.
- Atualização dos dados por listeners do Firestore.

> Os botões Transferir, Pagar e Depositar registram movimentações no controle financeiro. O aplicativo não realiza operações bancárias.

## Telas e navegação

O projeto possui duas telas principais:

| Tela | Responsabilidade |
|---|---|
| Login | Acesso à conta, cadastro e recuperação de senha |
| Dashboard | Resumo financeiro, movimentações, metas e acesso ao perfil |

A navegação utiliza Native Stack, do React Navigation.

As rotas disponíveis acompanham o estado de autenticação: usuários sem sessão acessam o Login, enquanto usuários autenticados acessam o Dashboard.

O cadastro utiliza o próprio formulário de Login. Os formulários financeiros e as metas são apresentados em janelas dentro do Dashboard.

## Tecnologias

| Tecnologia | Utilização |
|---|---|
| React Native | Construção da interface mobile |
| Expo | Desenvolvimento e execução do aplicativo |
| TypeScript | Tipagem do código |
| React Navigation | Navegação entre os fluxos |
| Firebase Authentication | Autenticação dos usuários |
| Cloud Firestore | Armazenamento e sincronização dos dados |
| AsyncStorage | Persistência da sessão de autenticação |
| React Native SVG | Gráfico de evolução do saldo |
| Expo Vector Icons | Ícones da interface |
| Expo Splash Screen | Configuração da tela de abertura |
| React Native Safe Area Context | Ajuste da interface às áreas seguras do dispositivo |

## Organização do projeto

O aplicativo está localizado na pasta `monet`.

| Caminho | Responsabilidade |
|---|---|
| `monet/App.tsx` | Inicialização, estado de autenticação e navegação |
| `monet/app.json` | Configurações do Expo e identidade do aplicativo |
| `monet/assets/` | Imagens, ícone e recursos visuais |
| `monet/src/components/` | Componentes reutilizáveis |
| `monet/src/config/firebase.ts` | Inicialização do Firebase, Authentication e Firestore |
| `monet/src/screens/` | Telas de Login e Dashboard |
| `monet/src/services/financeService.ts` | Operações de dados e funções auxiliares |
| `monet/src/styles/theme.ts` | Cores e estilos compartilhados |
| `monet/src/types/firebase-auth.d.ts` | Complemento de tipagem para a persistência do Firebase Auth |

## Como executar

### Pré-requisitos

- Node.js compatível com a versão do Expo utilizada.
- npm.
- Expo Go instalado no celular.
- Projeto configurado no Firebase.

### 1. Clonar o repositório

```bash
git clone https://github.com/Jppcamilo/APP-CP-MOBILE.git
```

### 2. Acessar a pasta do aplicativo

```bash
cd APP-CP-MOBILE/monet
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Configurar o Firebase

No [Firebase Console](https://console.firebase.google.com/):

1. Crie um projeto.
2. Registre um aplicativo Web para obter o objeto `firebaseConfig`.
3. Habilite o provedor **E-mail/senha** no Authentication.
4. Crie o banco padrão do Cloud Firestore, com ID `(default)`.
5. Configure as regras para restringir o acesso aos dados de cada usuário ao seu próprio UID.
6. Preencha o objeto `firebaseConfig` em `src/config/firebase.ts` com os dados do seu projeto.

O cadastro Web é utilizado porque esta versão se conecta ao Firebase por meio do SDK JavaScript no Expo Go.

As coleções e os documentos são criados pelo aplicativo conforme os usuários se cadastram e salvam registros.

### 5. Iniciar o aplicativo

```bash
npx expo start
```

Abra o QR Code com o Expo Go. Para conexão local, mantenha o computador e o celular na mesma rede.

Para reiniciar o servidor limpando o cache:

```bash
npx expo start -c
```

## Estrutura dos dados

Os dados são organizados por usuário:

| Caminho no Firestore | Dados armazenados |
|---|---|
| `users/{uid}` | Nome, e-mail e data de criação |
| `users/{uid}/transactions/{id}` | Descrição, categoria, tipo, valor e data |
| `users/{uid}/goals/{id}` | Nome da meta, valor desejado e data |

### Valores monetários

Os valores são armazenados em centavos inteiros.

Exemplo:

```text
R$ 186,40 → 18640
```

O saldo é calculado a partir de todos os lançamentos:

```text
Saldo = Total de receitas − Total de despesas
```

Nesta versão, os totais não possuem filtro mensal. O gráfico representa a evolução do saldo após os últimos lançamentos.

### Segurança

- As credenciais de login são gerenciadas pelo Firebase Authentication.
- As senhas não são armazenadas no Firestore.
- As regras do Firestore devem verificar a autenticação e o UID do proprietário dos dados.
- A proteção das telas é complementada pelas regras de acesso ao banco.

## Identidade visual

A identidade do Monet utiliza:

- Fundo claro e cartões arredondados.
- Tons escuros para destacar o saldo.
- Roxo como cor principal de destaque.
- Verde para receitas e vermelho para despesas.
- Uma capivara como símbolo do aplicativo.

O ícone também aparece ao lado do nome Monet na tela de Login.

> A tela de carregamento do Expo Go é controlada pelo próprio Expo. A aparência definitiva do ícone instalado e da splash screen deve ser validada em uma build do aplicativo.

## Verificação

Para verificar os tipos do projeto:

```bash
npx tsc --noEmit
```

Sugestão de validação manual:

1. Criar uma conta e verificar seu registro no Authentication.
2. Conferir o perfil criado no Firestore.
3. Registrar uma receita e uma despesa.
4. Conferir o saldo e o gráfico.
5. Criar uma meta e consultar seu registro.
6. Excluir uma movimentação e verificar o novo saldo.
7. Sair e entrar novamente.
8. Acessar outra conta e verificar a separação dos dados.

## Próximas etapas

Os recursos abaixo fazem parte do planejamento e ainda não estão implementados:

- Firebase Remote Config para controle remoto de painéis.
- Firebase Analytics para acompanhamento do uso.
- Firebase Crashlytics para monitoramento de erros.
- Firebase Storage para anexos de recibos.
- Firebase App Check como camada adicional de proteção.
- Desbloqueio com biometria.
- Filtros por período e categoria.
- Edição de movimentações.
- Aportes e acompanhamento do progresso das metas.
- Telas dedicadas para extrato, planejamento e perfil.

As integrações nativas, como Analytics e Crashlytics, exigem uma build própria e configuração adicional, além do ambiente atual com Expo Go.

## Integrantes

- João Pedro Pereira Camilo
- Lucas Matsubara
- Pamella Christiny
- Felipe Ribeiro

---

Desenvolvido para fins acadêmicos na FIAP.