import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Repertorio() {
  const [aberturas, setAberturas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário de nova abertura
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nomeNovaAbertura, setNomeNovaAbertura] = useState('');
  const [corNovaAbertura, setCorNovaAbertura] = useState('Brancas'); // Padrão
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarAberturas();
  }, []);

  async function carregarAberturas() {
    try {
      const response = await api.get('/aberturas');
      setAberturas(response.data);
    } catch (error) {
      console.error("Erro ao carregar aberturas", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Função que envia a nova abertura para o backend
  const handleCriarAbertura = async (e) => {
    e.preventDefault();
    try {
      // Envia o DTO esperado pelo AberturasController
      const response = await api.post('/aberturas', {
        nome: nomeNovaAbertura,
        cor: corNovaAbertura
      });

      // Adiciona a nova abertura na lista atual da tela (sem precisar recarregar a página!)
      setAberturas([...aberturas, response.data]);
      
      // Limpa e esconde o formulário
      setNomeNovaAbertura('');
      setCorNovaAbertura('Brancas');
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Erro ao criar abertura", error);
      alert("Erro ao salvar a abertura. Verifique os dados.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Carregando seu repertório...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Meu Repertório de Xadrez</h1>
          <div className="space-x-4">
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {mostrarFormulario ? 'Cancelar' : '+ Nova Abertura'}
            </button>
            <button 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Formulário de Nova Abertura */}
        {mostrarFormulario && (
          <form onSubmit={handleCriarAbertura} className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Abertura</label>
              <input
                type="text"
                placeholder="Ex: Defesa Siciliana"
                value={nomeNovaAbertura}
                onChange={(e) => setNomeNovaAbertura(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <select
                value={corNovaAbertura}
                onChange={(e) => setCorNovaAbertura(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="Brancas">Brancas</option>
                <option value="Pretas">Pretas</option>
              </select>
            </div>
            <button 
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium h-10"
            >
              Salvar
            </button>
          </form>
        )}

        {/* Lista de Aberturas */}
        {aberturas.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center border-dashed border-2 border-gray-300">
            <p className="text-gray-500">Seu repertório está vazio.</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "+ Nova Abertura" acima para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aberturas.map(abertura => (
              <div key={abertura.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{abertura.nome}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    abertura.cor === 'Brancas' ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-gray-800 text-white'
                  }`}>
                    {abertura.cor}
                  </span>
                </div>
                <button 
                    onClick={() => navigate(`/aberturas/${abertura.id}/variantes`)}
                    className="mt-6 text-sm text-blue-600 font-medium text-left hover:underline"
                >
                    Ver Variantes →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}