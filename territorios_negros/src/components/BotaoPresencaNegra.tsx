// src/components/BotaoPresencaNegra.tsx
//
// Botão para a página Presença Negra na Cidade. Nome e telas vêm do painel
// (aba Botões); `id` diz qual botão do catálogo este é.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";

type Props = {
  id?: string;
  texto?: string;
};

export default function BotaoPresencaNegra({ id = "presenca-negra", texto }: Props) {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/presenca-negra">
      {texto?.trim() || rotuloDoCatalogo(config, id, "Presença Negra")}
    </Link>
  );
}
