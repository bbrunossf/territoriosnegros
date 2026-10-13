// useExpansao.ts — a preferência de expansão de "Marcos e Conexões".
//
// Vale para o aparelho inteiro (todas as páginas de uma vez) e fica guardada no
// navegador: sobrevive a navegações, recarregamentos e ao fechar o app. No
// primeiro uso, começa desabilitada.
//
// A seção do app e o controle da autoria usam este mesmo gancho, então tudo
// reage na mesma hora — inclusive quando a preferência muda em outra aba.

import { useEffect, useState } from "react";
import { EVENTO_EXPANSAO, guardarExpansao, lerExpansao } from "../data/marcos";

export function useExpansao(): [boolean, (permitir: boolean) => void] {
  const [permitir, setPermitir] = useState(() => lerExpansao());

  useEffect(() => {
    const ouvir = () => setPermitir(lerExpansao());

    window.addEventListener(EVENTO_EXPANSAO, ouvir);

    return () => window.removeEventListener(EVENTO_EXPANSAO, ouvir);
  }, []);

  const definir = (valor: boolean) => {
    guardarExpansao(valor);
    setPermitir(valor);
    window.dispatchEvent(new Event(EVENTO_EXPANSAO));
  };

  return [permitir, definir];
}

export default useExpansao;
