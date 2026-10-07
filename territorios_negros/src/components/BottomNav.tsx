// src/components/BottomNav.tsx
//
// Barra de navegação do app (fixa, no pé da tela).
//
// Itens fixos: Início · Antes · Conceito · Rotas · Territórios.
// O último item, "Mais", abre uma lista com as páginas que não têm item próprio
// na barra (ver data/menuPrincipal.ts) — antes só se chegava a elas navegando
// dentro de outras telas (pedido da autoria, 02/10/2026).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { NOME_DO_ITEM, PAGINAS_DO_MENU } from "../data/menuPrincipal";

export default function BottomNav() {
  const [aberto, setAberto] = useState(false);

  // Esc fecha a lista (teclado)
  useEffect(() => {
    if (!aberto) return;

    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };

    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  return (
    <>
      {/* toque fora da lista fecha (fica atrás dela, cobrindo a tela) */}
      {aberto && (
        <button
          type="button"
          className="bottom-nav-fundo"
          aria-label="fechar a lista de páginas"
          onClick={() => setAberto(false)}
        />
      )}

      <nav className="bottom-nav">
        <Link to="/" className="bottom-nav-btn">
          ⌂<br />
          Início
        </Link>

        <Link to="/intro" className="bottom-nav-btn">
          ⟲<br />
          Antes
        </Link>

        <Link to="/conceito" className="bottom-nav-btn">
          ◎<br />
          Conceito
        </Link>

        <Link to="/roteiros" className="bottom-nav-btn">
          ▱<br />
          Rotas
        </Link>

        <Link to="/territorios" className="bottom-nav-btn">
          ●<br />
          Territórios
        </Link>

        <button
          type="button"
          className="bottom-nav-btn bottom-nav-mais"
          aria-haspopup="true"
          aria-expanded={aberto}
          onClick={() => setAberto((v) => !v)}
        >
          ⋮<br />
          {NOME_DO_ITEM}
        </button>

        {aberto && (
          <div className="bottom-nav-submenu" role="menu" aria-label="outras páginas">
            {PAGINAS_DO_MENU.map((pagina) => (
              <Link
                key={pagina.caminho}
                to={pagina.caminho}
                role="menuitem"
                onClick={() => setAberto(false)}
              >
                <span className="bottom-nav-submenu-icone">{pagina.icone}</span>
                {pagina.nome}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
