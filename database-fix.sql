-- HabitQuest RPG - Correções para Banco Existente
-- Execute estes comandos se você já executou o database.sql anterior

-- 1. Remover trigger e função existentes (se houver)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Criar nova função para criar perfil automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp, level)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Herói'), 0, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para executar a função após novo usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar se as políticas estão corretas
-- Se necessário, recriar as políticas para profiles

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 5. Verificar usuários existentes sem perfil e criar perfis
-- CUIDADO: Execute apenas se necessário
/*
INSERT INTO public.profiles (id, username, xp, level)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', 'Herói') as username,
  0 as xp,
  1 as level
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);
*/

-- 6. Verificar se tudo está funcionando
SELECT 'Função criada' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'handle_new_user'
);

SELECT 'Trigger criado' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created'
);
