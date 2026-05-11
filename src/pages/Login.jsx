import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // Controla se estamos na tela de Login ou Cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que a página recarregue
    setErro(''); // Limpa erros anteriores

    try {
      if (isLogin) {
        // FLUXO DE LOGIN
        const response = await api.post('/authentication/login', { email, senha });
        
        // A API devolve o JWT. Vamos salvar no navegador!
        const token = response.data.token || response.data;
        localStorage.setItem('token', token);
        
        alert("Login realizado com sucesso!");
        // navigate('/repertorio'); // Descomente isso quando criarmos a tela principal!
      } else {
        // FLUXO DE CADASTRO
        await api.post('/authentication/registrar', { nome, email, senha });
        
        alert("Conta criada com sucesso! Faça o login agora.");
        setIsLogin(true); // Joga o usuário de volta para a tela de login
      }
    } catch (error) {
      console.error(error);
      setErro('Ocorreu um erro. Verifique seus dados e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
        </h2>

        {erro && <p className="text-red-500 text-sm mb-4 text-center">{erro}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* O campo Nome só aparece se for Cadastro */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Seu Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          )}

          <input
            type="email"
            placeholder="Seu E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Sua Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? "Ainda não tem uma conta? " : "Já possui uma conta? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </p>
      </div>
    </div>
  );
}