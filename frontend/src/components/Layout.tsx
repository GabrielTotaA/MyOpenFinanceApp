import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

interface LayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function Layout({ title, subtitle, children }: LayoutProps) {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <p className="sidebar__brand">Financeiro</p>
        <nav className="sidebar__nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/transacoes" className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}>
            Transações
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => `sidebar__nav-item${isActive ? " active" : ""}`}>
            Categorias
          </NavLink>
        </nav>
        <div className="sidebar__spacer" />
        <div className="sidebar__user">
          <p className="sidebar__user-label">Usuário ativo</p>
          <p className="sidebar__user-name">{usuario ? `${usuario.nome} (id ${usuario.id})` : "—"}</p>
          <button type="button" className="sidebar__logout" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
