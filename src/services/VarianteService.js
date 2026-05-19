import api from './api';

const VarianteService = {
  getAll: () => api.get('/variantes'),
  create: (dados) => api.post('/variantes', dados),
  update: (id, dados) => api.put(`/variantes/${id}`, dados),
  delete: (id) => api.delete(`/variantes/${id}`)
};

export default VarianteService;