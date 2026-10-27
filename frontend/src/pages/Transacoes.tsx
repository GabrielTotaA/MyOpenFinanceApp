import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { ConfirmModal } from "../components/ConfirmModal";
import {
  atualizarTransacao,
  criarTransacao,
  excluirTransacao,
  listarTransacoes,
} from "../api/transacoes";
import { listarCategorias } from "../api/categorias";
import { ApiError } from "../api/client";
import type { CategoriaResponse, FormaPagamento, TipoTransacao, TransacaoPayload, TransacaoResponse } from "../types";
import { FORMA_PAGAMENTO_LABEL, TIPO_LABEL } from "../types";
import { fimMesAtual, formatarData, formatarMoeda, inicioMesAtual } from "../utils";
import "../components/Table.css";
import "../components/Form.css";

const TIPOS: TipoTransacao[] = ["SAIDA", "ENTRADA"];
const FORMAS: FormaPagamento[] = ["PIX", "CREDITO", "DEBITO"];

interface TransacaoFormValues {
  valor: string;
  data: string;
  tipo: TipoTransacao;
  idCategoria: string;
  formaPagamento: FormaPagamento;
}

function camposVazios(categorias: CategoriaResponse[]): TransacaoFormValues {
  return {
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    tipo: "SAIDA",
    idCategoria: categorias[0] ? String(categorias[0].id) : "",
    formaPagamento: "PIX",
  };
}

