import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registrar } from "../api/auth";
import { ApiError } from "../api/client";
import "./Login.css";
import "../components/Form.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "registro">("login");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setEnviando(true);
    try {
      if (modo === "login") {
        await login(email, senha);
        navigate("/dashboard");
      } else {
        await registrar(nome, email, senha);
        setMensagem("Conta criada! Entre com seu e-mail e senha.");
        setModo("login");
        setSenha("");
      }
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível completar a operação");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <div className="login__brand">
        <h1>Financeiro</h1>
        <h2>Controle suas entradas e saídas em um só lugar.</h2>
        <p>Acompanhe o saldo do período, organize por categorias e entenda para onde vai o seu dinheiro.</p>
      </div>
      <div className="login__form-side">
        <div className="card login__card">
          <div>
            <h2>{modo === "login" ? "Entrar" : "Criar conta"}</h2>
            <p className="subtitle">
              {modo === "login" ? "Acesse sua conta para continuar" : "Leva menos de um minuto"}
            </p>
          </div>

          {erro && <div className="form-error">{erro}</div>}
          {mensagem && !erro && <div className="form-error" style={{ background: "var(--color-income-soft)", color: "var(--color-income)" }}>{mensagem}</div>}

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {modo === "registro" && (
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={modo === "registro" ? 8 : undefined}
                required
              />
            </div>

            {modo === "login" && (
              <div className="login__options">
                <label className="login__remember">
                  <input type="checkbox" /> Lembrar de mim
                </label>
              </div>
            )}

            <button type="submit" className="btn btn--primary" disabled={enviando} style={{ width: "100%" }}>
              {enviando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <div className="login__footer">
            {modo === "login" ? (
              <>
                <span>Não tem conta?</span>
                <button type="button" className="login__toggle" onClick={() => { setModo("registro"); setErro(null); }}>
                  Criar conta
                </button>
              </>
            ) : (
              <>
                <span>Já tem conta?</span>
                <button type="button" className="login__toggle" onClick={() => { setModo("login"); setErro(null); }}>
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
