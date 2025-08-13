-- =============================================
-- HabitQuest RPG - Sistema de Missões Diárias
-- =============================================

-- Tabela de tipos de missões disponíveis
CREATE TABLE IF NOT EXISTS mission_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  requirement_type text NOT NULL, -- 'habits_completed', 'login_streak', 'xp_gained', etc.
  requirement_value integer NOT NULL,
  xp_reward integer NOT NULL DEFAULT 50,
  icon text DEFAULT '🎯',
  is_daily boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de missões do usuário (progresso individual)
CREATE TABLE IF NOT EXISTS user_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_type_id uuid REFERENCES mission_types(id) ON DELETE CASCADE NOT NULL,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  date_assigned date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, mission_type_id, date_assigned)
);

-- Habilitar RLS
ALTER TABLE mission_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mission_types (todos podem ver, mas só admins podem modificar)
CREATE POLICY "Anyone can view mission types" ON mission_types
  FOR SELECT USING (true);

-- Políticas RLS para user_missions
CREATE POLICY "Users can view own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

-- Inserir missões diárias padrão
INSERT INTO mission_types (name, description, requirement_type, requirement_value, xp_reward, icon) VALUES
  ('Complete 3 hábitos', 'Complete 3 hábitos diferentes hoje', 'habits_completed', 3, 50, '🎯'),
  ('Faça login por 5 dias', 'Mantenha uma sequência de 5 dias fazendo login', 'login_streak', 5, 100, '🔥'),
  ('Ganhe 200 XP', 'Acumule 200 XP em um único dia', 'xp_gained_daily', 200, 75, '⭐'),
  ('Complete 1 hábito', 'Complete pelo menos 1 hábito hoje', 'habits_completed', 1, 25, '✅'),
  ('Sequência de 3 dias', 'Complete hábitos por 3 dias consecutivos', 'habit_streak', 3, 80, '🏆')
ON CONFLICT DO NOTHING;

-- Função para criar missões diárias para um usuário
CREATE OR REPLACE FUNCTION create_daily_missions_for_user(user_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Criar missões diárias básicas para o usuário se ainda não existirem hoje
  INSERT INTO user_missions (user_id, mission_type_id, date_assigned)
  SELECT 
    user_uuid,
    mt.id,
    CURRENT_DATE
  FROM mission_types mt
  WHERE mt.is_daily = true
    AND NOT EXISTS (
      SELECT 1 FROM user_missions um 
      WHERE um.user_id = user_uuid 
        AND um.mission_type_id = mt.id 
        AND um.date_assigned = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar e atualizar progresso das missões
CREATE OR REPLACE FUNCTION update_mission_progress()
RETURNS trigger AS $$
DECLARE
  mission_record RECORD;
  habits_completed_today integer;
  xp_gained_today integer;
BEGIN
  -- Atualizar progresso das missões do usuário
  FOR mission_record IN 
    SELECT um.id, um.user_id, um.mission_type_id, um.current_progress, mt.requirement_type, mt.requirement_value
    FROM user_missions um
    JOIN mission_types mt ON um.mission_type_id = mt.id
    WHERE um.user_id = NEW.user_id 
      AND um.date_assigned = CURRENT_DATE
      AND um.is_completed = false
  LOOP
    -- Verificar progresso baseado no tipo de requirement
    CASE mission_record.requirement_type
      WHEN 'habits_completed' THEN
        -- Contar hábitos únicos completados hoje
        SELECT COUNT(DISTINCT habit_id) INTO habits_completed_today
        FROM habit_logs 
        WHERE user_id = NEW.user_id 
          AND DATE(created_at) = CURRENT_DATE;
        
        -- Atualizar progresso
        UPDATE user_missions 
        SET current_progress = habits_completed_today,
            is_completed = (habits_completed_today >= mission_record.requirement_value),
            completed_at = CASE 
              WHEN habits_completed_today >= mission_record.requirement_value THEN now() 
              ELSE completed_at 
            END
        WHERE id = mission_record.id;
        
      WHEN 'xp_gained_daily' THEN
        -- Calcular XP ganho hoje
        SELECT COALESCE(SUM(h.xp_value), 0) INTO xp_gained_today
        FROM habit_logs hl
        JOIN habits h ON hl.habit_id = h.id
        WHERE hl.user_id = NEW.user_id 
          AND DATE(hl.created_at) = CURRENT_DATE;
        
        -- Atualizar progresso
        UPDATE user_missions 
        SET current_progress = xp_gained_today,
            is_completed = (xp_gained_today >= mission_record.requirement_value),
            completed_at = CASE 
              WHEN xp_gained_today >= mission_record.requirement_value THEN now() 
              ELSE completed_at 
            END
        WHERE id = mission_record.id;
    END CASE;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar missões automaticamente quando hábitos são completados
DROP TRIGGER IF EXISTS update_missions_on_habit_completion ON habit_logs;
CREATE TRIGGER update_missions_on_habit_completion
  AFTER INSERT ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_mission_progress();

-- Função para criar missões diárias quando usuário faz login
CREATE OR REPLACE FUNCTION ensure_daily_missions()
RETURNS trigger AS $$
BEGIN
  -- Criar missões diárias para hoje se não existirem
  PERFORM create_daily_missions_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar missões quando perfil é criado/atualizado
DROP TRIGGER IF EXISTS create_daily_missions_on_profile_update ON profiles;
CREATE TRIGGER create_daily_missions_on_profile_update
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_daily_missions();

-- Função para recompensar missões completadas
CREATE OR REPLACE FUNCTION reward_completed_missions()
RETURNS void AS $$
DECLARE
  mission_record RECORD;
BEGIN
  -- Encontrar missões completadas que ainda não foram recompensadas
  FOR mission_record IN 
    SELECT um.id, um.user_id, mt.xp_reward
    FROM user_missions um
    JOIN mission_types mt ON um.mission_type_id = mt.id
    WHERE um.is_completed = true 
      AND um.completed_at > now() - INTERVAL '1 minute' -- Recém completadas
  LOOP
    -- Adicionar XP ao usuário
    UPDATE profiles 
    SET xp = xp + mission_record.xp_reward
    WHERE id = mission_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- View para facilitar consultas de missões
CREATE OR REPLACE VIEW user_missions_view AS
SELECT 
  um.id,
  um.user_id,
  mt.name,
  mt.description,
  mt.requirement_type,
  mt.requirement_value,
  um.current_progress,
  mt.xp_reward,
  mt.icon,
  um.is_completed,
  um.completed_at,
  um.date_assigned,
  CASE 
    WHEN um.current_progress >= mt.requirement_value THEN 100
    ELSE ROUND((um.current_progress::float / mt.requirement_value::float) * 100)
  END as progress_percentage
FROM user_missions um
JOIN mission_types mt ON um.mission_type_id = mt.id;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_missions_user_date ON user_missions(user_id, date_assigned);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed ON user_missions(is_completed, completed_at);
