import axios from 'axios';

// Cria uma instância do Axios apontando para a API em C#
const api = axios.create({
  baseURL: 'http://localhost:5260/api', 
});

//  Antes de qualquer requisição sair do React, intercepta
api.interceptors.request.use((config) => {
  // Busca o token que vamos salvar no navegador na hora do login
  const token = localStorage.getItem('token');
  
  if (token) {
    // Se o token existir, coloca ele no cabeçalho 
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;