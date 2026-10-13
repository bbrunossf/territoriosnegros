// src/components/BotaoPersonalidades.tsx
//
// Botão "Personalidades" — a porta para a seção de personalidades negras, dentro
// da página Vitória Negra (pedido da autoria, 02/10/2026).
//
// É fixo no app como os outros atalhos, e o NOME é editável no painel, na aba
// Botões (grupo "Atalhos dentro das telas", chave app_config.atalhos_paginas).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ATALHOS_PAGINAS, rotuloDe } from "../data/botoesDoApp";

export default function BotaoPersonalidades() {
  const { config } = useTerritorios();

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/personalidades">
        {rotuloDe(config, CHAVE_ATALHOS_PAGINAS, "personalidades", "Personalidades")}
      </Link>
    </div>
  );
}
