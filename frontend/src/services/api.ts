import axios from "axios";
import type {
  Kpis, Tendencia, DistribuicaoAtrasos,
  ComportamentoPagamentos, DistribuicaoRegional, StatusCobrancas,
  TaxaInadimplencia, TaxaRecuperacao, AtrasoMedio,
} from "../types/api";

const api = axios.create({ baseURL: "http://localhost:5000/analysis" });

export const fetchKpis                = () => api.get<Kpis>("/kpis").then(r => r.data);
export const fetchTendencia           = () => api.get<Tendencia>("/tendencia").then(r => r.data);
export const fetchDistribuicaoAtrasos = () => api.get<DistribuicaoAtrasos>("/distribuicao-atrasos").then(r => r.data);
export const fetchComportamento       = () => api.get<ComportamentoPagamentos>("/comportamento-pagamentos").then(r => r.data);
export const fetchRegional            = () => api.get<DistribuicaoRegional>("/distribuicao-regional").then(r => r.data);
export const fetchStatusCobrancas     = () => api.get<StatusCobrancas>("/status-cobrancas").then(r => r.data);
export const fetchTaxaInadimplencia  = () => api.get<TaxaInadimplencia>("/taxa-inadimplencia").then(r => r.data);
export const fetchTaxaRecuperacao    = () => api.get<TaxaRecuperacao>("/taxa-recuperacao").then(r => r.data);
export const fetchAtrasoMedio        = () => api.get<AtrasoMedio>("/atraso-medio").then(r => r.data);
