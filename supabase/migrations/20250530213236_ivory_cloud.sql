-- Function to check if table exists
CREATE OR REPLACE FUNCTION table_exists(tbl text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = tbl
  );
END;
$$ LANGUAGE plpgsql;

-- Create organizations table if it doesn't exist
DO $$ BEGIN
  IF NOT table_exists('organizations') THEN
    CREATE TABLE organizations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;
END $$;

-- Create projects table if it doesn't exist
DO $$ BEGIN
  IF NOT table_exists('projects') THEN
    CREATE TABLE projects (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;
END $$;

-- Create domains table if it doesn't exist
DO $$ BEGIN
  IF NOT table_exists('domains') THEN
    CREATE TABLE domains (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      available BOOLEAN NOT NULL,
      suggestions TEXT[],
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organizações públicas são visíveis para todos" ON organizations;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias organizações" ON organizations;
DROP POLICY IF EXISTS "Usuários podem criar organizações" ON organizations;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias organizações" ON organizations;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias organizações" ON organizations;

DROP POLICY IF EXISTS "Projetos são visíveis para usuários da organização" ON projects;
DROP POLICY IF EXISTS "Usuários podem criar projetos em suas organizações" ON projects;
DROP POLICY IF EXISTS "Usuários podem atualizar projetos em suas organizações" ON projects;
DROP POLICY IF EXISTS "Usuários podem deletar projetos em suas organizações" ON projects;

DROP POLICY IF EXISTS "Prompts públicos são visíveis para todos" ON prompts;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios prompts" ON prompts;
DROP POLICY IF EXISTS "Usuários podem criar prompts" ON prompts;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios prompts" ON prompts;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios prompts" ON prompts;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios domínios" ON domains;
DROP POLICY IF EXISTS "Usuários podem criar domínios" ON domains;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios domínios" ON domains;

-- Create policies for organizations
CREATE POLICY "Organizações públicas são visíveis para todos"
  ON organizations FOR SELECT
  USING (is_public = true);

CREATE POLICY "Usuários podem ver suas próprias organizações"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar organizações"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias organizações"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias organizações"
  ON organizations FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for projects
CREATE POLICY "Projetos são visíveis para usuários da organização"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = projects.organization_id
      AND (organizations.is_public = true OR organizations.user_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem criar projetos em suas organizações"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = projects.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar projetos em suas organizações"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = projects.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar projetos em suas organizações"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = projects.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

-- Create policies for prompts
CREATE POLICY "Prompts públicos são visíveis para todos"
  ON prompts FOR SELECT
  USING (is_public = true);

CREATE POLICY "Usuários podem ver seus próprios prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for domains
CREATE POLICY "Usuários podem ver seus próprios domínios"
  ON domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar domínios"
  ON domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios domínios"
  ON domains FOR DELETE
  USING (auth.uid() = user_id);