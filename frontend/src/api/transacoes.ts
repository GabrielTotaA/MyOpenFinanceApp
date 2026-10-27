import { api } from "./client";
import type { Resumo, TransacaoPayload, TransacaoResponse } from "../types";

export function listarTransacoes(date1?: string, date2?: string) {
  const params = new URLSearchParams();
  if (date1) params.set("date1", date1);
  if (date2) params.set("date2", date2);
  const query = params.toString();
  return api.get<TransacaoResponse[]>(`/transacoes${query ? `?${query}` : ""}`);
}

export function criarTransacao(payload: TransacaoPayload) {
  return api.post<TransacaoResponse>("/transacoes", payload);
}

export function atualizarTransacao(id: number, payload: TransacaoPayload) {
  return api.put<TransacaoResponse>(`/transacoes/${id}`, payload);
}

export function excluirTransacao(id: number) {
  return api.delete<void>(`/transacoes/${id}`);
}

export function resumo(inicio: string, fim: string) {
  const params = new URLSearchParams({ inicio, fim });
  return api.get<Resumo>(`/transacoes/resumo?${params.toString()}`);
}
