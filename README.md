# 🎮 HabitQuest RPG

Uma aplicação web que transforma a construção de hábitos positivos em uma jornada épica de RPG com estética retro pixel art. Torne-se o herói da sua própria vida!

![HabitQuest RPG](https://img.shields.io/badge/Status-Produção-green)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

## 🌟 Funcionalidades Implementadas

### 🎯 **Sistema de Gamificação**
- **XP e Níveis**: Ganhe pontos de experiência ao completar hábitos e suba de nível (100 XP = 1 nível)
- **Personagem Customizável**: Escolha o gênero do seu herói (👨/👩) e defina seu nome
- **Interface Pixel Art**: Estética nostálgica inspirada nos clássicos RPGs 8/16-bit
- **Animações de XP**: Feedback visual satisfatório ao ganhar experiência

### 🔐 **Sistema de Autenticação Completo**
- **Registro e Login**: Criação de conta e autenticação segura
- **Email sem Confirmação**: Fluxo simplificado para melhor UX
- **Múltiplas Páginas**: Interface otimizada com diferentes pontos de entrada
- **Redirecionamento Inteligente**: Navegação automática baseada no estado de autenticação

### ⚙️ **Configurações de Conta Avançadas**
- **Alterar Nome do Herói**: Personalize o nome do seu personagem
- **Alterar Gênero**: Mude entre 👨 Masculino e 👩 Feminino a qualquer momento
- **Alterar Email**: Atualize seu endereço de email com verificação
- **Alterar Senha**: Mudança segura de senha com validação atual
- **Exclusão de Conta**: **Exclusão REAL e permanente** de todos os dados (sem frescura!)

### 📱 **Design Responsivo e Acessível**
- **Mobile-First**: Funciona perfeitamente em todos os dispositivos
- **Tema Consistente**: Design unificado em todas as páginas
- **Feedback Visual**: Notificações, loading states e animações
- **Navegação Intuitiva**: UX otimizada para gamers e não-gamers

## 🛠️ Tecnologias e Arquitetura

### **Frontend**
- **HTML5 Semântico**: Estrutura acessível e bem organizada
- **Tailwind CSS v3.4.15**: Styling moderno e responsivo
- **JavaScript ES6+**: Código moderno com módulos ES
- **Vite v7.1.2**: Build tool ultrarrápido e desenvolvimento otimizado

### **Backend-as-a-Service**
- **Supabase**: PostgreSQL, Authentication e Real-time
- **Row Level Security (RLS)**: Segurança de dados por usuário
- **Triggers automáticos**: Criação automática de perfis

### **Design System**
- **[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)**: Fonte pixel art autêntica
- **[NES.css](https://nostalgic-css.github.io/NES.css/)**: Framework CSS estilo NES/retro
- **Pixel Perfect Icons**: Ícones temáticos 8-bit

### **Deploy e Infraestrutura**
- **Vercel**: Deploy automático com GitHub
- **Multi-page SPA**: Arquitetura híbrida otimizada
- **Edge Functions**: Performance global

## � Instalação e Configuração

### **Pré-requisitos**
- Node.js (versão 18 ou superior)
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)

### **Setup Local**

1. **Clone e instale**
```bash
git clone https://github.com/CarlosHOliver/habitquestrpg.git
cd habitquestrpg
npm install
```

2. **Configure variáveis de ambiente**
```bash
# Crie o arquivo .env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

3. **Configure o banco de dados**
Execute os scripts SQL no Supabase:

```sql
-- 1. Execute database.sql (estrutura base)
-- 2. Execute database-fix.sql (triggers e correções)
-- 3. Execute database-gender.sql (suporte a gênero)
```

4. **Execute localmente**
```bash
npm run dev
# Acesse: http://localhost:5173
```

5. **Build para produção**
```bash
npm run build
npm run preview
```

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**

```sql
-- Perfis de usuário
profiles (
  id UUID PRIMARY KEY,           -- Referência ao auth.users
  username TEXT NOT NULL,        -- Nome do herói
  gender VARCHAR(10) DEFAULT 'masculino', -- Gênero (masculino/feminino)
  xp INTEGER DEFAULT 0,          -- Pontos de experiência
  level INTEGER DEFAULT 1,       -- Nível atual
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Hábitos dos usuários
habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,            -- Nome do hábito
  description TEXT,              -- Descrição opcional
  xp_value INTEGER NOT NULL,     -- XP que o hábito dá
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Log de conclusões de hábitos
habit_logs (
  id UUID PRIMARY KEY,
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### **Segurança (RLS)**
- Cada usuário só acessa seus próprios dados
- Políticas automáticas baseadas em `auth.uid()`
- Triggers automáticos para criação de perfil

## 📁 Arquitetura do Projeto

```
habitquestrpg/
├── 📄 Páginas HTML
│   ├── index.html                 # Dashboard principal
│   ├── settings.html              # Configurações de conta
│   ├── login-standalone.html      # Login/registro
│   ├── login.html                 # Login simples
│   └── auth-check.html           # Verificação de auth
├── 📂 src/
│   ├── 📂 js/
│   │   ├── supabaseClient.js     # Cliente Supabase
│   │   ├── auth.js               # Autenticação
│   │   ├── api.js                # Funções de API
│   │   ├── ui.js                 # Interface e animações
│   │   ├── main.js               # Dashboard logic
│   │   └── settings.js           # Configurações logic
│   └── 📂 css/
│       └── style.css             # Estilos Tailwind
├── 📄 Configuração
│   ├── vite.config.js            # Config do Vite
│   ├── vercel.json              # Config do Vercel
│   ├── tailwind.config.js       # Config do Tailwind
│   └── package.json             # Dependências
└── 📄 Database
    ├── database.sql             # Estrutura base
    ├── database-fix.sql         # Triggers e correções
    └── database-gender.sql      # Migração de gênero
```

## 🎯 Roadmap e Funcionalidades Futuras

### **Em Desenvolvimento** 🔄
- CRUD completo de hábitos personalizados
- Sistema de categorias de hábitos
- Dashboard com estatísticas avançadas

### **Planejado** 📋
- 🏆 Sistema de conquistas (achievements)
- 📅 Missões diárias e semanais
- 🔥 Sistema de streaks (sequências)
- 📊 Gráficos de progresso
- 🎵 Efeitos sonoros retro
- 🌙 Modo escuro
- 📱 PWA (Progressive Web App)
- 🤝 Sistema de amigos/guilds
- 🛡️ Classes de personagem (Guerreiro, Mago, etc.)

## � Segurança e Privacidade

- **Autenticação JWT**: Sistema seguro do Supabase
- **RLS Ativo**: Isolamento completo de dados por usuário
- **HTTPS Obrigatório**: Comunicação criptografada
- **Exclusão Real**: Quando você exclui, os dados são permanentemente removidos
- **Sem Tracking**: Nenhum analytics ou tracking de terceiros

## � Deploy em Produção

### **Vercel (Recomendado)**
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push!

### **Outras Opções**
- Netlify
- GitHub Pages (para versão estática)
- Servidor próprio com Docker

## 🤝 Contribuição

Adoramos contribuições! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Add: Nova funcionalidade incrível'`)
4. **Push** para a branch (`git push origin feature/NovaFuncionalidade`)
5. **Abra** um Pull Request

### **Guidelines**
- Mantenha a estética pixel art
- Escreva código limpo e comentado
- Teste em dispositivos móveis
- Siga o padrão de commits convencionais

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja [LICENSE](LICENSE) para detalhes.
Você pode usar, modificar e distribuir livremente, incluindo para fins comerciais.

## 🎮 Créditos e Inspiração

- **Inspirado em**: RPGs clássicos dos anos 80/90
- **Design**: Nintendo Entertainment System (NES)
- **Fonte**: Press Start 2P (8-bit style)
- **Framework CSS**: NES.css
- **Backend**: Supabase (Firebase alternativo)

## 👨‍💻 Autor

**Carlos Henrique de Oliveira**  
🔗 GitHub: [@CarlosHOliver](https://github.com/CarlosHOliver)  
📧 Email: Disponível no perfil GitHub  
🌐 LinkedIn: Disponível no perfil GitHub  

---

### 🎉 **Comece sua jornada épica agora!**

**HabitQuest RPG** não é apenas mais um app de hábitos. É uma aventura onde você é o protagonista, e cada pequena vitória na vida real te leva mais perto de se tornar a melhor versão de si mesmo.

**Que a quest comece!** ⚔️🛡️

---

*"O herói não nasce herói. Ele se torna herói através de pequenas vitórias diárias."*  
— HabitQuest RPG
