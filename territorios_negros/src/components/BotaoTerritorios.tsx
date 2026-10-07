// src/components/BotaoTerritorios.tsx
//
// Botão "Ir para os territórios" — aparece na página "A cidade de Vitória",
// logo abaixo do subtítulo (pedido da autoria, 02/10/2026).
//
// É fixo no app (não é item editável da página): a página da cidade é uma
// apresentação e, dali, o passo natural é descer para os territórios.
// O texto das páginas continua editável no painel (aba Páginas) — este botão é
// um atalho de navegação, como o item "Mais" da barra.
import { Link } from "react-router-dom";

export default function BotaoTerritorios() {
  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/territorios">
        Ir para os territórios
      </Link>
    </div>
  );
}
