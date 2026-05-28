import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/analysis" });

export const fetchKpis               = () => api.get("/kpis").then(r => r.data);
export const fetchInadimplencia      = () => api.get("/inadimplencia").then(r => r.data);
export const fetchRecuperacao        = () => api.get("/recuperacao").then(r => r.data);
export const fetchTendencia          = () => api.get("/tendencia").then(r => r.data);
export const fetchDistribuicaoAtrasos = () => api.get("/distribuicao-atrasos").then(r => r.data);
export const fetchComportamento      = () => api.get("/comportamento-pagamentos").then(r => r.data);
export const fetchRegional           = () => api.get("/distribuicao-regional").then(r => r.data);
export const fetchStatusCobrancas    = () => api.get("/status-cobrancas").then(r => r.data);
