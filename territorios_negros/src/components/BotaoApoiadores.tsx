// src/components/BotaoApoiadores.tsx
//
// Botão para a página Apoiadores. Nome e telas vêm do painel (aba Botões).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";
import IconeDeBotao from "./IconeDeBotao";

export default function BotaoApoiadores() {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/apoiadores">
      <IconeDeBotao id="apoiadores" />
      {rotuloDoCatalogo(config, "apoiadores", "Apoiadores")}
    </Link>
  );
}
