import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import AberturaService from '../services/AberturaService';
import VarianteService from '../services/VarianteService';
import PartidaService from '../services/PartidaService';

export default function Repertorio() {
  const navigate = useNavigate();
  
  const [aberturas, setAberturas] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [partidas, setPartidas] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [aberturaAtiva, setAberturaAtiva] = useState(null);
  const [varianteAtiva, setVarianteAtiva] = useState(null);
  const [partidaAtiva, setPartidaAtiva] = useState(null); 
  
  const [posicaoFen, setPosicaoFen] = useState('start');
  const [orientacao, setOrientacao] = useState('white');
  const [modoPainel, setModoPainel] = useState('menu'); 
  
  const [termoBusca, setTermoBusca] = useState('');
  const [formAbertura, setFormAbertura] = useState({ nome: '', cor: 'Brancas' });
  const [formVariante, setFormVariante] = useState({ nome: '', lances: '' });
  
  const [formPartida, setFormPartida] = useState({
    linkPartida: '', resultado: 'Vitória', precisaoGeral: '', lancesBrilhantes: 0, capivara: 0
  });

  const carregarTudo = useCallback(async () => {
    try {
      const [resAberturas, resVariantes] = await Promise.all([
        AberturaService.getAll(),
        VarianteService.getAll()
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

  useEffect(() => {
    if (varianteAtiva) {
      PartidaService.getByVariante(varianteAtiva.id)
         .then(res => setPartidas(res.data))
         .catch(err => console.error(err));
    } else {
      setPartidas([]);
    }
  }, [varianteAtiva]);

  // ==========================================
  // LÓGICA DO TABULEIRO
  // ==========================================
  const atualizarTabuleiro = (variante, abertura) => {
    const game = new Chess();
    try {
      game.loadPgn(variante.lances);
      setPosicaoFen(game.fen());
      setOrientacao(abertura.cor === 'Pretas' ? 'black' : 'white');
      setAberturaAtiva(abertura);
      setVarianteAtiva(variante);
      setModoPainel('menu');
    } catch (e) {
      alert("Erro na notação! Certifique-se de usar o padrão PGN em Inglês.");
    }
  };

  // ==========================================
  // FUNÇÕES DE SALVAR (POST/PUT)
  // ==========================================
  const salvarAbertura = async (e) => {
    e.preventDefault();
    try {
      if (modoPainel === 'editAbertura') {
        const res = await AberturaService.update(aberturaAtiva.id, formAbertura);
        setAberturas(aberturas.map(a => a.id === aberturaAtiva.id ? res.data : a));
        if (aberturaAtiva.id === res.data.id) setAberturaAtiva(res.data);
      } else {
        const res = await AberturaService.create(formAbertura);
        setAberturas([...aberturas, res.data]);
      }
      setModoPainel('menu');
    } catch (error) { alert('Erro ao salvar abertura.'); }
  };

  const salvarVariante = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formVariante, aberturaId: aberturaAtiva.id };
      if (modoPainel === 'editVariante') {
        const res = await VarianteService.update(varianteAtiva.id, payload);
        setVariantes(variantes.map(v => v.id === varianteAtiva.id ? res.data : v));
        atualizarTabuleiro(res.data, aberturaAtiva);
      } else {
        const res = await VarianteService.create(payload);
        setVariantes([...variantes, res.data]);
        atualizarTabuleiro(res.data, aberturaAtiva);
      }
    } catch (error) { alert('Erro ao salvar variante.'); }
  };

  const salvarPartida = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formPartida, varianteId: varianteAtiva.id };
      if (modoPainel === 'editPartida') {
        const res = await PartidaService.update(partidaAtiva.id, payload);
        setPartidas(partidas.map(p => p.id === partidaAtiva.id ? res.data : p));
      } else {
        const res = await PartidaService.create(payload);
        setPartidas([...partidas, res.data]);
      }
      setModoPainel('menu');
    } catch (error) { alert('Erro ao salvar partida.'); }
  };

  // ==========================================
  // FUNÇÕES DE EXCLUSÃO (DELETE)
  // ==========================================
  const excluirAbertura = async (id, nome) => {
    if (!window.confirm(`Excluir a abertura "${nome}" e suas linhas?`)) return;
    try {
      await AberturaService.delete(id);
      setAberturas(aberturas.filter(a => a.id !== id));
      setVariantes(variantes.filter(v => v.aberturaId !== id));
      if (aberturaAtiva?.id === id) {
        setAberturaAtiva(null); setVarianteAtiva(null); setPosicaoFen('start'); setModoPainel('menu');
      }
    } catch (error) { alert(error.response?.data?.erro || 'Erro ao excluir a abertura.'); }
  };

  const excluirVariante = async (id, nome) => {
    if (!window.confirm(`Excluir a linha "${nome}"?`)) return;
    try {
      await VarianteService.delete(id);
      setVariantes(variantes.filter(v => v.id !== id));
      if (varianteAtiva?.id === id) {
        setVarianteAtiva(null); setPosicaoFen('start'); setModoPainel('menu');
      }
    } catch (error) { alert(error.response?.data?.erro || 'Erro ao excluir a variante.'); }
  };

  const excluirPartida = async (id) => {
    if (!window.confirm(`Excluir este registro de partida?`)) return;
    try {
      await PartidaService.delete(id);
      setPartidas(partidas.filter(p => p.id !== id));
    } catch (error) { alert('Erro ao excluir a partida.'); }
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
                    <div className={`flex items-center w-full rounded-xl transition-all ${aberturaAtiva?.id === abertura.id ? 'bg-purple-800 shadow-md' : 'hover:bg-purple-900/80'}`}>
                      <button 
                        onClick={() => { 
                          if (aberturaAtiva?.id === abertura.id) {
                            setAberturaAtiva(null);
                            setVarianteAtiva(null);
                            setPosicaoFen('start');
                          } else {
                            setAberturaAtiva(abertura); 
                          }
                          setModoPainel('menu'); 
                        }}
                        className={`flex-1 text-left px-4 py-3 text-base font-bold flex items-center justify-between ${aberturaAtiva?.id === abertura.id ? 'text-white' : 'text-purple-200 group-hover:text-white'}`}
                      >
                        <span className="truncate pr-2">{abertura.nome}</span>
                        <span className={`text-pink-400 opacity-50 transition-transform ${aberturaAtiva?.id === abertura.id ? 'rotate-90' : 'group-hover:rotate-90'}`}>▶</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all mr-1">
                        <button onClick={(e) => { e.stopPropagation(); setAberturaAtiva(abertura); setFormAbertura({ nome: abertura.nome, cor: abertura.cor }); setModoPainel('editAbertura'); }} className="p-1.5 text-purple-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); excluirAbertura(abertura.id, abertura.nome); }} className="p-1.5 text-purple-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">🗑️</button>
                      </div>
                    </div>
                    
                    {variantes.filter(v => v.aberturaId === abertura.id).length > 0 && (
                      <div className="hidden group-hover:block w-full bg-purple-900/80 rounded-2xl shadow-inner border border-purple-700/50 p-2 mt-1 mb-2">
                        <div className="px-3 py-1 text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1">Linhas de Estudo</div>
                        {variantes.filter(v => v.aberturaId === abertura.id).map(v => (
                            <div key={v.id} className={`group/var flex items-center w-full rounded-xl transition-colors mb-1 ${varianteAtiva?.id === v.id ? 'bg-pink-500 shadow-md' : 'hover:bg-purple-700'} ${termoBusca && v.nome.toLowerCase().includes(termoBusca.toLowerCase()) ? 'ring-2 ring-pink-400' : ''}`}>
                              <button onClick={(e) => { e.stopPropagation(); atualizarTabuleiro(v, abertura); }} className={`flex-1 text-left px-3 py-2.5 text-sm font-medium flex items-center gap-2 ${varianteAtiva?.id === v.id ? 'text-white font-bold' : 'text-purple-100 group-hover/var:text-white'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0"></span><span className="truncate">{v.nome}</span>
                              </button>
                              <div className="flex items-center opacity-0 group-hover/var:opacity-100 transition-all mr-1">
                                <button onClick={(e) => { e.stopPropagation(); setAberturaAtiva(abertura); setVarianteAtiva(v); setFormVariante({ nome: v.nome, lances: v.lances }); setModoPainel('editVariante'); }} className="p-1.5 text-pink-200 hover:text-blue-200 hover:bg-blue-500 rounded-md">✏️</button>
                                <button onClick={(e) => { e.stopPropagation(); excluirVariante(v.id, v.nome); }} className="p-1.5 text-pink-200 hover:text-white hover:bg-red-500 rounded-md">🗑️</button>
                              </div>
                            </div>
                        ))}
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
            <div className="flex items-center gap-2"><span className="text-2xl opacity-50">♟</span> Adversário</div>
          </div>
          <div style={{ width: '492px', height: '492px' }} className="shadow-2xl rounded-sm overflow-hidden border-[6px] border-purple-950 bg-pink-100 flex items-center justify-center">
            <Chessboard id="TabuleiroPrincipal" boardWidth={480} position={posicaoFen} boardOrientation={orientacao} arePiecesDraggable={false} animationDuration={300} customDarkSquareStyle={{ backgroundColor: '#D81B60' }} customLightSquareStyle={{ backgroundColor: '#FCE4EC' }} />
          </div>
          <div className="w-[480px] flex items-center justify-between px-2 text-purple-900 font-black text-lg">
            <div className="flex items-center gap-2"><span className="text-2xl text-purple-900">♙</span> Você</div>
          </div>
        </div>
      </main>

      {/* =========================================
          COLUNA 3: PAINEL DIREITO
          ========================================= */}
      <aside className="w-[420px] bg-pink-100 flex flex-col shrink-0 z-20 border-l-2 border-pink-200 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] overflow-hidden">
        
        <div className="p-8 pb-4 flex items-start justify-between shrink-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-purple-950 tracking-tight">Estudos & Ações</h2>
            <p className="text-purple-700 font-medium">Gerencie seu arsenal de aberturas</p>
          </div>
          
          {/* BOTÃO VOLTAR AO INÍCIO */}
          {(aberturaAtiva || varianteAtiva) && modoPainel === 'menu' && (
            <button 
              onClick={() => {
                setAberturaAtiva(null);
                setVarianteAtiva(null);
                setPosicaoFen('start');
              }}
              className="bg-purple-200/50 hover:bg-purple-300 text-purple-900 px-4 py-2 rounded-xl text-sm font-black transition-colors flex items-center gap-2 shadow-sm"
              title="Voltar ao Início"
            >
              <span>🏠</span> INÍCIO
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 pb-0">
          {modoPainel === 'menu' ? (
            <>
              {/* Opções de Criar Abertura/Variante */}
              {!varianteAtiva && (
                <div className="space-y-4">
                  <button onClick={() => { setFormAbertura({nome: '', cor: 'Brancas'}); setModoPainel('formAbertura'); }} className="w-full bg-white hover:bg-pink-50 p-6 rounded-3xl flex items-center gap-5 transition-all shadow-lg border border-pink-100 hover:shadow-xl hover:-translate-y-1 group">
                    <div className="text-4xl group-hover:scale-110 transition-transform">✨</div>
                    <div className="text-left">
                      <div className="font-black text-xl text-purple-950 mb-1">Nova Abertura</div>
                      <div className="text-sm font-medium text-purple-600">Criar uma nova base teórica</div>
                    </div>
                  </button>

                  {aberturaAtiva && (
                    <div className="pt-2 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-pink-300 flex-1"></div>
                        <span className="text-xs font-black text-purple-800 uppercase tracking-widest bg-pink-200 px-3 py-1 rounded-full">{aberturaAtiva.nome}</span>
                        <div className="h-px bg-pink-300 flex-1"></div>
                      </div>
                      <button onClick={() => { setFormVariante({nome: '', lances: ''}); setModoPainel('formVariante'); }} className="w-full bg-purple-900 hover:bg-purple-800 p-6 rounded-3xl flex items-center gap-5 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group">
                        <div className="text-white text-4xl font-light group-hover:rotate-90 transition-transform">+</div>
                        <div className="text-left">
                          <div className="font-black text-xl text-white mb-1">Adicionar Variante</div>
                          <div className="text-sm font-medium text-purple-300">Inserir nova linha com notação</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODO VARIANTE ATIVA: Mostra PGN e Lista de Partidas */}
              {varianteAtiva && (
                <div className="space-y-6 pb-8">
                  
                  {/* Bloco de Notação (PGN) */}
                  <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        <div className="text-sm font-black text-purple-900 uppercase tracking-widest">Notação (PGN)</div>
                      </div>
                      <button 
                        onClick={() => { setFormVariante({ nome: varianteAtiva.nome, lances: varianteAtiva.lances }); setModoPainel('editVariante'); }}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        ✏️ EDITAR
                      </button>
                    </div>
                    <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl font-mono text-sm font-bold text-pink-700 leading-relaxed break-words shadow-inner max-h-40 overflow-y-auto">
                        {varianteAtiva.lances}
                    </div>
                  </div>

                  {/* Bloco de Partidas & Estatísticas */}
                  <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚔️</span>
                        <div className="text-sm font-black text-purple-900 uppercase tracking-widest">Partidas Jogadas</div>
                      </div>
                      <button 
                        onClick={() => { 
                          setFormPartida({ linkPartida: '', resultado: 'Vitória', precisaoGeral: '', lancesBrilhantes: 0, capivara: 0 }); 
                          setModoPainel('formPartida'); 
                        }}
                        className="bg-purple-900 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg"
                      >
                        + ADD
                      </button>
                    </div>

                    <div className="space-y-3">
                      {partidas.length === 0 ? (
                        <div className="text-center p-4 bg-pink-50 rounded-2xl border border-dashed border-pink-200">
                          <p className="text-sm font-bold text-purple-400">Nenhuma partida registrada nesta linha.</p>
                        </div>
                      ) : (
                        partidas.map(p => (
                          <div key={p.id} className="group relative bg-pink-50 border border-pink-100 p-3 rounded-2xl transition-all hover:border-pink-300">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${
                                p.resultado === 'Vitória' ? 'bg-green-100 text-green-700' : 
                                p.resultado === 'Derrota' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {p.resultado}
                              </span>
                              
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setPartidaAtiva(p); setFormPartida({ linkPartida: p.linkPartida, resultado: p.resultado, precisaoGeral: p.precisao?.precisaoGeral || '', lancesBrilhantes: p.precisao?.lancesBrilhantes || 0, capivara: p.precisao?.capivara || 0 }); setModoPainel('editPartida'); }} className="p-1 text-purple-400 hover:text-blue-500 mr-1">✏️</button>
                                <button onClick={() => excluirPartida(p.id)} className="p-1 text-purple-400 hover:text-red-500">🗑️</button>
                              </div>
                            </div>
                            
                            {p.precisao && (
                              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 border-t border-pink-100 pt-2">
                                <div><span className="block text-purple-400 mb-0.5">Precisão</span><span className="font-bold text-purple-900">{p.precisao.precisaoGeral}%</span></div>
                                <div><span className="block text-purple-400 mb-0.5">Brilhantes</span><span className="font-bold text-blue-600">!! {p.precisao.lancesBrilhantes}</span></div>
                                <div><span className="block text-purple-400 mb-0.5">Capivaras</span><span className="font-bold text-red-600">?? {p.precisao.capivara}</span></div>
                              </div>
                            )}
                            
                            {p.linkPartida && (
                              <a href={p.linkPartida} target="_blank" rel="noreferrer" className="mt-3 block text-center text-[10px] font-black text-pink-500 hover:text-pink-700 uppercase tracking-wider bg-pink-100 py-1.5 rounded-lg transition-colors">
                                Ver no Chess.com ↗
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            
            /* ================= FORMULÁRIOS DINÂMICOS ================= */
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
               <h3 className="text-2xl font-black text-purple-950 mb-6">
                 {modoPainel.includes('Abertura') ? (modoPainel === 'editAbertura' ? 'Editar Abertura' : 'Nova Abertura') : 
                  modoPainel.includes('Variante') ? (modoPainel === 'editVariante' ? 'Editar Variante' : 'Nova Variante') :
                  (modoPainel === 'editPartida' ? 'Editar Partida' : 'Registrar Partida')}
               </h3>
               
               <form className="space-y-5" onSubmit={modoPainel.includes('Abertura') ? salvarAbertura : modoPainel.includes('Variante') ? salvarVariante : salvarPartida}>
                 
                 {/* Campos de Abertura */}
                 {modoPainel.includes('Abertura') && (
                   <>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Nome da Abertura</label>
                      <input type="text" value={formAbertura.nome} onChange={e => setFormAbertura({...formAbertura, nome: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Cor</label>
                      <select value={formAbertura.cor} onChange={e => setFormAbertura({...formAbertura, cor: e.target.value})} className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500">
                        <option value="Brancas">Brancas</option><option value="Pretas">Pretas</option>
                      </select>
                    </div>
                   </>
                 )}

                 {/* Campos de Variante */}
                 {modoPainel.includes('Variante') && (
                    <>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Nome da Linha</label>
                      <input type="text" value={formVariante.nome} onChange={e => setFormVariante({...formVariante, nome: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Notação PGN</label>
                      <textarea rows="4" value={formVariante.lances} onChange={e => setFormVariante({...formVariante, lances: e.target.value})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-mono font-bold p-4 rounded-2xl focus:outline-none focus:border-pink-500 resize-none" />
                    </div>
                    </>
                 )}

                 {/* Campos de Partida */}
                 {modoPainel.includes('Partida') && (
                    <>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Link da Partida</label>
                      <input type="url" value={formPartida.linkPartida} onChange={e => setFormPartida({...formPartida, linkPartida: e.target.value})} className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-3 rounded-xl focus:outline-none focus:border-pink-500" placeholder="https://chess.com/game/..." />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-900 mb-2 ml-1">Resultado</label>
                      <select value={formPartida.resultado} onChange={e => setFormPartida({...formPartida, resultado: e.target.value})} className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-3 rounded-xl focus:outline-none focus:border-pink-500">
                        <option value="Vitória">Vitória</option>
                        <option value="Empate">Empate</option>
                        <option value="Derrota">Derrota</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block font-bold text-xs text-purple-900 mb-1">Precisão (%)</label>
                        <input type="number" step="0.1" value={formPartida.precisaoGeral} onChange={e => setFormPartida({...formPartida, precisaoGeral: parseFloat(e.target.value)})} required className="w-full bg-pink-50 border-2 border-pink-100 text-purple-900 font-bold p-2.5 rounded-xl text-center focus:outline-none focus:border-pink-500" />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-blue-700 mb-1">Brilhantes (!!)</label>
                        <input type="number" value={formPartida.lancesBrilhantes} onChange={e => setFormPartida({...formPartida, lancesBrilhantes: parseInt(e.target.value)})} required className="w-full bg-pink-50 border-2 border-pink-100 text-blue-700 font-bold p-2.5 rounded-xl text-center focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-red-700 mb-1">Capivaras (??)</label>
                        <input type="number" value={formPartida.capivara} onChange={e => setFormPartida({...formPartida, capivara: parseInt(e.target.value)})} required className="w-full bg-pink-50 border-2 border-pink-100 text-red-700 font-bold p-2.5 rounded-xl text-center focus:outline-none focus:border-red-400" />
                      </div>
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
      </aside>
    </div>
  );
}