import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Toda troca de tela começa no topo.
 *
 * Sem isto, o "Próximo →" do percurso abria a página seguinte na mesma altura em
 * que a pessoa tinha parado: para o navegador é a MESMA página (só o endereço
 * mudou), então ele mantém a rolagem anterior. Era o caso de rolar o território
 * até o fim e cair no próximo já no rodapé.
 *
 * - A chave (`key`) da navegação muda a cada troca de tela — inclusive de um
 *   território para o outro dentro da mesma rota e ao voltar.
 * - `useLayoutEffect` roda antes de o navegador desenhar: a página já aparece
 *   no topo, sem aquele pulo visível.
 * - A janela é quem rola neste app (o `.phone` não é área de rolagem, de
 *   propósito, para o Header e a barra Voltar/Próximo ficarem presos); ainda
 *   assim zeramos também o elemento raiz e o body, que é o que alguns
 *   navegadores de celular usam.
 */
export default function ScrollParaTopo() {
  const { key } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [key]);

  return null;
}
