import "../styles.css";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminLayout() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Painel</h2>

        <Link to="/admin/territorios" className="admin-sidebar-btn">
          Territórios
        </Link>

        <Link to="/admin/roteiros" className="admin-sidebar-btn">
          Rotas
        </Link>

        <Link to="/admin/categorias" className="admin-sidebar-btn">
          Categorias
        </Link>

        <Link to="/admin/inicio" className="admin-sidebar-btn">
          Página inicial
        </Link>

        <Link to="/admin/paginas" className="admin-sidebar-btn">
          Páginas
        </Link>

        <Link to="/admin/mensagens" className="admin-sidebar-btn">
          Mensagens
        </Link>

        <Link to="/" className="admin-sidebar-btn">
          Ver o app
        </Link>

        <button onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
