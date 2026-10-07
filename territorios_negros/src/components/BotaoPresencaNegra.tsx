// src/components/BotaoPresencaNegra.tsx
//
// Botão "Presença Negra na Cidade" (pedido da autoria, 02/10/2026).
//
// Entra nas telas ao lado dos outros atalhos fixos: em Rotas e em Territórios,
// acima do botão Apoiadores; em "Antes de caminhar", logo depois dos botões da
// própria página.
//
// `jaExiste`: quando a página já tem um botão apontando para /presenca-negra
// (editado no painel), este não entra — para o visitante não ver dois botões
// iguais. Mesma regra do botão de contato.
import { Link } from "react-router-dom";

export default function BotaoPresencaNegra({ jaExiste = false }: { jaExiste?: boolean }) {
  if (jaExiste) return null;

  return (
    <div className="pagina-botoes">
      <Link className="btn pagina-botao" to="/presenca-negra">
        Presença Negra na Cidade
      </Link>
    </div>
  );
}
