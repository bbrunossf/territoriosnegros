// src/components/BotaoContato.tsx
// Botão de ação "Enviar uma mensagem" no fim das telas do app.
// Ligado/desligado e editado no painel (aba Páginas).

import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import {
  jaTemBotaoDeContato,
  normalizarBotaoContato,
  mostrarBotaoContato,
} from "../data/botaoContato";

export default function BotaoContato({
  tela,
  botoes,
}: {
  /** qual tela está pedindo o botão (ver TELAS_BOTAO) */
  tela: string;
  /** botões que a página já tem, para não repetir o mesmo convite */
  botoes?: { url?: string }[];
}) {
  const { config } = useTerritorios();

  if (!mostrarBotaoContato(tela, config.botao_contato)) return null;
  if (jaTemBotaoDeContato(botoes)) return null;

  const { texto } = normalizarBotaoContato(config.botao_contato);

  return (
    <div className="pagina-botoes botao-contato">
      <Link className="outline pagina-botao" to="/contato">
        {texto}
      </Link>
    </div>
  );
}
