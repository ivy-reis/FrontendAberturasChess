import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Variantes() {
  const { id } = useParams(); // Pega o ID da abertura na URL
  const navigate = useNavigate();
  
  const [abertura, setAbertura] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [lances, setLances] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        // Busca os detalhes da abertura
        const resAbertura = await api.get(`/aberturas/${id}`);
        setAbertura(resAbertura.data);

        // Busca todas as variantes e filtra as que pertencem a esta abertura
        // (Nota: Se o seu backend já retorna as variantes dentro de resAbertura.data, você pode ajustar aqui)
        const resVariantes = await api.get('/variantes');
        const variantesDestaAbertura = resVariantes.data.filter(v => v.aberturaId === parseInt(id));
        setVariantes(variantesDestaAbertura);
        
      } catch (error) {
        console.error("Erro ao carregar dados", error);
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id, navigate]);

  const handleCriarVariante = async (e) => {
    e.preventDefault();
    try {
      // Envia o DTO para o VariantesController
      const response = await api.post('/variantes', {
        nome,
        lances,
        aberturaId: parseInt(id)
      });

      // Atualiza a lista na tela
      setVariantes([...variantes, response.data]);
      
      // Limpa o formulário
      setNome('');
      setLances('');
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Erro ao criar variante", error);
      alert("Erro ao salvar a variante.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Carregando variantes...</div>;
  if (!abertura) return <div className="p-8 text-center text-red-600">Abertura não encontrada!</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho com botão de Voltar */}
        <header className="mb-8">
          <Link to="/repertorio" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Voltar para o Repertório
          </Link>
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-blue-500">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{abertura.nome}</h1>
              <p className="text-gray-600">Cor: <span className="font-semibold">{abertura.cor}</span></p>
            </div>
            <button 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {mostrarFormulario ? 'Cancelar' : '+ Nova Variante'}
            </button>
          </div>
        </header>

        {/* Formulário de Nova Variante */}
        {mostrarFormulario && (
          <form onSubmit={handleCriarVariante} className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Variante</label>
              <input
                type="text"
                placeholder="Ex: Variante Najdorf"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lances (Notação Algébrica)</label>
              <input
                type="text"
                placeholder="Ex: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6"
                value={lances}
                onChange={(e) => setLances(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-medium self-end"
            >
              Salvar Variante
            </button>
          </form>
        )}

        {/* Lista de Variantes */}
        {variantes.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center border-dashed border-2 border-gray-300">
            <p className="text-gray-500">Nenhuma variante cadastrada para esta abertura.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {variantes.map(variante => (
              <div key={variante.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{variante.nome}</h3>
                <div className="bg-gray-100 p-3 rounded border border-gray-200 font-mono text-sm text-gray-700 break-words">
                  {variante.lances}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}