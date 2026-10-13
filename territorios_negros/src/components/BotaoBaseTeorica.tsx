// src/components/BotaoBaseTeorica.tsx
//
// Botão "Ir para base teórica" — aparece na página "A cidade de Vitória", entre
// o subtítulo e o botão que leva aos territórios (pedido da autoria, 02/10/2026).
//
// É fixo no app (não é item editável da página): depois de ler a apresentação da
// cidade, os dois caminhos naturais são a base teórica que sustenta a leitura e
// os territórios propriamente ditos.
// O NOME do botão é editável no painel, na aba Botões (grupo "Atalhos dentro das
// telas", chave app_config.atalhos_paginas).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ATALHOS_PAGINAS, rotuloDe } from "../data/botoesDoApp";

export default function BotaoBaseTeorica() {
  const { config } = useTerritorios();

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/conceito">
        {rotuloDe(config, CHAVE_ATALHOS_PAGINAS, "ir-para-base-teorica", "Ir para base teórica")}
      </Link>
    </div>
  );
}
