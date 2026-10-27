import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { ConfirmModal, InfoModal } from "../components/ConfirmModal";
import { atualizarCategoria, criarCategoria, excluirCategoria, listarCategorias } from "../api/categorias";
import { ApiError } from "../api/client";
import type { CategoriaResponse } from "../types";
import "../components/Table.css";
import "../components/Form.css";

export default function Categorias() {
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [editando, setEditando] = useState<CategoriaResponse | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  const [excluindo, setExcluindo] = useState<CategoriaResponse | null>(null);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);
  const [bloqueio, setBloqueio] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    setErroLista(null);
    try {
      setCategorias(await listarCategorias());
    } catch (err) {
      setErroLista(err instanceof ApiError ? err.message : "Não foi possível carregar as categorias");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onCriar(e: FormEvent) {
    e.preventDefault();
    setErroForm(null);
    setCriando(true);
    try {
      await criarCategoria(nome);
      setNome("");
      await carregar();
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : "Não foi possível criar a categoria");
    } finally {
      setCriando(false);
    }
  }

  function abrirEdicao(categoria: CategoriaResponse) {
    setEditando(categoria);
    setNomeEdicao(categoria.nome);
    setErroEdicao(null);
  }

  async function onSalvarEdicao(e: FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setSalvandoEdicao(true);
    setErroEdicao(null);
    try {
      await atualizarCategoria(editando.id, nomeEdicao);
      setEditando(null);
      await carregar();
    } catch (err) {
      setErroEdicao(err instanceof ApiError ? err.message : "Não foi possível salvar a categoria");
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
      await excluirCategoria(excluindo.id);
      setExcluindo(null);
      await carregar();
    } catch (err) {
      setExcluindo(null);
      if (err instanceof ApiError && err.status === 409) {
        setBloqueio(err.message);
      } else {
        setErroLista(err instanceof ApiError ? err.message : "Não foi possível excluir a categoria");
      }
    } finally {
      setProcessandoExclusao(false);
    }
  }

  return (
    <Layout title="Categorias" subtitle="Organize suas transações por categoria">
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", width: "100%" }}>
        <div className="card table-card">
          <div className="table-card__title">
            <h2>Suas categorias</h2>
          </div>
          <div className="table-header-row">
            <span style={{ width: 360 }}>NOME</span>
            <span style={{ width: 120 }}>TRANSAÇÕES</span>
            <span style={{ width: 60 }}>AÇÕES</span>
          </div>
          {erroLista && <div className="form-error" style={{ margin: 16 }}>{erroLista}</div>}
          {!carregando && categorias.length === 0 && !erroLista && (
            <div className="table-empty">Nenhuma categoria cadastrada ainda.</div>
          )}
          {categorias.map((categoria, i) => (
            <div key={categoria.id}>
              <div className="table-row">
                <span style={{ width: 360 }}>{categoria.nome}</span>
                <span style={{ width: 120 }}>{categoria.totalTransacoes}</span>
                <span style={{ width: 60 }}>
                  <button type="button" className="table-action" onClick={() => abrirEdicao(categoria)}>
                    Editar
                  </button>
                </span>
              </div>
              {i < categorias.length - 1 && <div className="table-divider" />}
            </div>
          ))}
        </div>

        <form className="card form-card" onSubmit={onCriar}>
          <h2>Nova categoria</h2>
          {erroForm && <div className="form-error">{erroForm}</div>}
          <div className="field">
            <label htmlFor="nova-categoria-nome">Nome</label>
            <input
              id="nova-categoria-nome"
              placeholder="Ex.: Saúde"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={60}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={criando} style={{ width: "100%" }}>
            {criando ? "Criando..." : "Criar categoria"}
          </button>
        </form>
      </div>

      {editando && (
        <Modal title="Editar categoria" onClose={() => setEditando(null)}>
          {erroEdicao && <div className="form-error">{erroEdicao}</div>}
          <form onSubmit={onSalvarEdicao} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="edicao-categoria-nome">Nome</label>
              <input
                id="edicao-categoria-nome"
                value={nomeEdicao}
                onChange={(e) => setNomeEdicao(e.target.value)}
                maxLength={60}
                required
              />
            </div>
            <div className="modal-card__actions" style={{ justifyContent: "space-between" }}>
              <button type="button" className="btn--link" style={{ color: "var(--color-expense)" }} onClick={pedirExclusao}>
                Excluir
              </button>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={salvandoEdicao}>
                  {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {excluindo && (
        <ConfirmModal
          title="Excluir categoria?"
          message={`Tem certeza que deseja excluir "${excluindo.nome}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir categoria"
          loading={processandoExclusao}
          onConfirm={confirmarExclusao}
          onClose={() => setExcluindo(null)}
        />
      )}

      {bloqueio && (
        <InfoModal title="Não é possível excluir" message={bloqueio} onClose={() => setBloqueio(null)} />
      )}
    </Layout>
  );
}
