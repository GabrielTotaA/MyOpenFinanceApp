import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { resumo } from "../api/transacoes";
import { ApiError } from "../api/client";
import type { Resumo } from "../types";
import { fimMesAtual, formatarMoeda, inicioMesAtual } from "../utils";
import "./Dashboard.css";
import "../components/Table.css";
import "../components/Form.css";

export default function Dashboard() {
  const [inicio, setInicio] = useState(inicioMesAtual());
  const [fim, setFim] = useState(fimMesAtual());
  const [dados, setDados] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(dataInicio = inicio, dataFim = fim) {
    setCarregando(true);
    setErro(null);
    try {
      setDados(await resumo(dataInicio, dataFim));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível carregar o resumo");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onAplicar(e: FormEvent) {
    e.preventDefault();
    carregar(inicio, fim);
  }

  const maiorValor = dados ? Math.max(dados.totalEntradas, dados.totalSaidas, 1) : 1;
  const alturaEntradas = dados ? Math.max((dados.totalEntradas / maiorValor) * 200, 2) : 2;
  const alturaSaidas = dados ? Math.max((dados.totalSaidas / maiorValor) * 200, 2) : 2;

  return (
    <Layout title="Resumo financeiro" subtitle="Entradas, saídas e saldo do período selecionado">
      <div className="page-header" style={{ width: "100%", justifyContent: "space-between" }}>
        <div />
        <form className="period-filter" onSubmit={onAplicar}>
          <div className="field" style={{ width: 150 }}>
            <label>Início</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div className="field" style={{ width: 150 }}>
            <label>Fim</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <button type="submit" className="btn btn--primary" style={{ alignSelf: "flex-end" }}>
            Aplicar
          </button>
        </form>
      </div>

      {erro && <div className="form-error">{erro}</div>}

      {dados && (
        <>
          <div className="stats">
            <div className="card stat-card">
              <span className="chip chip--income">Total de entradas</span>
              <p className="stat-card__value">{formatarMoeda(dados.totalEntradas)}</p>
            </div>
            <div className="card stat-card">
              <span className="chip chip--expense">Total de saídas</span>
              <p className="stat-card__value">{formatarMoeda(dados.totalSaidas)}</p>
            </div>
            <div className="card stat-card">
              <span className="chip chip--primary">Saldo</span>
              <p className="stat-card__value">{formatarMoeda(dados.saldo)}</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="card chart-card">
              <div>
                <h3>Entradas vs. Saídas</h3>
                <p className="subtitle">Comparativo do período selecionado</p>
              </div>
              <div className="bars">
                <div className="bar-group">
                  <span className="bar-group__value">{formatarMoeda(dados.totalEntradas)}</span>
                  <div className="bar bar--income" style={{ height: alturaEntradas }} />
                  <span className="bar-group__label">Entradas</span>
                </div>
                <div className="bar-group">
                  <span className="bar-group__value">{formatarMoeda(dados.totalSaidas)}</span>
                  <div className="bar bar--expense" style={{ height: alturaSaidas }} />
                  <span className="bar-group__label">Saídas</span>
                </div>
              </div>
              <div className="table-divider" />
              <div className="chart-balance">
                <span>Saldo do período:</span>
                <strong style={{ color: dados.saldo >= 0 ? "var(--color-income)" : "var(--color-expense)" }}>
                  {dados.saldo >= 0 ? "+ " : ""}
                  {formatarMoeda(dados.saldo)}
                </strong>
              </div>
            </div>

            <div className="card table-card">
              <div className="table-card__title">
                <h2>Por categoria</h2>
              </div>
              <div className="table-header-row">
                <span style={{ width: 300 }}>CATEGORIA</span>
                <span style={{ width: 140 }}>TIPO</span>
                <span style={{ width: 160 }}>TOTAL</span>
              </div>
              {dados.porCategoria.length === 0 && (
                <div className="table-empty">Nenhuma movimentação no período selecionado.</div>
              )}
              {dados.porCategoria.map((linha, i) => (
                <div key={`${linha.categoria}-${linha.tipo}`}>
                  <div className="table-row">
                    <span style={{ width: 300 }}>{linha.categoria}</span>
                    <span style={{ width: 140 }}>
                      <Badge tipo={linha.tipo} />
                    </span>
                    <span style={{ width: 160 }}>{formatarMoeda(linha.total)}</span>
                  </div>
                  {i < dados.porCategoria.length - 1 && <div className="table-divider" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!dados && carregando && <div className="table-empty">Carregando...</div>}
    </Layout>
  );
}