function TransacaoCampos({
  valores,
  onChange,
  categorias,
}: {
  valores: TransacaoFormValues;
  onChange: (valores: TransacaoFormValues) => void;
  categorias: CategoriaResponse[];
}) {
  return (
    <>
      <div className="field">
        <label>Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={valores.valor}
          onChange={(e) => onChange({ ...valores, valor: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Data</label>
        <input
          type="date"
          value={valores.data}
          onChange={(e) => onChange({ ...valores, data: e.target.value })}
          required
        />
      </div>
      <div className="field">
        <label>Tipo</label>
        <select value={valores.tipo} onChange={(e) => onChange({ ...valores, tipo: e.target.value as TipoTransacao })}>
          {TIPOS.map((tipo) => (
            <option key={tipo} value={tipo}>
              {TIPO_LABEL[tipo]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Categoria</label>
        <select
          value={valores.idCategoria}
          onChange={(e) => onChange({ ...valores, idCategoria: e.target.value })}
          required
        >
          <option value="" disabled>
            Selecione...
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Forma de pagamento</label>
        <select
          value={valores.formaPagamento}
          onChange={(e) => onChange({ ...valores, formaPagamento: e.target.value as FormaPagamento })}
        >
          {FORMAS.map((forma) => (
            <option key={forma} value={forma}>
              {FORMA_PAGAMENTO_LABEL[forma]}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

function paraPayload(valores: TransacaoFormValues): TransacaoPayload {
  return {
    valor: Number(valores.valor),
    data: valores.data,
    tipo: valores.tipo,
    idCategoria: Number(valores.idCategoria),
    formaPagamento: valores.formaPagamento,
  };
}

export default function Transacoes() {
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [transacoes, setTransacoes] = useState<TransacaoResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [date1, setDate1] = useState(inicioMesAtual());
  const [date2, setDate2] = useState(fimMesAtual());

  const [novaTransacao, setNovaTransacao] = useState<TransacaoFormValues>(camposVazios([]));
  const [criando, setCriando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [editando, setEditando] = useState<TransacaoResponse | null>(null);
  const [valoresEdicao, setValoresEdicao] = useState<TransacaoFormValues | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  const [excluindo, setExcluindo] = useState<TransacaoResponse | null>(null);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);

  async function carregar(inicio = date1, fim = date2) {
    setCarregando(true);
    setErroLista(null);
    try {
      const [listaTransacoes, listaCategorias] = await Promise.all([
        listarTransacoes(inicio, fim),
        listarCategorias(),
      ]);
      setTransacoes(listaTransacoes);
      setCategorias(listaCategorias);
      setNovaTransacao((atual) => (atual.idCategoria ? atual : camposVazios(listaCategorias)));
    } catch (err) {
      setErroLista(err instanceof ApiError ? err.message : "Não foi possível carregar as transações");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFiltrar(e: FormEvent) {
    e.preventDefault();
    carregar(date1, date2);
  }

  async function onCriar(e: FormEvent) {
    e.preventDefault();
    setErroForm(null);
    setCriando(true);
    try {
      await criarTransacao(paraPayload(novaTransacao));
      setNovaTransacao(camposVazios(categorias));
      await carregar();
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : "Não foi possível criar a transação");
    } finally {
      setCriando(false);
    }
  }

  function abrirEdicao(transacao: TransacaoResponse) {
    setEditando(transacao);
    setValoresEdicao({
      valor: String(transacao.valor),
      data: transacao.data,
      tipo: transacao.tipo,
      idCategoria: String(transacao.idCategoria),
      formaPagamento: transacao.formaPagamento,
    });
    setErroEdicao(null);
  }

  async function onSalvarEdicao(e: FormEvent) {
    e.preventDefault();
    if (!editando || !valoresEdicao) return;
    setSalvandoEdicao(true);
    setErroEdicao(null);
    try {
      await atualizarTransacao(editando.id, paraPayload(valoresEdicao));
      setEditando(null);
      await carregar();
    } catch (err) {
      setErroEdicao(err instanceof ApiError ? err.message : "Não foi possível salvar a transação");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function pedirExclusao() {
    if (!editando) return;
    setExcluindo(editando);
    setEditando(null);
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setProcessandoExclusao(true);
    try {
      await excluirTransacao(excluindo.id);
      setExcluindo(null);
      await carregar();
    } catch (err) {
      setErroLista(err instanceof ApiError ? err.message : "Não foi possível excluir a transação");
      setExcluindo(null);
    } finally {
      setProcessandoExclusao(false);
    }
  }

  return (
    <Layout title="Transações" subtitle="Todas as movimentações do usuário">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", width: "100%" }}>
        <div className="card table-card">
          <div className="table-card__title">
            <h2>Lista de transações</h2>
            <form className="period-filter" onSubmit={onFiltrar}>
              <span className="period-filter__label">Período</span>
              <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
              <span className="period-filter__sep">até</span>
              <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
              <button type="submit" className="btn btn--primary">
                Filtrar
              </button>
            </form>
          </div>
          <div className="table-header-row">
            <span style={{ width: 90 }}>DATA</span>
            <span style={{ width: 150 }}>CATEGORIA</span>
            <span style={{ width: 100 }}>TIPO</span>
            <span style={{ width: 100 }}>PAGAMENTO</span>
            <span style={{ width: 110 }}>VALOR</span>
            <span style={{ width: 60 }}>AÇÕES</span>
          </div>
          {erroLista && <div className="form-error" style={{ margin: 16 }}>{erroLista}</div>}
          {!carregando && transacoes.length === 0 && !erroLista && (
            <div className="table-empty">Nenhuma transação no período selecionado.</div>
          )}
          {transacoes.map((transacao, i) => (
            <div key={transacao.id}>
              <div className="table-row">
                <span style={{ width: 90 }}>{formatarData(transacao.data)}</span>
                <span style={{ width: 150 }}>{transacao.categoria}</span>
                <span style={{ width: 100 }}>
                  <Badge tipo={transacao.tipo} />
                </span>
                <span style={{ width: 100 }}>{FORMA_PAGAMENTO_LABEL[transacao.formaPagamento]}</span>
                <span className="table-row__valor" style={{ width: 110 }}>
                  {formatarMoeda(transacao.valor)}
                </span>
                <span style={{ width: 60 }}>
                  <button type="button" className="table-action" onClick={() => abrirEdicao(transacao)}>
                    Editar
                  </button>
                </span>
              </div>
              {i < transacoes.length - 1 && <div className="table-divider" />}
            </div>
          ))}
        </div>

        <form className="card form-card" onSubmit={onCriar}>
          <h2>Nova transação</h2>
          {erroForm && <div className="form-error">{erroForm}</div>}
          <TransacaoCampos valores={novaTransacao} onChange={setNovaTransacao} categorias={categorias} />
          <button type="submit" className="btn btn--primary" disabled={criando || categorias.length === 0} style={{ width: "100%" }}>
            {criando ? "Salvando..." : "Salvar transação"}
          </button>
          {categorias.length === 0 && !carregando && (
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>
              Crie uma categoria antes de lançar transações.
            </p>
          )}
        </form>
      </div>

      {editando && valoresEdicao && (
        <Modal title="Editar transação" onClose={() => setEditando(null)}>
          {erroEdicao && <div className="form-error">{erroEdicao}</div>}
          <form onSubmit={onSalvarEdicao} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TransacaoCampos valores={valoresEdicao} onChange={setValoresEdicao} categorias={categorias} />
            <div className="modal-card__actions" style={{ justifyContent: "space-between" }}>
              <button type="button" className="btn--link" style={{ color: "var(--color-expense)" }} onClick={pedirExclusao}>
                Excluir
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={salvandoEdicao}>
                  {salvandoEdicao ? "Salvando..." : "Salvar transação"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {excluindo && (
        <ConfirmModal
          title="Excluir transação?"
          message={`Tem certeza que deseja excluir a transação de ${formatarMoeda(excluindo.valor)} em ${formatarData(excluindo.data)}? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir transação"
          loading={processandoExclusao}
          onConfirm={confirmarExclusao}
          onClose={() => setExcluindo(null)}
        />
      )}
    </Layout>
  );
}
