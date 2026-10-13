// src/components/BotaoPresencaNegra.tsx
//
// Botão "Presença Negra na Cidade" (pedido da autoria, 02/10/2026).
//
// Entra nas telas ao lado dos outros atalhos fixos: em Rotas e em Territórios,
// acima do botão Apoiadores; em "Antes de caminhar", logo depois dos botões da
// própria página.
//
// `jaExiste`: quando a página já tem um botão apontando para /presenca-negra
// (editado no painel), este não entra — para o visitante não ver dois botões
// iguais. Mesma regra do botão de contato.
//
// `texto`: o nome padrão do botão. Na página "A cidade de Vitória" ele sai por
// extenso — "Presença Negra na Cidade de Vitória" (pedido da autoria, 02/10/2026).
// O nome é editável no painel, na aba Botões (chave app_config.atalhos_paginas):
// `id` diz qual botão do grupo este é.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ATALHOS_PAGINAS, rotuloDe } from "../data/botoesDoApp";

export default function BotaoPresencaNegra({
  jaExiste = false,
  id = "presenca-negra",
  texto = "Presença Negra na Cidade",
}: {
  jaExiste?: boolean;
  id?: string;
  texto?: string;
}) {
  const { config } = useTerritorios();

  if (jaExiste) return null;

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/presenca-negra">
        {rotuloDe(config, CHAVE_ATALHOS_PAGINAS, id, texto)}
      </Link>
    </div>
  );
}
