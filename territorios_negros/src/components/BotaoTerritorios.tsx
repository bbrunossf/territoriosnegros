// src/components/BotaoTerritorios.tsx
//
// Botão para os Territórios. Nome e telas vêm do painel (aba Botões).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";

export default function BotaoTerritorios() {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/territorios">
      {rotuloDoCatalogo(config, "territorios", "Territórios")}
    </Link>
  );
}
