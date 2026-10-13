// src/components/BotaoApoiadores.tsx
//
// Botão para a página Apoiadores. Nome e telas vêm do painel (aba Botões).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";

export default function BotaoApoiadores() {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/apoiadores">
      {rotuloDoCatalogo(config, "apoiadores", "Apoiadores")}
    </Link>
  );
}
