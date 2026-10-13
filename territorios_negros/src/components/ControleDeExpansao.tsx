// ControleDeExpansao.tsx — o controle da autoria para permitir a expansão.
//
// Exclusivo da sessão administrativa: sem login, este componente não desenha
// NADA — o visitante nunca vê o controle. A preferência vale para o aparelho
// inteiro (todas as páginas de uma vez) e fica guardada no navegador, então
// sobrevive a navegações, recarregamentos e ao fechar o app.
//
// Por que no app e não só no painel: durante o tour a autoria está caminhando
// pelo app, não dentro do painel. Com a sessão aberta, ela liga e desliga a
// expansão na própria página que está lendo. O controle também aparece no
// painel (guia "Marcos e Conexões"), como pedido.

import { useEffect, useState } from "react";
import "../styles/marcos.css";
import { supabase } from "../lib/supabase";
import { useExpansao } from "../context/useExpansao";

export default function ControleDeExpansao() {
  const [sessao, setSessao] = useState(false);
  const [permitir, definir] = useExpansao();

  useEffect(() => {
    let ativo = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (ativo) setSessao(!!data.session);
      })
      .catch(() => {
        // sem rede: o controle simplesmente não aparece
      });

    const { data } = supabase.auth.onAuthStateChange((_evento, sessaoAtual) => {
      if (ativo) setSessao(!!sessaoAtual);
    });

    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // visitante (ou app fechado para manutenção): nada na tela
  if (!sessao) return null;

  return (
    <div className="controle-expansao" role="group" aria-label="Controle da autoria">
      <span className="controle-expansao-rotulo">Permitir expansão de Marcos e Conexões</span>

      <button
        type="button"
        className={permitir ? "controle-expansao-botao ligado" : "controle-expansao-botao"}
        aria-pressed={permitir}
        onClick={() => definir(!permitir)}
      >
        {permitir ? "Ligada" : "Desligada"}
      </button>
    </div>
  );
}
