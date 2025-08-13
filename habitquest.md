# Documento de Visão e Escopo do Projeto: "HabitQuest RPG"

## 1. Visão Geral e Tematização

O **HabitQuest RPG** é uma aplicação web pessoal projetada para transformar a construção de hábitos positivos em uma jornada de RPG (Role-Playing Game) com estética retro pixel art. O usuário é o herói de sua própria história, ganhando Pontos de Experiência (XP), subindo de nível e desbloqueando conquistas ao completar tarefas da vida real, como se exercitar, beber água e manter uma rotina saudável.

A identidade visual será inspirada nos clássicos de 8 e 16 bits, utilizando fontes pixeladas, ícones e componentes de interface que remetem a essa era, criando uma experiência nostálgica e motivadora.

### 1.1. Recursos de Estilo e Tematização (Grátis)

**Fonte Principal: Press Start 2P**. É a fonte pixelada por excelência, disponível gratuitamente no Google Fonts.

**Como usar**: Adicione no `<head>` do seu HTML:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

E no seu `tailwind.config.js`, estenda o tema:

```javascript
theme: {
  extend: {
    fontFamily: {
      'press-start': ['"Press Start 2P"', 'cursive'],
    },
  },
},
```

**Biblioteca de Ícones: Pixelarticons**. Uma coleção fantástica de ícones em pixel art, open-source e fáceis de usar como SVG.

**Como usar**: Baixe o SVG do ícone desejado e insira-o diretamente no seu HTML. Você pode controlar a cor com as classes de texto do Tailwind (ex: `text-green-400`).

**Componentes de UI (CSS Framework): NES.css**. Uma biblioteca CSS que transforma seus componentes (botões, contêineres, formulários) para que pareçam saídos de um jogo de NES. Ela pode ser usada em conjunto com o Tailwind CSS. Você usa o Tailwind para o layout (grid, flexbox, espaçamento) e as classes do NES.css para o estilo dos componentes.

**Como usar**: Adicione o CSS ao seu `<head>` e use as classes nos seus elementos, como `class="btn is-primary"`.

## 2. Especificação de Requisitos de Software (SRS)

### 2.1. Requisitos Funcionais (RF)

- **RF01 - Cadastro de Usuário**: O sistema deve permitir que um novo usuário crie uma conta usando e-mail e senha.
- **RF02 - Autenticação de Usuário**: O sistema deve permitir que um usuário existente faça login e logout.
- **RF03 - Gerenciamento de Hábitos (CRUD)**: O usuário deve poder criar, visualizar, editar e excluir seus próprios hábitos personalizáveis, definindo um nome, descrição e valor de XP.
- **RF04 - Registro de Conclusão**: O usuário deve poder registrar a conclusão de um hábito com um único clique.
- **RF05 - Sistema de XP e Níveis**: Ao registrar um hábito, o XP do usuário deve ser incrementado. O sistema deve calcular e exibir o nível atual e uma barra de progresso para o próximo nível.
- **RF06 - Dashboard Principal**: A tela inicial deve exibir o status do personagem (Nível, XP), a lista de hábitos diários e o progresso geral.
- **RF07 - Sistema de Missões**: O sistema deve apresentar missões (ex: "Beber 2L de água hoje") e detectar sua conclusão automaticamente, concedendo recompensas (XP bônus).
- **RF08 - Sistema de Conquistas (Achievements)**: O sistema deve ter uma página dedicada para exibir conquistas desbloqueadas e bloqueadas, baseadas em marcos de longo prazo (ex: "Atingir Nível 10").

### 2.2. Requisitos Não Funcionais (RNF)

- **RNF01 - Usabilidade**: A interface deve ser intuitiva e seguir a estética pixel art, com feedback visual claro para as ações do usuário (ex: som ou animação ao ganhar XP).
- **RNF02 - Desempenho**: A aplicação deve ser leve e carregar rapidamente. As interações do usuário devem ter resposta visual imediata (<200ms).
- **RNF03 - Segurança**: A aplicação deve usar as políticas de segurança a nível de linha (Row Level Security - RLS) do Supabase para garantir que um usuário só possa acessar e modificar seus próprios dados.
- **RNF04 - Responsividade**: A aplicação deve ser totalmente funcional e visualmente agradável em dispositivos desktop e mobile (mobile-first).
- **RNF05 - Manutenibilidade**: O código JavaScript deve ser modularizado em arquivos distintos por responsabilidade (ex: `auth.js`, `ui.js`, `api.js`) para facilitar a manutenção.

## 3. Arquitetura do Sistema e Modelo de Dados

### 3.1. Arquitetura

A arquitetura será um **Single Page Application (SPA)** desacoplado:

- **Frontend**: HTML, Tailwind CSS, JavaScript puro. Responsável pela renderização da interface, gerenciamento de estado e interações do usuário.
- **Backend (BaaS)**: Supabase. Servirá como banco de dados (PostgreSQL), sistema de autenticação e provedor de APIs em tempo real.

```
+---------------------------------+
|      Frontend (Navegador)       |
| (HTML, Tailwind, JS, NES.css)   |
+---------------------------------+
            ^
            | (HTTPS / WebSocket)
            v
+---------------------------------+
|         Backend (Supabase)      |
| (Auth, DB, Realtime, RLS)       |
+---------------------------------+
```

