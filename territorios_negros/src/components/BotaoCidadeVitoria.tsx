// src/components/BotaoCidadeVitoria.tsx
//
// Botão para A cidade de Vitória. O nome vem do painel (aba Botões); `id` diz
// qual botão do catálogo este é (aceita os ids antigos, por compatibilidade).
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { rotuloDoCatalogo } from "../data/botoesPorTela";

type Props = {
  id?: string;
  texto?: string;
};

export default function BotaoCidadeVitoria({ id = "cidade-de-vitoria", texto }: Props) {
  const { config } = useTerritorios();

  return (
    <Link className="btn pagina-botao" to="/vitoria">
      {texto?.trim() || rotuloDoCatalogo(config, id, "A cidade de Vitória")}
    </Link>
  );
}
