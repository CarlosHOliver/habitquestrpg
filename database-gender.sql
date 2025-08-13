-- Adicionar coluna de gênero na tabela profiles
ALTER TABLE profiles 
ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('masculino', 'feminino')) DEFAULT 'masculino';

-- Atualizar a política RLS se necessário (já deve estar funcionando)
-- As políticas existentes já cobrem todas as colunas da tabela profiles
