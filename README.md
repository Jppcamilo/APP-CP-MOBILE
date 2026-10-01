<div align="center">
  <img src="./monet/assets/monet-icon.png" alt="Capivara do Monet" width="110" />

  <h1>💜 Monet — Gestão Financeira</h1>

  <p><strong>Seu dinheiro, com clareza.</strong></p>
</div>

O **Monet** é um aplicativo de gestão financeira com interface minimalista, desenvolvido para facilitar a organização das finanças pessoais.

Voltado especialmente para **universitários e recém-formados**, o aplicativo centraliza saldo, receitas, despesas e metas em um Dashboard, oferecendo uma maneira prática de acompanhar o dinheiro sem depender de planilhas complexas.

---

## 🔗 Sobre o Projeto

Projeto acadêmico desenvolvido para a disciplina de **Mobile**, no curso de **Análise e Desenvolvimento de Sistemas da FIAP**.

A aplicação utiliza **React Native com Expo** no desenvolvimento mobile e **Firebase** para autenticação e armazenamento dos dados.

- **Repositório:** [APP-CP-MOBILE](https://github.com/Jppcamilo/APP-CP-MOBILE)
- **Pasta do aplicativo:** `monet`

---

## 🚀 Principais Funcionalidades

- **Autenticação com Firebase:**
  - Cadastro com nome, e-mail e senha.
  - Login e recuperação de senha por e-mail.
  - Persistência da sessão ao reabrir o aplicativo.
  - Opção de mostrar ou ocultar a senha.
  - Encerramento da sessão pelo perfil.

- **Dashboard Financeiro:**
  - Saudação personalizada com o nome do usuário.
  - Exibição do saldo total, receitas e despesas.
  - Opção de ocultar os valores financeiros.
  - Gráfico de evolução do saldo baseado nos lançamentos.

- **Controle de Movimentações:**
  - Registro de receitas e despesas.
  - Identificação dos lançamentos por descrição e categoria.
  - Visualização das transações recentes ou de todos os registros.
  - Exclusão de movimentações ao manter o item pressionado.

- **Planejamento Financeiro:**
  - Cadastro de metas com nome e valor desejado.
  - Consulta das metas vinculadas ao usuário.

- **Integração com Firestore:**
  - Armazenamento de perfis, transações e metas.
  - Atualização dos dados por listeners.
  - Organização dos registros por usuário.

> 💡 Os botões **Transferir**, **Pagar** e **Depositar** registram movimentações no controle financeiro. O Monet não realiza transferências, pagamentos ou depósitos bancários reais.

---

## 📱 Telas e Navegação

O aplicativo possui **duas telas principais**:

| Tela | Funcionalidade |
|---|---|
| **Login** | Acesso à conta, cadastro e recuperação de senha |
| **Dashboard** | Resumo financeiro, movimentações, metas e acesso ao perfil |

A navegação utiliza **Native Stack**, do React Navigation, separando o fluxo de autenticação do fluxo autenticado.

O cadastro acontece no próprio formulário de Login. Os formulários financeiros e as metas são apresentados em janelas dentro do Dashboard.

### Navegação no Dashboard

| Item | Comportamento |
|---|---|
| 🏠 Início | Exibe o resumo e as transações recentes |
| 🧾 Extrato | Expande a lista de movimentações |
| 🎯 Planejar | Abre a consulta e o cadastro de metas |
| 👤 Perfil | Exibe os dados do usuário e a opção de sair |

---

## 🛠️ Tecnologias Utilizadas

- **React Native & Expo** — Desenvolvimento da aplicação mobile.
- **TypeScript** — Tipagem estática do código.
- **React Navigation** — Navegação entre os fluxos do aplicativo.
- **Firebase Authentication** — Cadastro, login e recuperação de senha.
- **Cloud Firestore** — Armazenamento e sincronização dos dados.
- **AsyncStorage** — Persistência da sessão de autenticação.
- **React Native SVG** — Construção do gráfico financeiro.
- **Expo Vector Icons** — Ícones da interface.
- **Expo Splash Screen** — Configuração da tela de abertura.
- **Safe Area Context** — Ajuste da interface às áreas seguras do dispositivo.

---

## 📂 Organização do Projeto

Os arquivos da aplicação ficam dentro da pasta `monet`.

| Caminho | Responsabilidade |
|---|---|
| `App.tsx` | Inicialização, autenticação e navegação |
| `app.json` | Configurações do Expo e identidade do aplicativo |
| `assets/` | Ícone e recursos visuais |
| `src/components/` | Componentes reutilizáveis |
| `src/config/firebase.ts` | Inicialização dos serviços Firebase |
| `src/screens/` | Telas de Login e Dashboard |
| `src/services/financeService.ts` | Operações de dados e funções auxiliares |
| `src/styles/theme.ts` | Cores e estilos compartilhados |
| `src/types/firebase-auth.d.ts` | Complemento de tipagem da persistência do Firebase Auth |

---

## 🔥 Configuração do Firebase

Para executar o aplicativo com seu próprio projeto:

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um projeto e registre um aplicativo **Web**.
3. Habilite **E-mail/senha** no Firebase Authentication.
4. Crie o banco padrão do Cloud Firestore, com ID `(default)`.
5. Configure as regras para permitir que cada usuário acesse somente os próprios dados.
6. Preencha o objeto `firebaseConfig` no arquivo:

```text
monet/src/config/firebase.ts
```

> ℹ️ O cadastro Web é utilizado porque esta versão do aplicativo se conecta ao Firebase pelo SDK JavaScript, dentro do Expo Go.

As coleções e os documentos são criados pelo aplicativo conforme os usuários se cadastram e salvam registros.

### 🗃️ Estrutura dos dados

| Caminho no Firestore | Conteúdo |
|---|---|
| `users/{uid}` | Nome, e-mail e data de criação |
| `users/{uid}/transactions/{id}` | Descrição, categoria, tipo, valor e data |
| `users/{uid}/goals/{id}` | Nome da meta, valor desejado e data |

### 💰 Valores financeiros

Os valores são armazenados em **centavos inteiros**, evitando problemas de arredondamento nas operações.

```text
R$ 186,40 → 18640
```

O saldo é calculado a partir dos registros:

```text
Saldo = Total de receitas − Total de despesas
```

Nesta versão, os totais consideram todos os lançamentos cadastrados, sem filtro mensal. O gráfico apresenta a evolução do saldo após os últimos lançamentos.

### 🔐 Segurança

- As credenciais são gerenciadas pelo Firebase Authentication.
- As senhas não são armazenadas no Firestore.
- O acesso aos dados deve ser protegido pelas regras do Firestore.
- Cada usuário possui registros vinculados ao seu próprio UID.

---

## ▶️ Como Executar o Projeto

### Pré-requisitos

- Node.js compatível com a versão do Expo utilizada.
- npm instalado.
- **Expo Go** instalado no smartphone.
- Projeto Firebase configurado.

### 1. Clone o repositório

```bash
git clone https://github.com/Jppcamilo/APP-CP-MOBILE.git
```

### 2. Acesse a pasta do aplicativo

```bash
cd APP-CP-MOBILE/monet
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o Firebase

Preencha o arquivo `src/config/firebase.ts` conforme as instruções anteriores.

### 5. Inicie o Expo

```bash
npx expo start
```

### 6. Abra no celular

Escaneie o QR Code com a câmera do iPhone ou pelo Expo Go no Android.

Para conexão local, mantenha o computador e o celular na mesma rede.

### 🧹 Reiniciar limpando o cache

```bash
npx expo start -c
```

---

## ✅ Verificação do Projeto

Para verificar os tipos:

```bash
npx tsc --noEmit
```

### Roteiro de validação manual

- Criar uma conta e verificar seu registro no Authentication.
- Conferir a criação do perfil no Firestore.
- Registrar receitas e despesas.
- Verificar o cálculo do saldo e a atualização do gráfico.
- Criar uma meta financeira.
- Excluir uma movimentação e conferir o novo saldo.
- Sair e entrar novamente.
- Acessar outra conta e verificar a separação dos dados.

---

## 🎨 Identidade Visual

A identidade do Monet combina:

- **Roxo** como cor principal de destaque.
- **Fundo claro** e cartões arredondados.
- **Tons escuros** no painel de saldo.
- **Verde e vermelho** para diferenciar receitas e despesas.
- Uma **capivara** como símbolo do aplicativo.

A capivara aparece no ícone e ao lado do nome Monet na tela de Login.

> 📌 A tela de carregamento do Expo Go é controlada pelo próprio Expo. O ícone instalado e a splash screen definitiva devem ser validados em uma build própria do aplicativo.

---

## 🔮 Próximas Etapas

Os recursos abaixo estão planejados e **ainda não estão implementados**:

- [ ] Remote Config para controlar a exibição de painéis.
- [ ] Analytics para acompanhar o uso do aplicativo.
- [ ] Crashlytics para monitorar erros.
- [ ] Storage para anexar recibos.
- [ ] App Check como camada adicional de proteção.
- [ ] Desbloqueio com biometria.
- [ ] Filtros por período e categoria.
- [ ] Edição de movimentações.
- [ ] Aportes e acompanhamento do progresso das metas.
- [ ] Telas dedicadas para extrato, planejamento e perfil.

> As integrações nativas, como Analytics e Crashlytics, exigem configuração adicional e uma build própria, além do ambiente atual com Expo Go.

---

## 👥 Equipe de Desenvolvimento — FIAP

Projeto desenvolvido por estudantes de **Análise e Desenvolvimento de Sistemas**.

| Integrante | RM |
|---|---|
| **João Pedro Pereira Camilo** | 562005 |
| **Lucas Matsubara** | 565020 |
| **Pamella Christiny** | 565206 |
| **Felipe Ribeiro Salles de Camargo** | 565224 |

---

<div align="center">
  <p>💜 <strong>Monet — Seu dinheiro, com clareza.</strong></p>
  <p>Desenvolvido para fins acadêmicos na FIAP.</p>
</div>