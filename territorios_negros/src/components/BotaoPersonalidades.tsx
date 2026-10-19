// src/components/BotaoPersonalidades.tsx
//
// Botão para a seção Personalidades. Nome e telas vêm do painel (aba Botões) —
// inclusive para pôr este botão em outras telas, não só na Vitória Negra.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";
import IconeDeBotao from "./IconeDeBotao";

export default function BotaoPersonalidades() {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/personalidades">
      <IconeDeBotao id="personalidades" />
      {rotuloDoCatalogo(config, "personalidades", "Personalidades")}
    </Link>
  );
}
