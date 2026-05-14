import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function Repertorio() {
  const navigate = useNavigate();
  
  const [aberturas, setAberturas] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [aberturaAtiva, setAberturaAtiva] = useState(null);
  const [varianteAtiva, setVarianteAtiva] = useState(null);
  const [posicaoFen, setPosicaoFen] = useState('start');
  const [orientacao, setOrientacao] = useState('white');
  const [modoPainel, setModoPainel] = useState('menu'); 
  
  const [termoBusca, setTermoBusca] = useState('');
  const [formAbertura, setFormAbertura] = useState({ nome: '', cor: 'Brancas' });
  const [formVariante, setFormVariante] = useState({ nome: '', lances: '' });

  const carregarTudo = useCallback(async () => {
    try {
      const [resAberturas, resVariantes] = await Promise.all([
        api.get('/aberturas'),
        api.get('/variantes')
      ]);
      setAberturas(resAberturas.data);
      setVariantes(resVariantes.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  // ==========================================
  // LÓGICA PURA E DIRETA DO TABULEIRO
  // ==========================================
  const atualizarTabuleiro = (variante, abertura) => {
    const game = new Chess();
    
    try {
      // Lê o PGN original em inglês
      game.loadPgn(variante.lances);
      
      // Aplica a nova posição e inverte a câmera se for a vez das Pretas
      setPosicaoFen(game.fen());
      setOrientacao(abertura.cor === 'Pretas' ? 'black' : 'white');
      setAberturaAtiva(abertura);
      setVarianteAtiva(variante);
      setModoPainel('menu');
    } catch (e) {
      alert("Erro na notação! Certifique-se de usar o padrão PGN em Inglês (ex: 1. d4 Nf6)");
    }
  };

  // Funções de CRUD
  const salvarAbertura = async (e) => {
    e.preventDefault();
    try {
      if (modoPainel === 'editAbertura') {
        const res = await api.put(`/aberturas/${aberturaAtiva.id}`, formAbertura);
        setAberturas(aberturas.map(a => a.id === aberturaAtiva.id ? res.data : a));
      } else {
        const res = await api.post('/aberturas', formAbertura);
        setAberturas([...aberturas, res.data]);
      }
      setModoPainel('menu');
    } catch (error) {
      alert('Erro ao salvar abertura.');
    }
  };

  const salvarVariante = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formVariante, aberturaId: aberturaAtiva.id };
      if (modoPainel === 'editVariante') {
        const res = await api.put(`/variantes/${varianteAtiva.id}`, payload);
        setVariantes(variantes.map(v => v.id === varianteAtiva.id ? res.data : v));
        atualizarTabuleiro(res.data, aberturaAtiva);
      } else {
        const res = await api.post('/variantes', payload);
        setVariantes([...variantes, res.data]);
        atualizarTabuleiro(res.data, aberturaAtiva);
      }
    } catch (error) {
      alert('Erro ao salvar variante.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const aberturasFiltradas = aberturas.filter(a => {
    if (termoBusca === '') return true;
    const vars = variantes.filter(v => v.aberturaId === a.id);
    return a.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
           vars.some(v => v.nome.toLowerCase().includes(termoBusca.toLowerCase()));
  });

  if (loading) return <div className="h-screen bg-pink-50 flex items-center justify-center text-purple-900 font-bold text-xl">Carregando repertório...</div>;

  return (
    <div className="flex h-screen w-full bg-pink-50 text-slate-800 overflow-hidden font-sans">
      
      {/* =========================================
          COLUNA 1: MENU LATERAL ESQUERDO
          ========================================= */}
      <aside className="w-80 bg-purple-950 flex flex-col shrink-0 z-30 shadow-2xl relative">
        <div className="p-6 flex flex-col gap-4 border-b border-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-pink-500 p-2 rounded-lg text-white font-black text-xl shadow-lg">♚</div>
            <h1 className="text-2xl font-black tracking-tight text-white">Repertório</h1>
          </div>
          
          <div className="bg-purple-900/80 rounded-xl flex items-center px-3 py-3 border-2 border-purple-700/50 focus-within:border-pink-500 transition-colors shadow-inner">
            <span className="text-pink-400 mr-2 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Pesquisar aberturas..." 
              className="bg-transparent border-none text-white text-base outline-none w-full placeholder-purple-300/50 font-medium"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {['Brancas', 'Pretas'].map(cor => {
            const aberturasDaCor = aberturasFiltradas.filter(a => a.cor === cor);
            if (aberturasDaCor.length === 0) return null;

            return (
              <div key={cor} className="mb-8">
                <div className="px-4 py-2 text-xs font-black text-pink-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                  {cor === 'Brancas' ? '⚪' : '⚫'} {cor}
                </div>
                
                {aberturasDaCor.map(abertura => (
                  <div key={abertura.id} className="group relative mb-1">
                    <button 
                      onClick={() => { setAberturaAtiva(abertura); setModoPainel('menu'); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-base font-bold flex items-center justify-between ${aberturaAtiva?.id === abertura.id ? 'bg-purple-800 text-white shadow-md' : 'text-purple-200 hover:bg-purple-900/80 hover:text-white'}`}
                    >
                      <span className="truncate pr-2">{abertura.nome}</span>
                      <span className="text-pink-400 opacity-50 group-hover:rotate-90 transition-transform">▶</span>
                    </button>
                    
                    {variantes.filter(v => v.aberturaId === abertura.id).length > 0 && (
                      <div className="hidden group-hover:block w-full bg-purple-900/80 rounded-2xl shadow-inner border border-purple-700/50 p-2 mt-1 mb-2">
                        <div className="px-3 py-1 text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1">Linhas de Estudo</div>
                        {variantes.filter(v => v.aberturaId === abertura.id).map(v => {
                          const isMatchBusca = termoBusca && v.nome.toLowerCase().includes(termoBusca.toLowerCase());
                          return (
                            <button 
                              key={v.id}
                              onClick={(e) => { e.stopPropagation(); atualizarTabuleiro(v, abertura); }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors text-sm font-medium flex items-center gap-2 ${varianteAtiva?.id === v.id ? 'bg-pink-500 text-white font-bold shadow-md' : 'text-purple-100 hover:bg-purple-700 hover:text-white'} ${isMatchBusca ? 'ring-2 ring-pink-400' : ''}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                              <span className="truncate">{v.nome}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto p-5 bg-purple-900/50 border-t border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden border-2 border-pink-400">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy`} alt="Avatar" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight">Ivy Oliveira</span>
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Premium</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 bg-purple-800 hover:bg-pink-600 text-white rounded-xl transition-colors shadow-md" title="Sair">🚪</button>
        </div>
      </aside>

      {/* =========================================
          COLUNA 2: TABULEIRO (CENTRO)
          ========================================= */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          
          <div className="w-[480px] flex items-center justify-between px-2 text-purple-900 font-bold text-sm uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <span className="text-2xl opacity-50">♟</span> Adversário
            </div>
          </div>

          {/* Wrapper blindado para garantir largura fixa e preservar estilos */}
          <div style={{ width: '492px', height: '492px' }} className="shadow-2xl rounded-sm overflow-hidden border-[6px] border-purple-950 bg-pink-100 flex items-center justify-center">
            <Chessboard 
              id="TabuleiroPrincipal"
              boardWidth={480}
              position={posicaoFen} 
              boardOrientation={orientacao}
              arePiecesDraggable={false}
              animationDuration={300}
              customDarkSquareStyle={{ backgroundColor: '#D81B60' }} 
              customLightSquareStyle={{ backgroundColor: '#FCE4EC' }} 
            />
          </div>

          <div className="w-[480px] flex items-center justify-between px-2 text-purple-900 font-black text-lg">
            <div className="flex items-center gap-2">
               <span className="text-2xl text-purple-900">♙</span> Você
            </div>
          </div>

        </div>
      </main>

      {/* =========================================
          COLUNA 3: PAINEL DIREITO
          ========================================= */}
      <aside className="w-[420px] bg-pink-100 flex flex-col shrink-0 z-20 border-l-2 border-pink-200 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
        <div className="p-8 pb-4 flex flex-col gap-2">
          <h2 className="text-3xl font-black text-purple-950 tracking-tight">Estudos & Ações</h2>
          <p className="text-purple-700 font-medium">Gerencie seu arsenal de aberturas</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4">
          {modoPainel === 'menu' ? (
            <>
              <button 
                onClick={() => { setFormAbertura({nome: '', cor: 'Brancas'}); setModoPainel('formAbertura'); }}
                className="w-full bg-white hover:bg-pink-50 p-6 rounded-3xl flex items-center gap-5 transition-all shadow-lg border border-pink-100 hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">✨</div>
                <div className="text-left">
                  <div className="font-black text-xl text-purple-950 mb-1">Nova Abertura</div>
                  <div className="text-sm font-medium text-purple-600">Criar uma nova base teórica</div>
                </div>
              </button>

              {aberturaAtiva ? (
                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-pink-300 flex-1"></div>
                    <span className="text-xs font-black text-purple-800 uppercase tracking-widest bg-pink-200 px-3 py-1 rounded-full">{aberturaAtiva.nome}</span>
                    <div className="h-px bg-pink-300 flex-1"></div>
                  </div>

                  <button 
                    onClick={() => { setFormVariante({nome: '', lances: ''}); setModoPainel('formVariante'); }}
                    className="w-full bg-purple-900 hover:bg-purple-800 p-6 rounded-3xl flex items-center gap-5 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  >
                    <div className="text-white text-4xl font-light group-hover:rotate-90 transition-transform">+</div>
                    <div className="text-left">
                      <div className="font-black text-xl text-white mb-1">Adicionar Variante</div>
                      <div className="text-sm font-medium text-purple-300">Inserir nova linha com notação</div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="mt-8 bg-pink-200/50 border-2 border-dashed border-pink-300 rounded-3xl p-8 text-center">
                  <span className="text-4xl mb-4 block opacity-50">👈</span>
                  <p className="text-purple-800 font-bold">Selecione uma abertura no menu esquerdo para adicionar variantes a ela.</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
               <h3 className="text-2xl font-black text-purple-950 mb-6">
                 {modoPainel.includes('Abertura') ? (modoPainel === 'editAbertura' ? 'Editar Abertura' : 'Nova Abertura') : (modoPainel === 'editVariante' ? 'Editar Variante' : 'Nova Variante')}
               </h3>
               
               <form className="space-y-5" onSubmit={modoPainel.includes('Abertura') ? salvarAbertura : salvarVariante}>
                 {modoPainel.includes('Abertura') ? (
                   <>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Nome da Abertura</label>
                      <input type="text" value={formAbertura.nome} onChange={e => setFormAbertura({...formAbertura, nome: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500 transition-colors" placeholder="Ex: Defesa Siciliana" />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Cor</label>
                      <select value={formAbertura.cor} onChange={e => setFormAbertura({...formAbertura, cor: e.target.value})} className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500 transition-colors">
                        <option value="Brancas">Brancas</option>
                        <option value="Pretas">Pretas</option>
                      </select>
                    </div>
                   </>
                 ) : (
                    <>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Nome da Linha</label>
                      <input type="text" value={formVariante.nome} onChange={e => setFormVariante({...formVariante, nome: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500 transition-colors" placeholder="Ex: Variante Dragão" />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Notação PGN</label>
                      <textarea rows="4" value={formVariante.lances} onChange={e => setFormVariante({...formVariante, lances: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-mono font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500 transition-colors resize-none" placeholder="1. e4 c5..." />
                    </div>
                    </>
                 )}
                 <div className="pt-4 space-y-3">
                    <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                      Salvar Alterações
                    </button>
                    <button onClick={() => setModoPainel('menu')} type="button" className="w-full bg-transparent hover:bg-pink-50 text-purple-700 font-bold text-lg py-4 rounded-2xl transition-all">
                      Cancelar
                    </button>
                 </div>
               </form>
            </div>
          )}
        </div>

        {varianteAtiva && modoPainel === 'menu' && (
          <div className="p-8 bg-white border-t-2 border-pink-200 mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
             <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <span className="text-xl">🎯</span>
                   <div className="text-sm font-black text-purple-900 uppercase tracking-widest">Notação em Estudo</div>
                 </div>
                 
                 <button 
                   onClick={() => {
                     setFormVariante({ nome: varianteAtiva.nome, lances: varianteAtiva.lances });
                     setModoPainel('editVariante');
                   }}
                   className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                 >
                   <span>✏️</span> EDITAR VARIANTE
                 </button>
               </div>

               <div className="bg-pink-50 border-2 border-pink-100 p-4 rounded-2xl font-mono text-base font-bold text-pink-700 leading-relaxed break-words shadow-inner">
                  {varianteAtiva.lances}
               </div>
             </div>
          </div>
        )}
      </aside>
    </div>
  );
}