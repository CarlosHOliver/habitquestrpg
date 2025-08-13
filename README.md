# 🎮 HabitQuest RPG

Uma aplicação web pessoal que transforma a construção de hábitos positivos em uma jornada de RPG com estética retro pixel art.

![HabitQuest RPG](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## 🚀 Características

- **Sistema de XP e Níveis**: Ganhe pontos de experiência ao completar hábitos
- **Interface Pixel Art**: Estética nostálgica inspirada nos clássicos 8/16-bit
- **Autenticação Segura**: Sistema completo de login/cadastro com Supabase
- **Responsive Design**: Funciona perfeitamente em desktop e mobile
- **Tempo Real**: Atualizações instantâneas usando Supabase Realtime

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Build Tool**: Vite
- **Estilização**: 
  - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) - Fonte pixel art
  - [NES.css](https://nostalgic-css.github.io/NES.css/) - Framework CSS estilo NES
  - [Pixelarticons](https://pixelarticons.com/) - Ícones em pixel art

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- Conta no Supabase

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/CarlosHOliver/habitquestrpg.git
cd habitquestrpg
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Configure o banco de dados**
Execute os seguintes comandos SQL no console do Supabase:

```sql
-- Criar tabela profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  xp_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela habit_logs
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can only see their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see their own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);
```

5. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🚀 Deploy

### Deploy no Vercel

1. **Instale a CLI do Vercel**
```bash
npm i -g vercel
```

2. **Faça o deploy**
```bash
npm run build
vercel --prod
```

3. **Configure as variáveis de ambiente**
No dashboard da Vercel, adicione as variáveis:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📁 Estrutura do Projeto

```
habitquestrpg/
├── src/
│   ├── js/
│   │   ├── supabaseClient.js  # Configuração do Supabase
│   │   ├── auth.js            # Funções de autenticação
│   │   ├── api.js             # Funções da API
│   │   ├── ui.js              # Funções de interface
│   │   └── main.js            # Script principal
│   └── css/
│       └── style.css          # Estilos customizados
├── index.html                 # Página principal
├── login.html                 # Página de login/cadastro
├── tailwind.config.js         # Configuração do Tailwind
├── vercel.json               # Configuração do Vercel
└── package.json              # Dependências do projeto
```

## 🎯 Funcionalidades Implementadas

- ✅ Sistema de autenticação (login/cadastro)
- ✅ Interface principal com estética pixel art
- ✅ Sistema básico de XP e níveis
- ✅ Estrutura para gerenciamento de hábitos
- ✅ Configuração para deploy no Vercel

## 📋 Próximas Funcionalidades

- 🔄 CRUD completo de hábitos
- 🏆 Sistema de conquistas (achievements)
- 📅 Missões diárias
- 📊 Estatísticas detalhadas
- 🔥 Sistema de streaks (sequências)
- 🎵 Efeitos sonoros
- 📱 PWA (Progressive Web App)

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Carlos Henrique de Oliveira**
- GitHub: [@CarlosHOliver](https://github.com/CarlosHOliver)

---

**Bom desenvolvimento, e que comece a sua quest!** 🎮
O HabitQuest RPG é uma aplicação web pessoal projetada para transformar a construção de hábitos positivos em uma jornada de RPG (Role-Playing Game) com estética retro pixel art. O usuário é o herói de sua própria história, ganhando Pontos de Experiência (XP), subindo de nível e desbloqueando conquistas ao completar tarefas da vida real.
