import api from './api';

const AberturaService = {
  getAll: () => api.get('/aberturas'),
  create: (dados) => api.post('/aberturas', dados),
  update: (id, dados) => api.put(`/aberturas/${id}`, dados),
  delete: (id) => api.delete(`/aberturas/${id}`)
};

export default AberturaService;