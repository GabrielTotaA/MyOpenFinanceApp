import { api } from "./client";
import type { LoginResponse, UsuarioResponse } from "../types";

export function login(email: string, senha: string) {
  return api.post<LoginResponse>("/auth/login", { email, senha });
}

export function registrar(nome: string, email: string, senha: string) {
  return api.post<UsuarioResponse>("/auth/registro", { nome, email, senha });
}

export function me() {
  return api.get<UsuarioResponse>("/auth/me");
}
