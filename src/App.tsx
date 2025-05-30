import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from './lib/supabase';
import Domimup from './pages/Domimup';
import Comunidade from './pages/Comunidade';
import OrganizationManager from './components/OrganizationManager';
import Auth from './components/Auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user } = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-800">
                    PromptUP
                  </Link>
                </div>
                {user && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/domimup"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      Domimup
                    </Link>
                    <Link
                      to="/comunidade"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      Comunidade
                    </Link>
                    <Link
                      to="/organizacoes"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      Organizações
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Sair
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Rotas */}
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
          <Route
            path="/domimup"
            element={
              <ProtectedRoute>
                <Domimup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunidade"
            element={
              <ProtectedRoute>
                <Comunidade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizacoes"
            element={
              <ProtectedRoute>
                <OrganizationManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <div className="p-8">
                  <h1 className="text-3xl font-bold mb-4">Bem-vindo ao PromptUP</h1>
                  <p className="text-gray-600">
                    Escolha uma das opções no menu acima para começar.
                  </p>
                </div>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
