// src/components/BotaoApoiadores.tsx
//
// Botão "Apoiadores" da tela "Antes de caminhar", logo depois do botão de contato
// (pedido da autoria, 02/10/2026).
//
// Ele só aparece quando existe pelo menos um apoiador visível: assim o visitante
// não cai numa página ainda vazia. Enquanto a lista estiver vazia, a autoria
// continua conseguindo abrir a página pelo endereço /apoiadores.
import { Link } from "react-router-dom";

import { useTerritorios } from "../context/useTerritorios";
import { CHAVE_APOIADORES, apoiadoresVisiveis, lerApoiadores } from "../data/apoiadores";

export default function BotaoApoiadores() {
  const { config } = useTerritorios();

  const lista = apoiadoresVisiveis(lerApoiadores(config[CHAVE_APOIADORES]));
  if (lista.length === 0) return null;

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/apoiadores">
        Apoiadores
      </Link>
    </div>
  );
}
