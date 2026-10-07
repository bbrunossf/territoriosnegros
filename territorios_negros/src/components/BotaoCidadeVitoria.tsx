// src/components/BotaoCidadeVitoria.tsx
//
// Botão "A cidade de Vitória - ES" (pedido da autoria, 02/10/2026).
//
// Mesmo atalho que já existe na tela Territórios; em Rotas ele passa a abrir a
// lista de atalhos da página, ao lado do botão da Presença Negra na Cidade.
import { Link } from "react-router-dom";

export default function BotaoCidadeVitoria() {
  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/vitoria">
        A cidade de Vitória - ES
      </Link>
    </div>
  );
}
