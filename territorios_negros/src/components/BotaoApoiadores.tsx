// src/components/BotaoApoiadores.tsx
//
// Botão "Apoiadores" — quem apoia o projeto (pedido da autoria, 02/10/2026).
//
// Ele aparece em três telas, sempre no estilo das chamadas principais do app:
//   · "Antes de caminhar" — abaixo do botão "Enviar uma mensagem";
//   · "Territórios" — acima do botão "A cidade de Vitória - ES";
//   · "Rotas" — abaixo do subtítulo da página.
//
// Aparece SEMPRE (mesmo sem ninguém cadastrado): a autoria precisa do acesso
// visível para conferir e mostrar. A página, enquanto estiver vazia, explica que
// ainda não há apoiadores e convida instituições a escrever.
//
// É fixo no app (não é item editável da página): o endereço é sempre
// /apoiadores, e o conteúdo de lá é que é montado no painel, na aba Apoiadores.
// O NOME do botão é editável no painel, na aba Botões (grupo "Atalhos dentro das
// telas", chave app_config.atalhos_paginas).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_ATALHOS_PAGINAS, rotuloDe } from "../data/botoesDoApp";

export default function BotaoApoiadores() {
  const { config } = useTerritorios();

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/apoiadores">
        {rotuloDe(config, CHAVE_ATALHOS_PAGINAS, "apoiadores", "Apoiadores")}
      </Link>
    </div>
  );
}
