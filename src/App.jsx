import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Quando o usuário entrar na raiz (/), mandamos ele para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* A nossa rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Futuramente, colocaremos a rota do Repertório aqui! */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;