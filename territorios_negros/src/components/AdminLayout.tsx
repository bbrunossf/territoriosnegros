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
          Roteiros
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
