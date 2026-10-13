// src/components/BottomNav.tsx
//
// Barra de navegação do app (fixa, no pé da tela).
//
// Itens fixos: Início · Vitória Negra · Conceito · Rotas · Territórios.
// O último item, "Mais", abre uma lista com as páginas que não têm item próprio
// na barra (ver data/menuPrincipal.ts) — antes só se chegava a elas navegando
// dentro de outras telas (pedido da autoria, 02/10/2026).
//
// "Antes de caminhar" saiu da barra e passou a viver dentro do "Mais", abrindo
// lugar para "Vitória Negra" — que leva à página Presença Negra na Cidade de
// Vitória (pedido da autoria, 02/10/2026).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_MENU_MAIS, NOME_DO_ITEM, itensDoMenu } from "../data/menuPrincipal";
import {
  CHAVE_BARRA_NAVEGACAO,
  CHAVE_ORDEM_BOTOES,
  lerOrdemDoGrupo,
  rotuloDe,
} from "../data/botoesDoApp";
import { ordenarIds } from "../utils/ordem";

export default function BottomNav() {
  const [aberto, setAberto] = useState(false);

  // a lista é montada pela autoria no painel (aba Menu Mais); sem nada gravado,
  // vale a lista padrão. O próximo evento só entra com evento agendado.
  const { config, proximoTour } = useTerritorios();
  const paginas = itensDoMenu(config[CHAVE_MENU_MAIS], !!proximoTour);

  // Os itens fixos da barra, na ordem que a autoria gravou (aba Botões, grupo
  // "Barra de navegação"). O "Mais" entra na ordem também — mas ele fecha a
  // lista de páginas, então nunca deixa de existir.
  const fixos = [
    { id: "/", caminho: "/", icone: "⌂", padrao: "Início" },
    { id: "/presenca-negra", caminho: "/presenca-negra", icone: "✦", padrao: "Vitória Negra" },
    { id: "/conceito", caminho: "/conceito", icone: "◎", padrao: "Conceito" },
    { id: "/roteiros", caminho: "/roteiros", icone: "▱", padrao: "Rotas" },
    { id: "/territorios", caminho: "/territorios", icone: "●", padrao: "Territórios" },
  ];

  const naOrdem = ordenarIds(
    [...fixos.map((f) => f.id), "mais"],
    lerOrdemDoGrupo(config[CHAVE_ORDEM_BOTOES], "barra")
  );

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

      <nav className="bottom-nav">
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
                ⋮<br />
                {rotuloDe(config, CHAVE_BARRA_NAVEGACAO, "mais", NOME_DO_ITEM)}
              </button>
            );
          }

          const item = fixos.find((f) => f.id === id);
          if (!item) return null;

          return (
            <Link
              key={item.id}
              to={item.caminho}
              className="bottom-nav-btn"
              onClick={() => setAberto(false)}
            >
              {item.icone}
              <br />
              {rotuloDe(config, CHAVE_BARRA_NAVEGACAO, item.id, item.padrao)}
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
