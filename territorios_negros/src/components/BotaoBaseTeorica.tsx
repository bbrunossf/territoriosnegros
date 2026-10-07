// src/components/BotaoBaseTeorica.tsx
//
// Botão "Ir para base teórica" — aparece na página "A cidade de Vitória", entre
// o subtítulo e o botão que leva aos territórios (pedido da autoria, 02/10/2026).
//
// É fixo no app (não é item editável da página): depois de ler a apresentação da
// cidade, os dois caminhos naturais são a base teórica que sustenta a leitura e
// os territórios propriamente ditos.
import { Link } from "react-router-dom";

export default function BotaoBaseTeorica() {
  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/conceito">
        Ir para base teórica
      </Link>
    </div>
  );
}
