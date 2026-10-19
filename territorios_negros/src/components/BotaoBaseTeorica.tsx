// src/components/BotaoBaseTeorica.tsx
//
// Botão para a Base teórica. É um botão do catálogo de navegação: o nome vem do
// painel (aba Botões) e a seção "Em cada tela" decide em que telas ele aparece.
// Não desenha moldura própria — quem agrupa é o BotoesDaTela.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";
import IconeDeBotao from "./IconeDeBotao";

export default function BotaoBaseTeorica() {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/conceito">
      <IconeDeBotao id="base-teorica" />
      {rotuloDoCatalogo(config, "base-teorica", "Base teórica")}
    </Link>
  );
}
