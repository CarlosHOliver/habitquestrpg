-- Sistema de Conquistas (Achievements)
-- Executar após os outros scripts de banco

-- Tabela de conquistas disponíveis
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'prata', 'ouro', 'diamante', 'reliquia')),
  category TEXT NOT NULL CHECK (category IN ('streak', 'xp', 'level', 'habits', 'social', 'special')),
  icon TEXT NOT NULL, -- emoji ou código do ícone
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak_days', 'total_xp', 'level_reached', 'habits_completed', 'habits_created', 'shares_made', 'special_condition')),
  requirement_value INTEGER NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE, -- conquistas secretas
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de conquistas dos usuários
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  shared_at TIMESTAMPTZ, -- quando foi compartilhado
  UNIQUE(user_id, achievement_id)
);

-- Tabela de estatísticas do usuário (para tracking de conquistas)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  total_habits_created INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  last_habit_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Achievements são públicos (todos podem ver)
CREATE POLICY "Achievements are public" ON achievements FOR SELECT TO authenticated USING (true);

-- User achievements - usuários só veem as próprias
CREATE POLICY "Users can view own achievements" ON user_achievements 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User stats - usuários só veem as próprias
CREATE POLICY "Users can view own stats" ON user_stats 
  FOR ALL USING (auth.uid() = user_id);

-- Inserir conquistas iniciais
INSERT INTO achievements (name, description, tier, category, icon, requirement_type, requirement_value) VALUES
-- STREAK - Bronze
('Primeiro Passo', 'Complete um hábito pela primeira vez', 'bronze', 'streak', '👶', 'habits_completed', 1),
('Constante', 'Mantenha uma sequência de 3 dias', 'bronze', 'streak', '🔥', 'streak_days', 3),
('Dedicado', 'Mantenha uma sequência de 7 dias', 'bronze', 'streak', '⭐', 'streak_days', 7),

-- STREAK - Prata
('Persistente', 'Mantenha uma sequência de 15 dias', 'prata', 'streak', '💪', 'streak_days', 15),
('Determinado', 'Mantenha uma sequência de 30 dias', 'prata', 'streak', '🏃', 'streak_days', 30),

-- STREAK - Ouro
('Imparável', 'Mantenha uma sequência de 60 dias', 'ouro', 'streak', '🚀', 'streak_days', 60),
('Disciplinado', 'Mantenha uma sequência de 100 dias', 'ouro', 'streak', '👑', 'streak_days', 100),

-- STREAK - Diamante
('Lendário', 'Mantenha uma sequência de 200 dias', 'diamante', 'streak', '💎', 'streak_days', 200),

-- STREAK - Relíquia
('Imortal', 'Mantenha uma sequência de 365 dias', 'reliquia', 'streak', '🏺', 'streak_days', 365),

-- XP - Bronze
('Iniciante', 'Acumule 100 XP total', 'bronze', 'xp', '🌟', 'total_xp', 100),
('Aventureiro', 'Acumule 500 XP total', 'bronze', 'xp', '⚔️', 'total_xp', 500),

-- XP - Prata  
('Experiente', 'Acumule 1.000 XP total', 'prata', 'xp', '🛡️', 'total_xp', 1000),
('Veterano', 'Acumule 5.000 XP total', 'prata', 'xp', '🏹', 'total_xp', 5000),

-- XP - Ouro
('Mestre', 'Acumule 10.000 XP total', 'ouro', 'xp', '🔮', 'total_xp', 10000),
('Grão-Mestre', 'Acumule 25.000 XP total', 'ouro', 'xp', '👑', 'total_xp', 25000),

-- XP - Diamante
('Ascendido', 'Acumule 50.000 XP total', 'diamante', 'xp', '💎', 'total_xp', 50000),

-- XP - Relíquia
('Divino', 'Acumule 100.000 XP total', 'reliquia', 'xp', '🏺', 'total_xp', 100000),

-- LEVEL - Bronze
('Subindo', 'Alcance o nível 5', 'bronze', 'level', '📈', 'level_reached', 5),
('Crescendo', 'Alcance o nível 10', 'bronze', 'level', '📊', 'level_reached', 10),

-- LEVEL - Prata
('Evoluindo', 'Alcance o nível 25', 'prata', 'level', '🚀', 'level_reached', 25),
('Poderoso', 'Alcance o nível 50', 'prata', 'level', '⚡', 'level_reached', 50),

