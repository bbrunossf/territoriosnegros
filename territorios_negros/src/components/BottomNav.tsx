// src/components/BottomNav.tsx
//
// Barra de navegação do app (fixa, no pé da tela).
//
// Itens fixos: Início · Vitória Negra · Conceito · Rotas · Territórios.
// O último item, "Mais", abre uma lista com as páginas que não têm item próprio
// na barra (ver data/menuPrincipal.ts).
//
// 14/10/2026 — legibilidade: os visitantes não percebiam o menu ("letra pequena,
// cor discreta, ícones quase imperceptíveis"). Os ícones eram **caracteres de
// texto** (⌂ ✦ ◎ ▱ ● ⋮) desenhados no mesmo corpo da legenda (10,5px), e por isso
// sumiam. Agora são **SVG** de 22px com traço 1,9, em dourado, a legenda subiu
// para 12,5px em negrito e o item da tela atual fica destacado.
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_MENU_MAIS, NOME_DO_ITEM, itensDoMenu } from "../data/menuPrincipal";
import {
  CHAVE_BARRA_NAVEGACAO,
  CHAVE_ORDEM_BOTOES,
  lerOrdemDoGrupo,
  rotuloDe,
} from "../data/botoesDoApp";
import { ordenarIds } from "../utils/ordem";

/** Ícones da barra: linha de 1,9 com pontas arredondadas, herdam a cor do botão. */
function Icone({ nome }: { nome: "inicio" | "vitoria" | "conceito" | "rotas" | "territorios" | "mais" }) {
  const comum = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
  };

  if (nome === "inicio") {
    return (
      <svg {...comum}>
        <path d="M3.5 10.8 12 3.8l8.5 7" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (nome === "vitoria") {
    return (
      <svg {...comum} fill="currentColor" stroke="none">
        <path d="M12 2.6l2.3 6.1 6.1 2.3-6.1 2.3L12 19.4l-2.3-6.1L3.6 11l6.1-2.3z" />
      </svg>
    );
  }

  if (nome === "conceito") {
    return (
      <svg {...comum}>
        <circle cx="12" cy="12" r="8.2" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (nome === "rotas") {
    return (
      <svg {...comum}>
        <path d="M6.5 17.5c0-3.4 3.2-3.6 5.5-3.6s5.5-.2 5.5-3.6" />
        <circle cx="6.5" cy="19" r="1.9" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="7.8" r="1.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (nome === "territorios") {
    return (
      <svg {...comum}>
        <path d="M12 21.2s-6.4-5.6-6.4-10.6a6.4 6.4 0 0 1 12.8 0c0 5-6.4 10.6-6.4 10.6z" />
        <circle cx="12" cy="10.4" r="2.4" />
      </svg>
    );
  }

  return (
    <svg {...comum}>
      <circle cx="12" cy="5.4" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.6" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function BottomNav() {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();

  // a lista é montada pela autoria no painel (aba Menu Mais); sem nada gravado,
  // vale a lista padrão. O próximo evento só entra com evento agendado.
  const { config, proximoTour } = useTerritorios();
  const paginas = itensDoMenu(config[CHAVE_MENU_MAIS], !!proximoTour);

  // Os itens fixos da barra, na ordem que a autoria gravou (aba Botões, grupo
  // "Barra de navegação"). O "Mais" entra na ordem também — mas ele fecha a
  // lista de páginas, então nunca deixa de existir.
  const fixos = [
    { id: "/", caminho: "/", icone: "inicio" as const, padrao: "Início" },
    {
      id: "/presenca-negra",
      caminho: "/presenca-negra",
      icone: "vitoria" as const,
      padrao: "Vitória Negra",
    },
    { id: "/conceito", caminho: "/conceito", icone: "conceito" as const, padrao: "Conceito" },
    { id: "/roteiros", caminho: "/roteiros", icone: "rotas" as const, padrao: "Rotas" },
    {
      id: "/territorios",
      caminho: "/territorios",
      icone: "territorios" as const,
      padrao: "Territórios",
    },
  ];

  const naOrdem = ordenarIds(
    [...fixos.map((f) => f.id), "mais"],
    lerOrdemDoGrupo(config[CHAVE_ORDEM_BOTOES], "barra")
  );

  /** o item da tela em que o visitante está — o que fica em destaque na barra */
  const ativo = (caminho: string) =>
    caminho === "/" ? pathname === "/" : pathname.startsWith(caminho);

  // Esc fecha a lista (teclado)
  useEffect(() => {
    if (!aberto) return;

    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };

    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberto]);

  // toque fora da barra também fecha — pega os casos que o fundo não cobre,
  // como o cabeçalho, que fica acima dele
  useEffect(() => {
    if (!aberto) return;

    const fora = (e: PointerEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && alvo.closest(".bottom-nav")) return;
      setAberto(false);
    };

    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
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

      <nav className="bottom-nav" aria-label="menu principal">
        {naOrdem.map((id) => {
          if (id === "mais") {
            return (
              <button
                key="mais"
                type="button"
                className="bottom-nav-btn bottom-nav-mais"
                aria-haspopup="true"
                aria-expanded={aberto}
                onClick={() => setAberto((v) => !v)}
              >
                <Icone nome="mais" />
                <span className="bottom-nav-rotulo">
                  {rotuloDe(config, CHAVE_BARRA_NAVEGACAO, "mais", NOME_DO_ITEM)}
                </span>
              </button>
            );
          }

          const item = fixos.find((f) => f.id === id);
          if (!item) return null;

          const estaAtivo = ativo(item.caminho);

          return (
            <Link
              key={item.id}
              to={item.caminho}
              className={`bottom-nav-btn${estaAtivo ? " bottom-nav-btn--ativo" : ""}`}
              aria-current={estaAtivo ? "page" : undefined}
              onClick={() => setAberto(false)}
            >
              <Icone nome={item.icone} />
              <span className="bottom-nav-rotulo">
                {rotuloDe(config, CHAVE_BARRA_NAVEGACAO, item.id, item.padrao)}
              </span>
            </Link>
          );
        })}

        {aberto && (
          <div className="bottom-nav-submenu" role="menu" aria-label="outras páginas">
            {paginas.map((pagina) => (
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
