import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Repertorio from './pages/Repertorio';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Quando o usuário entrar na raiz (/), mandamos ele para o login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* A nossa rota de Login */}
        <Route path="/login" element={<Login />} />

        {/* Repertorio */}
        <Route path="/repertorio" element={<Repertorio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;