import "../styles.css";
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchMensagens } from "../data/api";
import { dentroDasGuias } from "../data/guiasDoPainel";
import GuiasDoPainel from "./GuiasDoPainel";
import BarraSalvarFixa from "./BarraSalvarFixa";

const TITULO_PAINEL = "Painel · Territórios Negros";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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

        {/* A ordem aqui é a ordem do menu: o que a autoria usa durante o guia
            (mídia, botões e Marcos e Conexões), os conteúdos com lista própria
            (rotas e territórios) e, no fim, as ferramentas. Desde 02/10/2026 o
            resto — Página inicial, Apoiadores, Menu Mais, Personalidades e
            Categorias — vive DENTRO da aba "Páginas", como guias (pedido da
            autoria). "Botões" saiu das guias em 14/10/2026 e ficou aqui, entre
            Fotos e vídeos e Marcos e Conexões, porque é usado durante a
            caminhada, junto com os outros dois. */}
        <Link to="/admin/midias" className="admin-sidebar-btn">
          Fotos e vídeos
        </Link>

        <Link to="/admin/botoes" className="admin-sidebar-btn">
          Botões
        </Link>

        <Link to="/admin/marcos" className="admin-sidebar-btn">
          Marcos e Conexões
        </Link>

        <Link to="/admin/roteiros" className="admin-sidebar-btn">
          Rotas
        </Link>

        <Link to="/admin/territorios" className="admin-sidebar-btn">
          Territórios
        </Link>

        <Link to="/admin/paginas" className="admin-sidebar-btn">
          Páginas
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
        {/* A barra de guias aparece nas telas do grupo "Páginas" — na tela das
            Páginas ela é desenhada pela própria tela, logo abaixo do título
            (como eram as abas antigas), para não haver duas barras iguais. */}
        {pathname !== "/admin/paginas" && dentroDasGuias(pathname) && <GuiasDoPainel />}

        {naoLidas > 0 && (
          <p className="admin-aviso-mensagens">
            Você tem {naoLidas} {naoLidas > 1 ? "mensagens" : "mensagem"} ainda não{" "}
            {naoLidas > 1 ? "lidas" : "lida"}.{" "}
            <Link to="/admin/mensagens">abrir as mensagens</Link>
          </p>
        )}

        <Outlet />

        <BarraSalvarFixa />
      </main>
    </div>
  );
}
