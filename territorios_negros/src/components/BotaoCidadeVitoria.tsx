// src/components/BotaoCidadeVitoria.tsx
//
// Botão "A cidade de Vitória - ES" (pedido da autoria, 02/10/2026).
//
// Mesmo atalho que já existe na tela Territórios; em Rotas ele passa a abrir a
// lista de atalhos da página, ao lado do botão da Presença Negra na Cidade.
//
// `texto`: o nome do botão. No topo da página "Presença Negra na Cidade de
// Vitória" ele sai como "A cidade de Vitória" — o caminho de volta (02/10/2026).
import { Link } from "react-router-dom";

export default function BotaoCidadeVitoria({
  texto = "A cidade de Vitória - ES",
}: {
  texto?: string;
}) {
  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/vitoria">
        {texto}
      </Link>
    </div>
  );
}
