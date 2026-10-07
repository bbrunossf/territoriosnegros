import "../styles.css";
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchMensagens } from "../data/api";

const TITULO_PAINEL = "Painel · Territórios Negros";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [naoLidas, setNaoLidas] = useState(0);

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Aviso de mensagens por ler: contador na aba "Mensagens" e no título da
  // aba do navegador (assim o aviso aparece mesmo com o painel em segundo
  // plano). Confere sozinho a cada 30 segundos.
  useEffect(() => {
    let ativo = true;
    const tituloOriginal = document.title;

    async function contar() {
      try {
        const lista = await fetchMensagens();
        if (!ativo) return;

        const n = lista.filter((m) => !m.lida).length;
        setNaoLidas(n);
        document.title =
          n > 0 ? `(${n}) mensagem(ns) por ler · Painel` : TITULO_PAINEL;
      } catch {
        // sem permissão ou sem rede: o painel continua funcionando sem o aviso
      }
    }

    contar();
    const relogio = window.setInterval(contar, 30000);

    return () => {
      ativo = false;
      window.clearInterval(relogio);
      document.title = tituloOriginal;
    };
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Painel</h2>

        {/* A ordem aqui é a ordem do menu: primeiro o que a autoria usa durante
            o guia (mídia), depois conteúdo, depois as ferramentas do fim. */}
        <Link to="/admin/midias" className="admin-sidebar-btn">
          Fotos e vídeos
        </Link>

        <Link to="/admin/roteiros" className="admin-sidebar-btn">
          Rotas
        </Link>

        <Link to="/admin/territorios" className="admin-sidebar-btn">
          Territórios
        </Link>

        <Link to="/admin/inicio" className="admin-sidebar-btn">
          Página inicial
        </Link>

        <Link to="/admin/paginas" className="admin-sidebar-btn">
          Páginas
        </Link>

        <Link to="/admin/apoiadores" className="admin-sidebar-btn">
          Apoiadores
        </Link>

        <Link to="/admin/menu-mais" className="admin-sidebar-btn">
          Menu Mais
        </Link>

        <Link to="/admin/botoes" className="admin-sidebar-btn">
          Botões
        </Link>

        <Link to="/admin/categorias" className="admin-sidebar-btn">
          Categorias
        </Link>

        <Link to="/admin/mensagens" className="admin-sidebar-btn">
          Mensagens
          {naoLidas > 0 && <span className="admin-badge">{naoLidas}</span>}
        </Link>

        <Link to="/admin/manual" className="admin-sidebar-btn">
          Manual
        </Link>

        <Link to="/" className="admin-sidebar-btn">
          Ver o app
        </Link>

        <Link to="/admin/acessos" className="admin-sidebar-btn">
          Acessos
        </Link>

        <button onClick={sair}>
          Sair
        </button>
      </aside>

      <main className="admin-content">
        {naoLidas > 0 && (
          <p className="admin-aviso-mensagens">
            Você tem {naoLidas} {naoLidas > 1 ? "mensagens" : "mensagem"} ainda não{" "}
            {naoLidas > 1 ? "lidas" : "lida"}.{" "}
            <Link to="/admin/mensagens">abrir as mensagens</Link>
          </p>
        )}

        <Outlet />
      </main>
    </div>
  );
}
