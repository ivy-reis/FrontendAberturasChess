import api from './api';

const PartidaService = {
  getByVariante: (varianteId) => api.get(`/partidas/variante/${varianteId}`),
  create: (dados) => api.post('/partidas', dados),
  update: (id, dados) => api.put(`/partidas/${id}`, dados),
  delete: (id) => api.delete(`/partidas/${id}`)
};

export default PartidaService;