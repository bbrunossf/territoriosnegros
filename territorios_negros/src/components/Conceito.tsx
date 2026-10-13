import { useTerritorios } from "../context/useTerritorios";
import { CONCEITO_PADRAO, normalizarPagina } from "../data/paginas";
import { botoesDaPagina } from "../data/botoesPorTela";
import BotoesDaTela from "./BotoesDaTela";
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
    botoes: botoesDaPagina(config, "conceito", doPainel.botoes),
  };

  return (
    <PaginaConteudo
      pagina={pagina}
      tela="conceito"
      // o acesso ao TCC completo aparece também logo abaixo do título, e não só
      // no fim da página (pedido da autoria, 02/10/2026)
      rodapeNoTopo
      // botões escolhidos para o topo da Base teórica (aba Botões, "Em cada tela")
      depoisDoTitulo={<BotoesDaTela tela="conceito" posicao="topo" />}
    />
  );
}
