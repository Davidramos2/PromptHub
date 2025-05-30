-- Criar tabela de organizações
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de projetos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de prompts
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de domínios
CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  available BOOLEAN NOT NULL,
  suggestions TEXT[],
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar políticas de segurança
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Políticas para organizações
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

-- Políticas para projetos
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

-- Políticas para prompts
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

-- Políticas para domínios
CREATE POLICY "Usuários podem ver seus próprios domínios"
  ON domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar domínios"
  ON domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios domínios"
  ON domains FOR DELETE
  USING (auth.uid() = user_id); 