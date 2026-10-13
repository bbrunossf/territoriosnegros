// src/components/BotaoCidadeVitoria.tsx
//
// Botão "A cidade de Vitória - ES" (pedido da autoria, 02/10/2026).
//
// Mesmo atalho que já existe na tela Territórios; em Rotas ele passa a abrir a
// lista de atalhos da página, ao lado do botão da Presença Negra na Cidade.
//
// `texto`: o nome do botão. No topo da página "Presença Negra na Cidade de
// Vitória" ele sai como "A cidade de Vitória" — o caminho de volta (02/10/2026).
// O nome é editável no painel, na aba Botões (chave app_config.atalhos_paginas):
// `id` diz qual botão do grupo este é.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ATALHOS_PAGINAS, rotuloDe } from "../data/botoesDoApp";

export default function BotaoCidadeVitoria({
  id = "cidade-de-vitoria",
  texto = "A cidade de Vitória - ES",
}: {
  id?: string;
  texto?: string;
}) {
  const { config } = useTerritorios();

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/vitoria">
        {rotuloDe(config, CHAVE_ATALHOS_PAGINAS, id, texto)}
      </Link>
    </div>
  );
}
