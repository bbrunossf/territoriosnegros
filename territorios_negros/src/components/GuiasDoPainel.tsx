// GuiasDoPainel.tsx — a barra de guias da aba "Páginas" do painel.
//
// Fica logo acima do conteúdo, em todas as telas do grupo, para a autoria pular
// de uma parte para a outra sem voltar ao menu. A ordem vem de data/guiasDoPainel.ts.

// GuiasDoPainel.tsx — a barra de guias do painel.
//
// Fica logo abaixo do título da tela, no mesmo lugar das abas antigas de
// "Páginas" (pedido da autoria, 02/10/2026): é UMA barra só, sem duplicar.
// A ordem vem de data/guiasDoPainel.ts.
//
// `aoNavegar` é opcional: quem tem alterações não salvas passa uma função que
// devolve false para segurar a saída (a tela das Páginas usa isso).

import { Link, useLocation } from "react-router-dom";
import { GUIAS_DO_PAINEL, guiaAberta } from "../data/guiasDoPainel";

export default function GuiasDoPainel({ aoNavegar }: { aoNavegar?: () => boolean }) {
  const { pathname, search } = useLocation();
  const aberta = guiaAberta(pathname, search);

  return (
    <nav className="admin-abas admin-guias" aria-label="Guias do painel">
      {GUIAS_DO_PAINEL.map((guia) => (
        <Link
          key={guia.id}
          to={guia.rota}
          className={guia.id === aberta?.id ? "admin-guia admin-guia-ativa" : "admin-guia"}
          aria-current={guia.id === aberta?.id ? "page" : undefined}
          onClick={(e) => {
            if (aoNavegar && !aoNavegar()) e.preventDefault();
          }}
        >
          {guia.rotulo}
        </Link>
      ))}
    </nav>
  );
}
