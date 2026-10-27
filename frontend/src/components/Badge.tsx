import type { TipoTransacao } from "../types";
import { TIPO_LABEL } from "../types";
import "./Badge.css";

export default function Badge({ tipo }: { tipo: TipoTransacao }) {
  const className = tipo === "ENTRADA" ? "badge badge--income" : "badge badge--expense";
  return <span className={className}>{TIPO_LABEL[tipo]}</span>;
}
