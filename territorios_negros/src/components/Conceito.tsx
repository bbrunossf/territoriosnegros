import { useTerritorios } from "../context/useTerritorios";
import { CONCEITO_PADRAO, normalizarPagina } from "../data/paginas";
import { CHAVE_BOTOES_INTRO, botoesDaIntro, lerNomes } from "../data/botoesIntro";
import PaginaConteudo from "./PaginaConteudo";

// Texto editável no painel (aba Páginas) — chave: pagina_conceito
// Nomes dos botões do fim da página: painel, aba Botões — chave: botoes_intro
export default function Conceito() {
  const { config } = useTerritorios();
  const doPainel = normalizarPagina(config.pagina_conceito, CONCEITO_PADRAO);

  // Os mesmos seis botões de navegação do fim da tela "Antes de caminhar" fecham
  // esta página (pedido da autoria, 02/10/2026): Base teórica · A cidade de
  // Vitória · Presença Negra · Roteiros · Territórios · Apoiadores — e, depois
  // deles, separado por um respiro maior, o "Enviar uma mensagem". Ver
  // data/botoesIntro.ts (a mesma lista, com os nomes vindos do painel).
  const pagina = {
    ...doPainel,
    botoes: botoesDaIntro(doPainel.botoes, lerNomes(config[CHAVE_BOTOES_INTRO])),
  };

  return (
    <PaginaConteudo
      pagina={pagina}
      tela="conceito"
      // o acesso ao TCC completo aparece também logo abaixo do título, e não só
      // no fim da página (pedido da autoria, 02/10/2026)
      rodapeNoTopo
    />
  );
}
