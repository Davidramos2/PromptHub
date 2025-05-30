import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Organization {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  prompts: Prompt[];
}

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          projects (
            *,
            prompts (*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      setError('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: newOrgName,
          description: newOrgDesc,
          user_id: user.id,
          is_public: false
        }])
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => [...prev, data]);
      setNewOrgName('');
      setNewOrgDesc('');
    } catch (err) {
      setError('Erro ao criar organização');
    }
  };

  const createProject = async () => {
    if (!selectedOrg) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProjectName,
          description: newProjectDesc,
          organization_id: selectedOrg.id
        }])
        .select()
        .single();

      if (error) throw error;

      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrg.id
          ? { ...org, projects: [...org.projects, data] }
          : org
      ));
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      setError('Erro ao criar projeto');
    }
  };

  const unifyPrompts = async () => {
    if (!selectedProject) return;

    try {
      const prompts = selectedProject.prompts;
      const unifiedPrompt = prompts.map(p => p.content).join('\n\n');
      
      // Aqui você pode implementar a lógica para salvar o prompt unificado
      // ou gerar um arquivo para download
      console.log('Prompt unificado:', unifiedPrompt);
    } catch (err) {
      setError('Erro ao unificar prompts');
    }
  };

  const generateFile = async (format: 'js' | 'py' | 'ts') => {
    if (!selectedProject) return;

    try {
      const prompts = selectedProject.prompts;
      let content = '';

      switch (format) {
        case 'js':
          content = `// ${selectedProject.name}\n\n${prompts.map(p => `// ${p.title}\n${p.content}`).join('\n\n')}`;
          break;
        case 'ts':
          content = `// ${selectedProject.name}\n\n${prompts.map(p => `// ${p.title}\n${p.content}`).join('\n\n')}`;
          break;
        case 'py':
          content = `# ${selectedProject.name}\n\n${prompts.map(p => `# ${p.title}\n${p.content}`).join('\n\n')}`;
          break;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao gerar arquivo');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gerenciador de Organizações</h1>

        {/* Criar Nova Organização */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Nova Organização</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Nome da organização"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={newOrgDesc}
              onChange={(e) => setNewOrgDesc(e.target.value)}
              placeholder="Descrição da organização"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={createOrganization}
              disabled={!newOrgName}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Criar Organização
            </button>
          </div>
        </div>

        {/* Lista de Organizações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map(org => (
            <div
              key={org.id}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer ${
                selectedOrg?.id === org.id ? 'ring-2 ring-blue-600' : ''
              }`}
              onClick={() => setSelectedOrg(org)}
            >
              <h2 className="text-xl font-bold mb-2">{org.name}</h2>
              <p className="text-gray-600 mb-4">{org.description}</p>

              {/* Criar Novo Projeto */}
              {selectedOrg?.id === org.id && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Novo Projeto</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Nome do projeto"
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Descrição do projeto"
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={createProject}
                      disabled={!newProjectName}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Criar Projeto
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Projetos */}
              <div className="space-y-4 mt-4">
                {org.projects.map(project => (
                  <div
                    key={project.id}
                    className={`p-3 rounded ${
                      selectedProject?.id === project.id ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                  >
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    
                    {selectedProject?.id === project.id && (
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unifyPrompts();
                          }}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          Unificar Prompts
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateFile('js');
                          }}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          Gerar .js
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateFile('ts');
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Gerar .ts
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateFile('py');
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Gerar .py
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 