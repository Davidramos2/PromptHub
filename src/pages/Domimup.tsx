import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Domain {
  id: string;
  name: string;
  available: boolean;
  suggestions?: string[];
  checkedAt: string;
}

export default function Domimup() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedDomains();
  }, []);

  const loadSavedDomains = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        setError('Erro ao carregar domínios salvos');
        return;
      }
      
      setDomains(data || []);
    }
  };

  const checkDomain = async (domain: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Aqui você implementará a chamada para a API do GoDaddy
      // Por enquanto, vamos simular uma resposta
      const isAvailable = Math.random() > 0.5;
      const suggestions = isAvailable ? [] : [
        `${domain}-app.com`,
        `${domain}-io.com`,
        `${domain}-dev.com`
      ];

      const newDomainData: Domain = {
        id: Date.now().toString(),
        name: domain,
        available: isAvailable,
        suggestions,
        checkedAt: new Date().toISOString()
      };

      setDomains(prev => [...prev, newDomainData]);
      
      // Salvar no Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('domains')
          .insert([{
            ...newDomainData,
            user_id: user.id
          }]);
      }
    } catch (err) {
      setError('Erro ao verificar domínio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Domínios Verificados</h2>
          <div className="space-y-2">
            {domains.map(domain => (
              <div
                key={domain.id}
                className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => setNewDomain(domain.name)}
              >
                <div className="font-medium">{domain.name}</div>
                <div className={`text-sm ${domain.available ? 'text-green-600' : 'text-red-600'}`}>
                  {domain.available ? 'Disponível' : 'Indisponível'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Verificador de Domínios</h1>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="Digite um domínio (ex: meusite.com)"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => checkDomain(newDomain)}
                disabled={loading || !newDomain}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>

            {error && (
              <div className="text-red-600">{error}</div>
            )}

            {domains.length > 0 && domains[domains.length - 1].suggestions && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Sugestões de domínios similares:</h3>
                <div className="space-y-2">
                  {domains[domains.length - 1].suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setNewDomain(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 