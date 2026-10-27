import { api } from "./client";
import type { CategoriaResponse } from "../types";

export function listarCategorias() {
  return api.get<CategoriaResponse[]>("/categorias");
}

export function criarCategoria(nome: string) {
  return api.post<CategoriaResponse>("/categorias", { nome });
}

export function atualizarCategoria(id: number, nome: string) {
  return api.put<CategoriaResponse>(`/categorias/${id}`, { nome });
}

export function excluirCategoria(id: number) {
  return api.delete<void>(`/categorias/${id}`);
}
