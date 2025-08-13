-- HabitQuest RPG - Configuração do Banco de Dados Supabase
-- Execute estes comandos no SQL Editor do seu projeto Supabase

-- 1. Criar tabela profiles (dados públicos do usuário)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Criar tabela habits (hábitos do usuário)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  xp_value INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Criar tabela habit_logs (registro de conclusão dos hábitos)
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Habilitar Row Level Security (RLS) - CRÍTICO PARA SEGURANÇA
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de segurança para profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 6. Criar políticas de segurança para habits
CREATE POLICY "Users can view own habits" 
  ON habits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" 
  ON habits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" 
  ON habits FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" 
  ON habits FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Criar políticas de segurança para habit_logs
CREATE POLICY "Users can view own habit logs" 
  ON habit_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" 
  ON habit_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs" 
  ON habit_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- 8. Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar índices para melhor performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_created_at ON habit_logs(created_at);

-- 10. (Opcional) Inserir dados de exemplo
-- Descomente as linhas abaixo se quiser dados de teste
/*
INSERT INTO profiles (id, username, xp, level)
VALUES (auth.uid(), 'Herói Exemplo', 150, 2);

INSERT INTO habits (user_id, name, description, xp_value)
VALUES 
  (auth.uid(), 'Beber Água', 'Beber pelo menos 2L de água', 10),
  (auth.uid(), 'Exercitar-se', 'Fazer 30min de exercícios', 25),
  (auth.uid(), 'Meditar', '10 minutos de meditação', 15),
  (auth.uid(), 'Ler', 'Ler pelo menos 20 páginas', 20);
*/

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'habits', 'habit_logs')
ORDER BY table_name;
