import axios from 'axios';

// Cria uma instância do Axios apontando para a sua API em C#
const api = axios.create({
  baseURL: 'http://localhost:5260/api', 
});

// Interceptor: Antes de qualquer requisição sair do React, ele faz isso:
api.interceptors.request.use((config) => {
  // Busca o token que vamos salvar no navegador na hora do login
  const token = localStorage.getItem('token');
  
  if (token) {
    // Se o token existir, coloca ele no cabeçalho (A Pulseira VIP!)
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;