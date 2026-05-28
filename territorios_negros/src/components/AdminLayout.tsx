import '../styles.css';
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: Props) {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();

    navigate("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Painel</h2>

        <button>
          Territórios
        </button>

        <button onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