-- LEVEL - Ouro
('Épico', 'Alcance o nível 100', 'ouro', 'level', '👑', 'level_reached', 100),

-- LEVEL - Diamante
('Transcendente', 'Alcance o nível 250', 'diamante', 'level', '💎', 'level_reached', 250),

-- LEVEL - Relíquia
('Infinito', 'Alcance o nível 500', 'reliquia', 'level', '🏺', 'level_reached', 500),

-- HABITS - Bronze
('Organizador', 'Crie 5 hábitos diferentes', 'bronze', 'habits', '📝', 'habits_created', 5),
('Produtivo', 'Complete 50 hábitos', 'bronze', 'habits', '✅', 'habits_completed', 50),

-- HABITS - Prata
('Sistemático', 'Crie 15 hábitos diferentes', 'prata', 'habits', '🗂️', 'habits_created', 15),
('Eficiente', 'Complete 200 hábitos', 'prata', 'habits', '⚡', 'habits_completed', 200),

-- HABITS - Ouro
('Arquiteto de Hábitos', 'Crie 30 hábitos diferentes', 'ouro', 'habits', '🏗️', 'habits_created', 30),
('Máquina', 'Complete 1.000 hábitos', 'ouro', 'habits', '🤖', 'habits_completed', 1000),

-- SOCIAL - Bronze
('Compartilhador', 'Compartilhe 1 conquista', 'bronze', 'social', '📱', 'shares_made', 1),
('Inspirador', 'Compartilhe 5 conquistas', 'bronze', 'social', '✨', 'shares_made', 5),

-- SOCIAL - Prata
('Influenciador', 'Compartilhe 15 conquistas', 'prata', 'social', '🌟', 'shares_made', 15),

-- SPECIAL - Várias
('Madrugador', 'Complete hábitos antes das 6h (especial)', 'bronze', 'special', '🌅', 'special_condition', 1),
('Noturno', 'Complete hábitos depois das 22h (especial)', 'bronze', 'special', '🌙', 'special_condition', 2),
('Fim de Semana', 'Complete hábitos no weekend (especial)', 'prata', 'special', '🏖️', 'special_condition', 3),
('Perfeccionista', 'Complete todos os hábitos do dia 10x (especial)', 'ouro', 'special', '💯', 'special_condition', 4);

-- Trigger para criar user_stats automaticamente
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_user_stats();

-- Função para verificar e desbloquear conquistas
CREATE OR REPLACE FUNCTION check_achievements(user_uuid UUID)
RETURNS void AS $$
DECLARE
  user_profile RECORD;
  user_stat RECORD;
  achievement RECORD;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  SELECT * INTO user_stat FROM user_stats WHERE user_id = user_uuid;
  
  -- Verificar conquistas de XP
  FOR achievement IN 
    SELECT * FROM achievements 
    WHERE requirement_type = 'total_xp' 
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_uuid)
  LOOP
    IF user_profile.xp >= achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_uuid, achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Verificar conquistas de Level
  FOR achievement IN 
    SELECT * FROM achievements 
    WHERE requirement_type = 'level_reached'
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_uuid)
  LOOP
    IF user_profile.level >= achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_uuid, achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Verificar conquistas de Streak
  FOR achievement IN 
    SELECT * FROM achievements 
    WHERE requirement_type = 'streak_days'
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_uuid)
  LOOP
    IF user_stat.longest_streak >= achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_uuid, achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  -- Verificar conquistas de Hábitos
  FOR achievement IN 
    SELECT * FROM achievements 
    WHERE requirement_type IN ('habits_completed', 'habits_created')
    AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_uuid)
  LOOP
    IF (achievement.requirement_type = 'habits_completed' AND user_stat.total_habits_completed >= achievement.requirement_value) OR
       (achievement.requirement_type = 'habits_created' AND user_stat.total_habits_created >= achievement.requirement_value) THEN
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_uuid, achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar compartilhamentos
CREATE OR REPLACE FUNCTION increment_user_shares(user_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_stats 
  SET total_shares = COALESCE(total_shares, 0) + 1,
      updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Se não existe, criar
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, total_shares, updated_at) 
    VALUES (user_uuid, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_shares = COALESCE(user_stats.total_shares, 0) + 1,
      updated_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;
