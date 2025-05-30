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

export default function Comunidade() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          projects (
            *,
            prompts (*)
          )
        `)
        .eq('is_public', true);

      if (error) throw error;
      setOrganizations(data || []);
    } catch (err) {
      setError('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const clonePrompt = async (prompt: Prompt) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Você precisa estar logado para clonar prompts');
        return;
      }

      await supabase
        .from('prompts')
        .insert([{
          ...prompt,
          id: undefined,
          user_id: user.id,
          is_public: false
        }]);

      alert('Prompt clonado com sucesso!');
    } catch (err) {
      setError('Erro ao clonar prompt');
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Comunidade</h1>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar organizações ou projetos..."
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map(org => (
            <div key={org.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-2">{org.name}</h2>
              <p className="text-gray-600 mb-4">{org.description}</p>

              <div className="space-y-4">
                {org.projects.map(project => (
                  <div key={project.id} className="border-t pt-4">
                    <h3 className="font-medium mb-2">{project.name}</h3>
                    <div className="space-y-2">
                      {project.prompts.map(prompt => (
                        <div key={prompt.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{prompt.title}</h4>
                              <p className="text-sm text-gray-600">{prompt.category}</p>
                            </div>
                            <button
                              onClick={() => clonePrompt(prompt)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Clonar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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