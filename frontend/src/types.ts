export type TipoTransacao = "ENTRADA" | "SAIDA";

export type FormaPagamento = "PIX" | "CREDITO" | "DEBITO";

export const TIPO_LABEL: Record<TipoTransacao, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  PIX: "PIX",
  CREDITO: "Crédito",
  DEBITO: "Débito",
};

export interface UsuarioResponse {
  id: number;
  nome: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioResponse;
}

export interface TransacaoResponse {
  id: number;
  data: string; // ISO date yyyy-MM-dd
  valor: number;
  tipo: TipoTransacao;
  idCategoria: number;
  categoria: string;
  formaPagamento: FormaPagamento;
}

export interface TransacaoPayload {
  valor: number;
  data: string;
  tipo: TipoTransacao;
  idCategoria: number;
  formaPagamento: FormaPagamento;
}

export interface CategoriaResponse {
  id: number;
  nome: string;
  totalTransacoes: number;
}

export interface ResumoCategoria {
  categoria: string;
  tipo: TipoTransacao;
  total: number;
}

export interface Resumo {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  porCategoria: ResumoCategoria[];
}