### 3.2. Modelo de Dados (Tabelas no Supabase)

**profiles**: Armazena dados públicos do usuário.
- `id` (uuid, Chave Primária, FK para auth.users.id)
- `username` (text)
- `xp` (integer, default: 0)
- `level` (integer, default: 1)
- `created_at` (timestampz)

**habits**: A lista de hábitos que o usuário pode realizar.
- `id` (uuid, Chave Primária)
- `user_id` (uuid, FK para auth.users.id)
- `name` (text)
- `description` (text, nullable)
- `xp_value` (integer)
- `created_at` (timestampz)

**habit_logs**: Um registro de cada vez que um hábito é completado.
- `id` (uuid, Chave Primária)
- `habit_id` (uuid, FK para habits.id)
- `user_id` (uuid, FK para auth.users.id)
- `created_at` (timestampz, default: now())

## 4. Plano de Desenvolvimento (Roadmap)

Este é um plano de ação passo a passo, seguindo as melhores práticas.

### Fase 0: Configuração do Ambiente (Setup)

- **Controle de Versão**: Crie um novo repositório no GitHub. No seu computador, use `git init`.
- **Projeto Supabase**: Crie um novo projeto no Supabase. Guarde a URL do projeto e a chave de API (anon key).
- **Estrutura do Projeto Local**: Crie a estrutura de pastas:

```
/project-root
|-- /src
|   |-- /js
|   |   |-- supabaseClient.js
|   |   |-- auth.js
|   |   |-- main.js
|   |-- /css
|   |   |-- style.css
|-- index.html
|-- login.html
|-- tailwind.config.js
|-- package.json
```

- **Build Tool**: Use o Vite para gerenciar o projeto. Ele oferece um servidor de desenvolvimento rápido e otimiza o build final.
  Execute `npm create vite@latest . -- --template vanilla` no terminal.

### Fase 1: Backend e Segurança (Supabase)

- **Criar Tabelas**: Use o editor de tabelas do Supabase para criar as tabelas `profiles`, `habits` e `habit_logs` conforme o modelo de dados.
- **Configurar RLS (CRÍTICO)**: Vá em "Authentication" -> "Policies". Habilite a RLS para cada tabela e crie políticas que permitam que o usuário apenas veja e modifique seus próprios dados.

Exemplo de política para `habits`:
```sql
ENABLE ROW LEVEL SECURITY
CREATE POLICY "Users can only see their own habits." ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits." ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Fase 2: Frontend - Estrutura e Autenticação

- **Configurar Cliente Supabase**: No arquivo `src/js/supabaseClient.js`, inicialize o cliente do Supabase com suas credenciais.
- **Criar Telas de Login/Cadastro**: Desenvolva `login.html` e uma página de cadastro com formulários estilizados com Tailwind e NES.css.
- **Implementar Funções de Auth**: Em `src/js/auth.js`, crie as funções `signUp`, `signIn` e `signOut` que interagem com o Supabase. Adicione os event listeners nos botões.
- **Proteger Rotas**: Em `main.js`, verifique se o usuário está logado. Se não estiver, redirecione-o para `login.html`.

### Fase 3: O Loop Principal do Jogo

- **Listar Hábitos**: Na página principal (`index.html`), crie uma função que busca (SELECT) os hábitos do usuário logado na tabela `habits` e os exibe na tela.
- **Registrar Hábito**: Para cada hábito listado, adicione um botão "Completar". O clique nesse botão deve:
  - a. Chamar uma função que insere (INSERT) um novo registro na `habit_logs`.
  - b. Chamar uma função que atualiza (UPDATE) o campo `xp` na tabela `profiles` do usuário.
  - c. Disparar uma animação ou som de "XP Ganho!" para dar feedback imediato.
- **Atualizar UI em Tempo Real**: Use o Supabase Realtime para "ouvir" mudanças na tabela `profiles`. Quando o XP mudar, atualize a barra de progresso e o nível na tela automaticamente, sem precisar recarregar a página.

### Fase 4: Gamificação Avançada

- **Cálculo de Nível**: Crie uma função que, sempre que o XP for atualizado, verifique se o usuário atingiu o XP necessário para o próximo nível. Se sim, incremente o nível e redefina a barra de progresso.
- **Missões Diárias**: Crie uma lógica em JavaScript que, ao carregar a página, verifica a tabela `habit_logs` do dia atual para ver se as condições de uma missão foram atendidas.

### Fase 5: Polimento e Deploy

- **Estilização Fina**: Revise toda a interface, garantindo que a estética pixel art esteja consistente. Adicione micro-interações e transições.
- **Responsividade**: Teste e ajuste o layout para diferentes tamanhos de tela.
- **Deploy**: Faça o deploy do seu site estático em plataformas como Vercel ou Netlify. Elas se integram perfeitamente com o GitHub e o processo de build do Vite.

---

Este documento serve como seu mapa. Seu primeiro passo prático é criar o projeto no Supabase e inicializar o repositório no Git. A partir daí, siga o roadmap fase por fase.

**Bom desenvolvimento, e que comece a sua quest!** 🎮